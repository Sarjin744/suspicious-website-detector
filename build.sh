#!/bin/bash
set -e
echo "Installing backend..."
cd backend && npm install
echo "Installing frontend..."
cd ../frontend && npm install
echo "Building frontend..."
npm run build
echo "Build done"
