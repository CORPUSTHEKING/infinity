#!/bin/bash
# ==============================================================================
# INFINITY GATEWAY: Ignition Script
# ==============================================================================

# 1. Establish Environment
export SCRIPT_NAME="infinity-core"
export RUNTIME_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/runtime" && pwd)"
export PYTHONPATH="$RUNTIME_ROOT:$PYTHONPATH"

# 2. Infrastructure Check
mkdir -p "$RUNTIME_ROOT/log" "$RUNTIME_ROOT/var"

# 3. Launch the Switching Station
# We use -u for unbuffered output to ensure logs are real-time
python3 -u "$RUNTIME_ROOT/core/host.py"
