#!/usr/bin/env bash

set -e

echo "Starting build process..."

# Install yt-dlp using pip3 (Python 3 is pre-installed on Render)
echo "Installing yt-dlp..."
pip3 install --user yt-dlp

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
bun install

# Build TypeScript
echo "Building TypeScript project..."
bun run build

echo "Build completed!"