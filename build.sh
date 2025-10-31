#!/bin/bash
echo "🚀 Starting PhishGuard full build..."
cd backend
npm install
cd ../frontend
npm install
npm run build
echo "✅ Build completed successfully!"
