#!/usr/bin/env bash
set -euo pipefail

# Run this from the parent directory that contains INFINITY/
# e.g. if you are at ~ : bash INFINITY/runtime_bootstrap.sh
BASE="INFINITY/runtime"
mkdir -p "${BASE}/core" "${BASE}/imf/schemas" "${BASE}/plugins" "${BASE}/adapters" "${BASE}/interfaces" "${BASE}/data"

############################
# 1) transport_bus.py
############################
cat <<'EOF' > "${BASE}/core/transport_bus.py"
#!/usr/bin/env python3
\"\"\"Simple in-process Transport/Event Bus.

Responsibilities:
- subscribe(event, handler)
- emit(event, envelope)
No IO or threads at import time.
\"\"\"

from __future__ import annotations
import logging
from typing import Callable, Dict, List, Any

Logger = logging.Logger
_log = logging.getLogger("infinity.transport_bus")

EventHandler = Callable[[Dict[str, Any]], None]

class TransportBus:
    \"\"\"In-memory pub/sub transport bus.\"\"\"
    def __init__(self, logger: Logger | None = None) -> None:
        self._logger = logger or _log
        self._subscribers: Dict[str, List[EventHandler]] = {}

    def subscribe(self, event_type: str, handler: EventHandler) -> None:
        self._subscribers.setdefault(event_type, []).append(handler)
        self._logger.debug(\"subscribed\", extra={\"event_type\": event_type, \"handler\": repr(handler)})

    def emit(self, event_type: str, envelope: Dict[str, Any]) -> None:
        handlers = list(self._subscribers.get(event_type, []))
        self._logger.info(\"emit\", extra={\"event_type\": event_type, \"handlers\": len(handlers), \"id\": envelope.get(\"id\")})
        for h in handlers:
            try:
                h(envelope)
            except Exception:
                self._logger.exception(\"handler failure\", extra={\"event_type\": event_type, \"handler\": repr(h)})
EOF

############################
# 2) capability_registry.py
############################
cat <<'EOF' > "${BASE}/core/capability_registry.py"
#!/usr/bin/env python3
\"\"\"Capability registry: track plugin capabilities and metadata.\"\"\"

from __future__ import annotations
import logging
from typing import Dict, List, Any

_log = logging.getLogger(\"infinity.capability_registry\")

class CapabilityRegistry:
    def __init__(self, logger: logging.Logger | None = None) -> None:
        self._logger = logger or _log
        self._plugins: Dict[str, Dict[str, Any]] = {}  # plugin_id -> meta
        self._capability_index: Dict[str, List[str]] = {}  # capability -> [plugin_id]

    def register_plugin(self, plugin_id: str, capabilities: List[str], meta: Dict[str, Any] | None = None) -> None:
        meta = meta or {}
        self._plugins[plugin_id] = {"capabilities": list(capabilities), "meta": meta}
        for c in capabilities:
            self._capability_index.setdefault(c, []).append(plugin_id)
        self._logger.info(\"plugin_registered\", extra={\"plugin_id\": plugin_id, \"capabilities\": capabilities})

    def get_providers(self, capability: str) -> List[str]:
        return list(self._capability_index.get(capability, []))

    def list_plugins(self) -> Dict[str, Dict[str, Any]]:
        return dict(self._plugins)
EOF

############################
# 3) context_manager.py
############################
cat <<'EOF' > "${BASE}/core/context_manager.py"
#!/usr/bin/env python3
\"\"\"Simple context manager for interactive sessions.\"\"\"

from __future__ import annotations
import logging
import uuid
import time
from typing import Dict, Any

_log = logging.getLogger(\"infinity.context_manager\")

class ContextManager:
    def __init__(self, logger: logging.Logger | None = None) -> None:
        self._logger = logger or _log
        self._contexts: Dict[str, Dict[str, Any]] = {}

    def create(self, base: Dict[str, Any] | None = None) -> str:
        ctx_id = str(uuid.uuid4())
        now = int(time.time())
        ctx = {
            \"id\": ctx_id,
            \"created_at\": now,
            \"last_updated\": now,
            \"data\": base or {}
        }
        self._contexts[ctx_id] = ctx
        self._logger.debug(\"context_created\", extra={\"context_id\": ctx_id})
        return ctx_id

    def get(self, context_id: str) -> Dict[str, Any] | None:
        return self._contexts.get(context_id)

    def touch(self, context_id: str) -> None:
        ctx = self._contexts.get(context_id)
        if ctx:
            ctx[\"last_updated\"] = int(time.time())
            self._logger.debug(\"context_touched\", extra={\"context_id\": context_id})
EOF

############################
# 4) preview.py
############################
cat <<'EOF' > "${BASE}/core/preview.py"
#!/usr/bin/env python3
\"\"\"Preview surface: render preview payloads to stdout (minimal).\"\"\"

from __future__ import annotations
import json
import logging
from typing import Dict, Any

_log = logging.getLogger(\"infinity.preview\")

def render(preview_payload: Dict[str, Any]) -> None:
    \"\"\"Render a preview payload (IMF preview schema) to stdout.\"\"\"
    try:
        items = preview_payload.get(\"items\", [])
        print()  # spacer
        print(\"=== Infinity Preview ===\")
        for it in items:
            title = it.get(\"title\") or it.get(\"name\") or \"(untitled)\"
            body = it.get(\"body\") or it.get(\"short\") or \"\"
            print(f\"\\n> {title}\") 
            print(f\"  {body}\")
            examples = it.get(\"examples\") or []
            if examples:
                print(\"  examples:\")
                for ex in examples[:3]:
                    print(f\"    $ {ex}\")
        print(\"\".join([\"\\n\"]))  # trailing newline
    except Exception:
        _log.exception(\"preview render failure\")
EOF

############################
# 5) plugin_loader.py
############################
cat <<'EOF' > "${BASE}/core/plugin_loader.py"
#!/usr/bin/env python3
\"\"\"Dynamic plugin loader.

Plugin contract (minimal):
- a plugin module must provide `def register(bus, router, registry, context_mgr, logger)` function
- register should call bus.subscribe(...) and registry.register_plugin(...)
\"\"\"

from __future__ import annotations
import importlib.util
import importlib.machinery
import logging
import os
from typing import Optional

_log = logging.getLogger(\"infinity.plugin_loader\")

class PluginLoader:
    def __init__(self, plugin_dir: str, logger: logging.Logger | None = None) -> None:
        self.plugin_dir = plugin_dir
        self._logger = logger or _log
        self._loaded = {}

    def discover_plugins(self) -> list[str]:
        if not os.path.isdir(self.plugin_dir):
            return []
        return [f for f in os.listdir(self.plugin_dir) if f.endswith('.py') and not f.startswith('_')]

    def load_all(self, bus, router, registry, context_mgr) -> None:
        for fname in self.discover_plugins():
            path = os.path.join(self.plugin_dir, fname)
            plugin_id = os.path.splitext(fname)[0]
            try:
                spec = importlib.util.spec_from_file_location(plugin_id, path)
                mod = importlib.util.module_from_spec(spec)
                loader = spec.loader
                assert loader is not None
                loader.exec_module(mod)
                if hasattr(mod, \"register\") and callable(mod.register):
                    mod.register(bus=bus, router=router, registry=registry, context_mgr=context_mgr, logger=logging.getLogger(f\"plugin.{plugin_id}\"))
                    self._loaded[plugin_id] = path
                    self._logger.info(\"plugin_loaded\", extra={\"plugin_id\": plugin_id, \"path\": path})
                else:
                    self._logger.warning(\"plugin_missing_register\", extra={\"plugin_id\": plugin_id, \"path\": path})
            except Exception:
                self._logger.exception(\"plugin_load_failed\", extra={\"plugin\": fname})

    def list_loaded(self):
        return dict(self._loaded)
EOF

############################
# 6) imf_router.py
############################
cat <<'EOF' > "${BASE}/core/imf_router.py"
#!/usr/bin/env python3
\"\"\"IMF router: basic envelope validation and routing.

- validate basic envelope keys
- route 'query' envelopes to 'event.query'
- listen for 'event.candidates' (from plugins) and forward to preview.render via 'event.preview'
- handle preview_request envelopes (type == 'preview_request') to 'event.preview_request'
\"\"\"

from __future__ import annotations
import logging
import time
import uuid
from typing import Dict, Any

_log = logging.getLogger(\"infinity.imf_router\")

REQUIRED_ENVELOPE_KEYS = {\"imf_version\", \"type\", \"id\", \"origin\", \"timestamp\", \"payload\"}

class IMFRouter:
    def __init__(self, bus, preview_renderer, registry, context_mgr, logger: logging.Logger | None = None) -> None:
        self.bus = bus
        self.preview = preview_renderer
        self.registry = registry
        self.context_mgr = context_mgr
        self._logger = logger or _log

        # subscribe to plugin candidate events so router can forward to preview surface
        self.bus.subscribe(\"event.candidates\", self._on_candidates)

    def validate_envelope(self, env: Dict[str, Any]) -> bool:
        missing = [k for k in REQUIRED_ENVELOPE_KEYS if k not in env]
        if missing:
            self._logger().error(\"envelope_missing_keys\", extra={\"missing\": missing, \"id\": env.get(\"id\")})
            return False
        return True

    def _logger(self) -> logging.Logger:
        return self._logger

    def handle_envelope(self, env: Dict[str, Any]) -> None:
        \"\"\"Entry point: accept an envelope dict.\"\"\        # light validation
        if not isinstance(env, dict):
            self._logger().error(\"invalid_envelope_type\", extra={\"type\": type(env)})
            return
        if not REQUIRED_ENVELOPE_KEYS.issubset(env.keys()):
            self._logger().error(\"envelope_validation_failed\", extra={\"present_keys\": list(env.keys())})
            # respond with an error envelope if needed - minimal behaviour here
            return

        mtype = env.get(\"type\")
        ctx = env.get(\"context_id\") or self.context_mgr.create()
        # route known types
        if mtype == \"query\":
            # normalize into event.query payload
            q_payload = {
                \"id\": env.get(\"id\"),
                \"origin\": env.get(\"origin\"),
                \"context_id\": ctx,
                \"timestamp\": env.get(\"timestamp\"),
                \"query\": env[\"payload\"].get(\"query\"),
                \"mode\": env[\"payload\"].get(\"mode\", \"interactive\")
            }
            # emit to plugins
            self.bus.emit(\"event.query\", q_payload)
            self._logger().info(\"routed_query\", extra={\"query\": q_payload.get(\"query\"), \"context_id\": ctx})
        elif mtype == \"preview_request\":
            token = env[\"payload\"].get(\"preview_token\")
            if token:
                self.bus.emit(\"event.preview_request\", {\"preview_token\": token, \"context_id\": ctx})
        else:
            # Unknown type: emit generic event
            self.bus.emit(f\"event.{mtype}\", env)
            self._logger().debug(\"routed_generic\", extra={\"type\": mtype})

    def _on_candidates(self, candidate_envelope: Dict[str, Any]) -> None:
        # candidate_envelope expected shape: { 'candidates': [...], 'context_id': '...'}
        try:
            # forward to preview renderer as preview payload (simple mapping)
            preview_payload = {
                \"preview_token\": f\"preview:{str(uuid.uuid4())}\",
                \"items\": [ {\"title\": c.get(\"title\"), \"body\": c.get(\"short\"), \"examples\": c.get(\"meta\", {}).get(\"examples\", []) } for c in candidate_envelope.get(\"candidates\", []) ],
                \"meta\": {\"origin\": candidate_envelope.get(\"origin\") }
            }
            # also emit event.preview so other surfaces could consume
            self.bus.emit(\"event.preview\", {\"preview_payload\": preview_payload, \"context_id\": candidate_envelope.get(\"context_id\")})
            # render to default preview surface synchronously
            self.preview.render(preview_payload)
        except Exception:
            self._logger().exception(\"failed_handle_candidates\")
EOF

############################
# 7) IMF schemas (envelope, query, candidates, preview)
############################
cat <<'EOF' > "${BASE}/imf/schemas/envelope.v1.json"
{
  "$id": "imf/envelope.v1.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Infinity Message Envelope v1",
  "type": "object",
  "required": ["imf_version","type","id","origin","timestamp","payload"],
  "properties": {
    "imf_version": { "type":"string" },
    "type": { "type":"string" },
    "id": { "type":"string" },
    "origin": { "type":"string" },
    "context_id": { "type":["string","null"] },
    "timestamp": { "type":"integer" },
    "payload": { "type":"object" },
    "meta": { "type":"object" }
  },
  "additionalProperties": false
}
EOF

cat <<'EOF' > "${BASE}/imf/schemas/query.v1.json"
{
  "$id":"imf/query.v1.json",
  "type":"object",
  "required":["query"],
  "properties":{
    "query":{"type":"string"},
    "mode":{"type":"string"},
    "filters":{"type":"object"}
  },
  "additionalProperties": false
}
EOF

cat <<'EOF' > "${BASE}/imf/schemas/candidates.v1.json"
{
  "$id":"imf/candidates.v1.json",
  "type":"object",
  "required":["candidates"],
  "properties":{
    "candidates":{
      "type":"array",
      "items":{
        "type":"object",
        "required":["key","type","title","short"],
        "properties":{
          "key":{"type":"string"},
          "type":{"type":"string"},
          "title":{"type":"string"},
          "short":{"type":"string"},
          "score":{"type":"number"},
          "preview_token":{"type":"string"},
          "meta":{"type":"object"}
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
EOF

cat <<'EOF' > "${BASE}/imf/schemas/preview.v1.json"
{
  "$id":"imf/preview.v1.json",
  "type":"object",
  "required":["preview_token","items"],
  "properties":{
    "preview_token": { "type":"string" },
    "items": {
      "type":"array",
      "items": {
        "type":"object",
        "required": ["title","body"],
        "properties": {
          "title":{"type":"string"},
          "body":{"type":"string"},
          "fields":{"type":"object"},
          "examples":{"type":"array","items":{"type":"string"}},
          "meta":{"type":"object"}
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
EOF

############################
# 8) example_search plugin
############################
cat <<'EOF' > "${BASE}/plugins/example_search.py"
#!/usr/bin/env python3
\"\"\"Example minimal search plugin.

Contract:
- implement register(bus, router, registry, context_mgr, logger)
- subscribe to 'event.query' and respond by emitting 'event.candidates'
\"\"\"

from __future__ import annotations
import logging
import time
from typing import Dict, Any

def register(bus, router, registry, context_mgr, logger: logging.Logger | None = None):
    log = logger or logging.getLogger(\"plugin.example_search\")
    # declare capability (not via message here: use registry)
    registry.register_plugin(plugin_id=\"example_search\", capabilities=[\"search.basic\"], meta={\"version\":\"0.1\"})

    def on_query(payload: Dict[str, Any]) -> None:
        q = payload.get(\"query\", \"\")
        ctx = payload.get(\"context_id\")
        log.info(\"received_query\", extra={\"query\": q, \"context\": ctx})
        # static sample response - production plugins will implement real search/adapters
        candidates = [
            {\"key\":\"command:sed\",\"type\":\"command\",\"title\":\"sed\",\"short\":\"Stream editor (example)\",\"score\":0.9, \"meta\": {\"examples\": [\"sed 's/[[:space:]]//g' file\"]}},
            {\"key\":\"command:awk\",\"type\":\"command\",\"title\":\"awk\",\"short\":\"Pattern scanning and processing language (example)\",\"score\":0.6, \"meta\": {\"examples\": [\"awk '{print $1}' file\"]}}
        ]
        # emit as plugin output
        bus.emit(\"event.candidates\", {\"candidates\": candidates, \"context_id\": ctx, \"origin\": \"plugin.example_search\"})

    bus.subscribe(\"event.query\", on_query)
EOF

############################
# 9) cli.py (entrypoint)
############################
cat <<'EOF' > "${BASE}/cli.py"
#!/usr/bin/env python3
\"\"\"Minimal CLI that boots the skeleton and accepts queries.

Usage:
  python runtime/cli.py
Type a query and press enter. Type :quit to exit.
\"\"\"

from __future__ import annotations
import logging
import time
import json
import uuid
import os
import sys

# import core components (no import-time side-effects in those modules)
from core.transport_bus import TransportBus
from core.plugin_loader import PluginLoader
from core.capability_registry import CapabilityRegistry
from core.context_manager import ContextManager
from core.imf_router import IMFRouter
import core.preview as preview_module

LOG = logging.getLogger(\"infinity.cli\")

def setup_logging():
    # Minimal structured logging to stderr
    fmt = '{\"ts\":\"%(asctime)s\",\"level\":\"%(levelname)s\",\"name\":\"%(name)s\",\"msg\":\"%(message)s\"}'
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(logging.Formatter(fmt))
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(handler)

def make_envelope(query: str, origin: str = \"runtime.cli\", context_id: str | None = None):
    return {
        \"imf_version\": \"1.0.0\",
        \"type\": \"query\",
        \"id\": str(uuid.uuid4()),
        \"origin\": origin,
        \"context_id\": context_id,
        \"timestamp\": int(time.time()),
        \"payload\": {\"query\": query, \"mode\": \"interactive\"}
    }

def start():
    setup_logging()
    LOG.info(\"starting_infinity_skeleton\")
    base = os.path.dirname(__file__) or \".\"
    # Build components
    bus = TransportBus()
    registry = CapabilityRegistry()
    ctxmgr = ContextManager()
    # router needs preview renderer and registry/context
    router = IMFRouter(bus=bus, preview_renderer=preview_module, registry=registry, context_mgr=ctxmgr)
    # plugin loader
    plugin_dir = os.path.join(os.path.dirname(__file__), \"plugins\")
    loader = PluginLoader(plugin_dir, logger=logging.getLogger(\"plugin_loader\"))
    loader.load_all(bus=bus, router=router, registry=registry, context_mgr=ctxmgr)

    LOG.info(\"plugins_loaded\", extra={\"loaded\": loader.list_loaded()})
    context_id = ctxmgr.create()

    print(\"Infinity (skeleton) ready. Type a query; ':quit' to exit.\")

    while True:
        try:
            q = input(\"∞ \").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not q:
            continue
        if q in (\":quit\", \":exit\"):
            break
        # Build envelope and hand to router
        env = make_envelope(q, context_id=context_id)
        # router.handle_envelope will emit event.query -> plugins -> event.candidates -> preview
        router.handle_envelope(env)

    LOG.info(\"shutting_down\")

if __name__ == \"__main__\":
    start()
EOF

chmod +x "${BASE}/cli.py"
chmod +x "${BASE}/plugins/example_search.py"

############################
# 10) README / starter note
############################
cat <<'EOF' > "${BASE}/README.md"
Infinity runtime skeleton (minimal)

Run from repo root:
  python INFINITY/runtime/cli.py

What it does:
- boots an in-process transport bus
- loads plugins from INFINITY/runtime/plugins (example_search provided)
- validates basic IMF envelope fields (light validation)
- routes 'query' envelopes to 'event.query'
- example plugin responds with static candidates
- router forwards candidates to the preview renderer

Next steps:
- replace example_search with real adapters (manpage, filesystem, history)
- add JSON Schema validation using jsonschema (optional)
- implement IPC transport (UNIX socket) if you need external CLI -> core separation
EOF

echo "Infinity runtime skeleton created at ${BASE}."
echo "To run: python ${BASE}/cli.py"
