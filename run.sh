#!/bin/bash
# VK Chess World Launcher
PORT=${1:-8080}

echo "============================================="
echo "   👑 VK Chess World (Chess.com & Lichess)  "
echo "============================================="
echo "Starting local chess server at http://localhost:$PORT"

# Open default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "http://localhost:$PORT"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "http://localhost:$PORT" &>/dev/null || true
fi

# Run python server
python3 -m http.server $PORT
