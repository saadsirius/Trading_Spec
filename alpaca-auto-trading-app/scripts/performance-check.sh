#!/bin/bash

# Performance check script
set -e

echo "🔍 Running performance checks..."

# Check if Lighthouse CLI is installed
if ! command -v lighthouse &> /dev/null; then
  echo "📥 Installing Lighthouse CLI..."
  npm install -g lighthouse
fi

# Check if the app is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "❌ Error: App is not running on localhost:3000"
  echo "Please start the app with 'npm run dev' first"
  exit 1
fi

# Run Lighthouse audit
echo "🏃 Running Lighthouse audit..."
lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./lighthouse-report.html \
  --chrome-flags="--headless" \
  --only-categories=performance,accessibility,best-practices,seo

# Run bundle analysis
echo "📊 Analyzing bundle size..."
npx source-map-explorer 'build/static/js/*.js' --html > bundle-analysis.html

# Check for unused dependencies
echo "🧹 Checking for unused dependencies..."
npx depcheck

# Run performance tests
echo "🧪 Running performance tests..."
npm run test:performance

echo "✅ Performance checks completed!"
echo "📄 Reports generated:"
echo "  - lighthouse-report.html"
echo "  - bundle-analysis.html"
