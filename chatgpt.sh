#!/bin/bash

# Script to assist ChatGPT-based workflows (Rails edition)

PROJECT_NAME=$(basename "$PWD")
ARCHIVE_NAME="${PROJECT_NAME}-workspace-latest.zip"
SYNC_DIR="./sync-chatgpt"

# Common Rails folders to ignore in backup
EXCLUDES=(
  "node_modules/*"
  ".next/*"
  ".git/*"
  "$SYNC_DIR/*"
  "./chatgpt.sh"
  "log/*"
  "tmp/*"
  "vendor/bundle/*"
  ".bundle/*"
  "storage/*"
  "coverage/*"
  "public/packs/*"
  "public/assets/*"
)

function pack() {
  mkdir -p "$SYNC_DIR"
  rm -f "$SYNC_DIR/${ARCHIVE_NAME}"
  echo "🔄 Creating zip archive: $ARCHIVE_NAME"
  # Build excludes string for zip
  ZIP_EXCLUDES=()
  for path in "${EXCLUDES[@]}"; do
    ZIP_EXCLUDES+=("-x" "$path")
  done
  zip -r "$ARCHIVE_NAME" . "${ZIP_EXCLUDES[@]}" > /dev/null
  mv "$ARCHIVE_NAME" "$SYNC_DIR/$ARCHIVE_NAME"
  echo "✅ Archive created: $SYNC_DIR/$ARCHIVE_NAME"
  # Open in Finder (macOS); comment if not on macOS
  if command -v open &> /dev/null; then
    open -R "$SYNC_DIR/$ARCHIVE_NAME"
  fi
}

function unpack() {
  TEMP_DIR="$SYNC_DIR/tmp-unpack"
  ZIP_PATH="$SYNC_DIR/chatgpt-${PROJECT_NAME}-workspace.zip"

  echo "🔄 Unpacking $ZIP_PATH into temporary directory..."
  rm -rf "$TEMP_DIR"
  mkdir -p "$TEMP_DIR"
  unzip -o "$ZIP_PATH" -d "$TEMP_DIR" > /dev/null

  echo "⚙️  Applying rename/delete operations from $SYNC_DIR/rename-and-delete-commands.sh..."
  if [ -f "$SYNC_DIR/rename-and-delete-commands.sh" ]; then
    bash "$SYNC_DIR/rename-and-delete-commands.sh"
    rm "$SYNC_DIR/rename-and-delete-commands.sh"
    echo "✅ Renames and deletions applied"
  fi

  echo "📦 Syncing unpacked files into project..."
  rsync -a "$TEMP_DIR"/ ./

  echo "🧹 Cleaning up..."
  rm -rf "$TEMP_DIR"
  rm -f "$ZIP_PATH"

  echo "✅ Patch applied and cleanup complete"
}

function tunnel() {
  echo "🌐 Starting ngrok tunnel on port 3000 (Rails default) with browser warning skipped..."
  NGROK_SKIP_BROWSER_WARNING=1 npx ngrok http 3000
}

function help() {
  echo ""
  echo "Usage:"
  echo "  ./chatgpt.sh tunnel           # Share local Rails server on port 3000 using ngrok"
  echo "  ./chatgpt.sh pack             # Zip into latest ChatGPT-formatted archive"
  echo "  ./chatgpt.sh unpack           # Unpack the latest patch zip"
  echo ""
}

case "$1" in
  pack)
    pack
    ;;
  unpack)
    unpack
    ;;
  tunnel)
    tunnel
    ;;
  *)
    help
    ;;
esac
