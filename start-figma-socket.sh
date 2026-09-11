#!/bin/zsh
# Start Talk to Figma WebSocket — then click Connect in the Figma plugin
cd /Users/abashkirov/Documents/other/cursor-talk-to-figma-mcp
exec /Users/abashkirov/.bun/bin/bun run src/socket.ts
