#!/bin/bash
# Push VK Chess World to GitHub
echo "Pushing VK Chess World to GitHub (vijaykd/vkchessworld)..."
git push -u origin main
if [ $? -eq 0 ]; then
  echo "✅ Successfully pushed to https://github.com/vijaykd/vkchessworld"
else
  echo "⚠️ Push failed. Please ensure the repository 'vkchessworld' is created on https://github.com/new"
fi
