#!/bin/bash

echo "📦 Creating Submission Package"
echo "=============================="
echo ""

# Get current directory
PROJECT_DIR=$(pwd)
PROJECT_NAME=$(basename "$PROJECT_DIR")
PARENT_DIR=$(dirname "$PROJECT_DIR")
ZIP_NAME="kube-credential-submission.zip"

echo "Project: $PROJECT_NAME"
echo ""

# Clean up unnecessary files
echo "Cleaning up..."
rm -rf issuance-service/node_modules
rm -rf verification-service/node_modules
rm -rf frontend/node_modules
rm -rf */dist
rm -rf */data
rm -rf */test-data
rm -rf */.next
rm -rf */coverage
echo "✅ Cleaned node_modules and build artifacts"
echo ""

# Create screenshots directory if it doesn't exist
if [ ! -d "screenshots" ]; then
    mkdir -p screenshots
    echo "📁 Created screenshots/ directory"
    echo "   Please add your screenshots here before zipping"
    echo ""
fi

# Move to parent directory and create zip
cd "$PARENT_DIR"

echo "Creating zip file..."
zip -r "$ZIP_NAME" "$PROJECT_NAME" \
    -x "*/node_modules/*" \
    -x "*/dist/*" \
    -x "*/.git/*" \
    -x "*/data/*" \
    -x "*/test-data/*" \
    -x "*/.next/*" \
    -x "*/coverage/*" \
    -x "*/.DS_Store" \
    -x "*.log"

if [ -f "$ZIP_NAME" ]; then
    SIZE=$(du -h "$ZIP_NAME" | cut -f1)
    echo ""
    echo "✅ Zip file created successfully!"
    echo "   Location: $PARENT_DIR/$ZIP_NAME"
    echo "   Size: $SIZE"
    echo ""
    echo "Next steps:"
    echo "1. Upload $ZIP_NAME to Google Drive"
    echo "2. Set sharing to 'Anyone with the link'"
    echo "3. Copy the link"
    echo "4. Send email to hrfs@zupple.technology with the link"
else
    echo "❌ Failed to create zip file"
    exit 1
fi
