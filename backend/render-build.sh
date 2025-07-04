#!/usr/bin/env bash

# Install yt-dlp via pip
pip install yt-dlp

# Add pip binaries to PATH (important!)
export PATH=$PATH:/opt/render/project/.render/pip/bin

# Install ffmpeg
apt-get update
apt-get install -y ffmpeg

# Bun install
bun i