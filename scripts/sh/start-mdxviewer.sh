#!/bin/bash

# Script to start the development server
echo "🚀 Starting development server for mdxViewer..."

# Navigate to the project directory
cd /Volumes/Developer/Projects/mdxViewer || {
  echo "❌ Could not access the project directory"
  exit 1
}

# Start the development server
npm run dev
