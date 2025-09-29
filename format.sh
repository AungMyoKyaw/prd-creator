#!/usr/bin/env sh
# format.sh — format the repository with Prettier
# Usage:
#   ./format.sh            # runs `npx prettier --write .`
#   ./format.sh --check    # forwards args to prettier (e.g. --check)
#   ./format.sh "--write src/**/*.ts"  # pass any prettier args

set -eu

# If no args are provided, run the canonical format command
if [ "$#" -eq 0 ]; then
  echo "Running: npx prettier --write ."
  npx prettier --write .
else
  echo "Running: npx prettier $*"
  npx prettier "$@"
fi
