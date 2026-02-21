#!/bin/bash

# Optimize a 3D model for web use
# Usage: ./scripts/optimize-model.sh input.glb
#
# What this does:
# 1. Compresses geometry with Draco (80%+ size reduction)
# 2. Compresses textures to WebP
# 3. Resizes textures to max 1024px
# 4. Outputs optimized GLB to public/models/

INPUT="$1"
OUTPUT="public/models/luffy.glb"

if [ -z "$INPUT" ]; then
  echo "Usage: ./scripts/optimize-model.sh <input.glb>"
  echo ""
  echo "Steps:"
  echo "  1. Download model from Sketchfab as glTF"
  echo "  2. Run this script with the downloaded .glb file"
  echo "  3. Check file size: target is under 5MB"
  echo ""
  echo "If the file is still too large, open in Blender and:"
  echo "  - Decimate geometry (Modifier > Decimate, ratio 0.5)"
  echo "  - Resize textures to 512x512"
  echo "  - Re-export as .glb"
  exit 1
fi

echo "Optimizing $INPUT -> $OUTPUT"
echo ""

npx gltf-transform optimize "$INPUT" "$OUTPUT" \
  --compress draco \
  --texture-compress webp \
  --texture-size 1024

FILESIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo ""
echo "Done! Output: $OUTPUT ($FILESIZE)"
echo ""
echo "If larger than 5MB, consider:"
echo "  - Reducing texture size to 512: add --texture-size 512"
echo "  - Decimating geometry in Blender"
echo "  - Removing unused animations"
