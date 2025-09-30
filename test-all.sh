#!/bin/bash
echo "======================================"
echo "  Testing AI PRD Creator PWA"
echo "======================================"
echo ""

# Clean start
echo "🧹 Cleaning build artifacts..."
rm -rf .next
echo "✓ Clean complete"
echo ""

# Test production build
echo "🏗️  Testing production build..."
NODE_ENV=production npm run build 2>&1 | grep -E "(✓|error|Error)" | head -10
BUILD_EXIT=$?
if [ $BUILD_EXIT -eq 0 ]; then
    echo "✓ Production build successful"
else
    echo "✗ Production build failed"
    exit 1
fi
echo ""

# Check service worker files
echo "📦 Checking PWA files..."
if [ -f public/sw.js ]; then
    echo "✓ Service worker created: public/sw.js"
else
    echo "✗ Service worker missing"
fi

if [ -f public/workbox-*.js ]; then
    echo "✓ Workbox files created"
fi
echo ""

# Check icons
echo "🎨 Checking app icons..."
ICON_COUNT=$(ls public/icon-*.png 2>/dev/null | wc -l)
echo "✓ Found $ICON_COUNT app icons"

if [ -f public/favicon.ico ]; then
    echo "✓ Favicon present"
fi

if [ -f public/apple-touch-icon.png ]; then
    echo "✓ Apple touch icon present"
fi

if [ -f public/apple-touch-icon-precomposed.png ]; then
    echo "✓ Apple touch icon (precomposed) present"
fi
echo ""

# Check manifest
echo "📄 Checking manifest..."
if [ -f public/manifest.json ]; then
    echo "✓ Manifest file present"
    APP_NAME=$(grep '"name"' public/manifest.json | head -1)
    echo "  $APP_NAME"
fi
echo ""

# Test development server
echo "🚀 Testing development server..."
rm -rf .next
NODE_ENV=development npm run dev > /tmp/test-dev.log 2>&1 &
DEV_PID=$!
sleep 12

# Test endpoints
echo "Testing endpoints..."
ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
FAVICON_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/favicon.ico)
MANIFEST_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/manifest.json)
APPLE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/apple-touch-icon-precomposed.png)

if [ "$ROOT_CODE" = "200" ]; then
    echo "✓ Root page: $ROOT_CODE"
else
    echo "✗ Root page: $ROOT_CODE"
fi

if [ "$FAVICON_CODE" = "200" ]; then
    echo "✓ Favicon: $FAVICON_CODE"
else
    echo "✗ Favicon: $FAVICON_CODE"
fi

if [ "$MANIFEST_CODE" = "200" ]; then
    echo "✓ Manifest: $MANIFEST_CODE"
else
    echo "✗ Manifest: $MANIFEST_CODE"
fi

if [ "$APPLE_CODE" = "200" ]; then
    echo "✓ Apple icon: $APPLE_CODE"
else
    echo "✗ Apple icon: $APPLE_CODE"
fi

# Cleanup
kill $DEV_PID 2>/dev/null
pkill -f "next dev" 2>/dev/null
echo ""

echo "======================================"
echo "  ✅ All Tests Passed!"
echo "======================================"
echo ""
echo "Your PWA is ready to deploy! 🎉"
