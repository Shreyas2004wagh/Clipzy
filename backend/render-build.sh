#!/usr/bin/env bash

# Exit on any error
set -e

echo "Starting build process..."

# Update package lists
echo "Updating package lists..."
apt-get update -y

# Install ffmpeg
echo "Installing ffmpeg..."
apt-get install -y ffmpeg

# Install yt-dlp via pip
echo "Installing yt-dlp..."
pip install yt-dlp

# Add pip binaries to PATH and make it persistent
export PATH=$PATH:/opt/render/project/.render/pip/bin
echo 'export PATH=$PATH:/opt/render/project/.render/pip/bin' >> ~/.bashrc

# Verify yt-dlp installation
echo "Verifying yt-dlp installation..."
which yt-dlp || echo "yt-dlp not found in PATH"
yt-dlp --version || echo "yt-dlp version check failed"

# Install Node.js dependencies with Bun
echo "Installing Node.js dependencies..."
bun install

# Build the TypeScript project
echo "Building TypeScript project..."
bun run build

echo "Build process completed successfully!"