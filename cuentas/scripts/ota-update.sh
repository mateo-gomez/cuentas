#!/usr/bin/env bash
# Publish an OTA update with EAS Update, letting you pick the channel.
# Usage:
#   npm run ota                      # interactive: prompts for channel and message
#   npm run ota -- production "msg"  # non-interactive: channel + message as args
set -euo pipefail

CHANNELS=("development" "preview" "production")

channel="${1:-}"
message="${2:-}"

if [[ -z "$channel" ]]; then
  echo "Select a channel:"
  select c in "${CHANNELS[@]}"; do
    if [[ -n "$c" ]]; then
      channel="$c"
      break
    fi
    echo "Invalid choice, try again."
  done
fi

# Validate channel against the known list.
valid=false
for c in "${CHANNELS[@]}"; do
  [[ "$c" == "$channel" ]] && valid=true
done
if [[ "$valid" == false ]]; then
  echo "Unknown channel '$channel'. Valid: ${CHANNELS[*]}" >&2
  exit 1
fi

if [[ -z "$message" ]]; then
  read -rp "Update message: " message
fi

echo "Publishing OTA update to channel '$channel'..."
exec npx eas update --channel "$channel" --message "$message"
