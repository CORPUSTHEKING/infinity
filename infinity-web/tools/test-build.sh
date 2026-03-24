#!/bin/bash
# Infinity Build Verifier

echo "Checking Directory Integrity..."
REQUIRED_DIRS=("assets/media" "config" "js/components" "pages")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "../$dir" ]; then
        echo "✅ $dir exists."
    else
        echo "❌ Missing $dir"
    fi
done

echo "Regenerating Script Manifest..."
node generate-scripts-manifest.mjs

if [ -f "../config/scripts.json" ]; then
    COUNT=$(grep -c "id" ../config/scripts.json)
    echo "✅ Success: Manifest created with $COUNT scripts."
else
    echo "❌ Failed to create config/scripts.json"
fi

echo "Build check complete."
