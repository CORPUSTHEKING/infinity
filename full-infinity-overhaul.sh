#!/usr/bin/env bash
# ==============================================================================
# SCRIPT HEADER - TOTAL INFINITY ECOSYSTEM OVERHAUL
# ==============================================================================
export SCRIPT_NAME="infinity-total-migration"

# 1. Load System Infrastructure
source "$TOOLS_ROOT/etc/log/logging.conf"

# 2. MANDATORY: Redirect all sub-command noise to Dev Log
exec 2>> "$ERR_FILE"

ROOT="$(pwd)"
LEGACY="$ROOT/infinity-web-legacy"
NEW="$ROOT/infinity-web"

echo "### [1/5] Architectural Scaffolding ###"
mkdir -p "$NEW/src/assets/legacy/components"
mkdir -p "$NEW/src/assets/legacy/pages"
mkdir -p "$NEW/src/lib"
mkdir -p "$NEW/public/legacy-assets/payloads"
mkdir -p "$NEW/public/data"
mkdir -p "$NEW/public/config"
mkdir -p "$NEW/scripts/legacy-tools"

echo "### [2/5] Asset & Logic Migration ###"
# Move CSS/JS to src for Vite processing
cp -rv "$LEGACY/assets/css" "$NEW/src/assets/legacy/" >> "$DEV_FILE"
cp -rv "$LEGACY/assets/js" "$NEW/src/assets/legacy/" >> "$DEV_FILE"
cp -rv "$LEGACY/components/"* "$NEW/src/assets/legacy/components/" >> "$DEV_FILE"
cp -rv "$LEGACY/pages/"* "$NEW/src/assets/legacy/pages/" >> "$DEV_FILE"

# Move Static blobs to public
cp -rv "$LEGACY/assets/payloads/"* "$NEW/public/legacy-assets/payloads/" >> "$DEV_FILE"
cp -rv "$LEGACY/data/"* "$NEW/public/data/" >> "$DEV_FILE"
cp -rv "$LEGACY/config/"* "$NEW/public/config/" >> "$DEV_FILE"

# Move and Refactor Tools
cp -rv "$LEGACY/tools/"* "$NEW/scripts/legacy-tools/" >> "$DEV_FILE"
chmod +x "$NEW/scripts/legacy-tools/"*.sh

echo "### [3/5] Deep Refactoring (Sed Sweep) ###"
# Fix internal paths in legacy JS/CSS to point to the new public data/config locations
# We change ../data/ to /data/ and ../config/ to /config/ because they are now in Astro's public root
find "$NEW/src/assets/legacy" -type f \( -name "*.js" -o -name "*.css" -o -name "*.mjs" \) -exec sed -i 's|\.\./data/|/data/|g' {} +
find "$NEW/src/assets/legacy" -type f \( -name "*.js" -o -name "*.css" -o -name "*.mjs" \) -exec sed -i 's|\.\./config/|/config/|g' {} +
find "$NEW/src/assets/legacy" -type f \( -name "*.js" -o -name "*.css" -o -name "*.mjs" \) -exec sed -i 's|\.\./assets/payloads/|/legacy-assets/payloads/|g' {} +

# Specific fix for the manifest generator
sed -i 's|../data/|../../public/data/|g' "$NEW/scripts/legacy-tools/generate-scripts-manifest.mjs"

echo "### [4/5] Building the TypeScript Legacy Bridge ###"
cat << 'EOF_BRIDGE' > "$NEW/src/lib/legacy-bridge.ts"
/**
 * Infinity Legacy Bridge
 * Connects modern Astro/React components to legacy JSON data stores.
 */

export async function fetchLegacyConfig(type: 'site' | 'scripts' | 'platforms' | 'devices') {
  const response = await fetch(`/config/${type}.json`);
  if (!response.ok) throw new Error(`Failed to load legacy config: ${type}`);
  return response.json();
}

export async function fetchLegacyData(category: string) {
  const response = await fetch(`/data/${category}.json`);
  if (!response.ok) throw new Error(`Failed to load legacy data: ${category}`);
  return response.json();
}

export const LEGACY_PATHS = {
  payloads: '/legacy-assets/payloads/',
  styles: '/src/assets/legacy/css/',
};
EOF_BRIDGE

echo "### [5/5] GitHub Actions & Workflow Sync ###"
if [ -f "$NEW/.github/workflows/pages.yml" ]; then
    # Inject the legacy manifest generation step before the build
    # Using a temporary file for clean injection
    sed '/- name: Install dependencies/a \      - name: Rebuild Legacy Manifest\n        run: node scripts/legacy-tools/generate-scripts-manifest.mjs' "$NEW/.github/workflows/pages.yml" > "$NEW/.github/workflows/pages.yml.tmp"
    mv "$NEW/.github/workflows/pages.yml.tmp" "$NEW/.github/workflows/pages.yml"
fi

echo "=> ALL SYSTEMS MIGRATED."
echo "=> Tools moved to: $NEW/scripts/legacy-tools"
echo "=> Assets mapped to: $NEW/src/assets/legacy"
echo "=> Static data at: $NEW/public/data"
