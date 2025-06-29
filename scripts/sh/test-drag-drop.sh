#!/bin/bash

# Test script for drag and drop functionality
echo "🧪 Testing Drag and Drop Move API"

API_URL="http://localhost:3001"

echo ""
echo "📋 1. Getting current file structure..."
curl -s "$API_URL/api/files" | jq '.data[] | {name: .name, path: .path, type: .type}' || echo "Failed to get files"

echo ""
echo "📁 2. Testing move operation..."
echo "   Moving 'examples/list-test.md' to 'docs/' folder"

# Test move operation
RESPONSE=$(curl -s -X POST "$API_URL/api/files/move" \
  -H "Content-Type: application/json" \
  -d '{
    "sourcePath": "examples/list-test.md",
    "targetPath": "docs"
  }')

echo "Response: $RESPONSE"

if echo "$RESPONSE" | jq -e '.success' >/dev/null 2>&1; then
  echo "✅ Move operation successful!"
else
  echo "❌ Move operation failed"
fi

echo ""
echo "📋 3. Getting updated file structure..."
curl -s "$API_URL/api/files" | jq '.data[] | select(.name == "Docs") | .children[] | {name: .name, path: .path}' || echo "Failed to get updated structure"

echo ""
echo "🔄 4. Moving file back to original location..."
curl -s -X POST "$API_URL/api/files/move" \
  -H "Content-Type: application/json" \
  -d '{
    "sourcePath": "docs/list-test.md",
    "targetPath": "examples"
  }' | jq '.success' || echo "Failed to move back"

echo ""
echo "✅ Drag and drop test completed!"
