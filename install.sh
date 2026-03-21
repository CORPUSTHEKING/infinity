#!/usr/bin/env bash
set -e

echo "[*] Installing Infinity..."

# Detect Termux vs standard Linux
PREFIX_PATH="${PREFIX:-/data/data/com.termux/files/usr}"
BIN_DIR="$PREFIX_PATH/bin"

# Ensure python exists
if ! command -v python3 >/dev/null 2>&1; then
  echo "[!] python3 not found. Install it first."
  exit 1
fi

# Install optional deps
if [ -f requirements.txt ]; then
  echo "[*] Installing Python dependencies..."
  pip install --upgrade pip >/dev/null 2>&1 || true
  pip install -r requirements.txt || true
fi

# Create launcher
echo "[*] Creating launcher..."

mkdir -p "$BIN_DIR"

cat << 'LAUNCH' > "$BIN_DIR/infinity"
#!/usr/bin/env bash
python3 "$HOME/INFINITY/runtime/cli.py" "$@"
LAUNCH

chmod +x "$BIN_DIR/infinity"

# Optional alias
if [ ! -f "$BIN_DIR/∞" ]; then
  ln -s "$BIN_DIR/infinity" "$BIN_DIR/∞" 2>/dev/null || true
fi

echo "[✓] Installation complete"
echo ""
echo "Run:"
echo "    infinity"
echo "or:"
echo "    ∞"
