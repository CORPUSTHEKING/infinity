#!/usr/bin/env python3
"""Preview surface: render preview payloads to stdout (minimal)."""
from __future__ import annotations
import logging
from typing import Dict, Any

_log = logging.getLogger("infinity.preview")

def render(preview_payload: Dict[str, Any]) -> None:
    """Render a preview payload (IMF preview schema) to stdout."""
    try:
        items = preview_payload.get("items", [])
        print()
        print("=== Infinity Preview ===")
        for it in items:
            title = it.get("title") or it.get("name") or "(untitled)"
            body = it.get("body") or it.get("short") or ""
            print(f"\n> {title}")
            if body:
                print(f"  {body}")
            examples = it.get("examples") or []
            if examples:
                print("  examples:")
                for ex in examples[:3]:
                    print(f"    $ {ex}")
        print()
    except Exception:
        _log.exception("preview render failure")
