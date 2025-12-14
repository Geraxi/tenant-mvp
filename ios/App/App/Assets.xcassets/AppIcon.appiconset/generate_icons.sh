#!/bin/bash
# Generate all required iOS app icon sizes from 1024x1024 source

SOURCE="AppIcon-512@2x.png"

# iPhone App Icons
sips -z 180 180 "$SOURCE" --out "AppIcon-60@3x.png" 2>/dev/null || echo "Failed: 60@3x"
sips -z 120 120 "$SOURCE" --out "AppIcon-60@2x.png" 2>/dev/null || echo "Failed: 60@2x"
sips -z 120 120 "$SOURCE" --out "AppIcon-40@3x.png" 2>/dev/null || echo "Failed: 40@3x"
sips -z 80 80 "$SOURCE" --out "AppIcon-40@2x.png" 2>/dev/null || echo "Failed: 40@2x"
sips -z 87 87 "$SOURCE" --out "AppIcon-29@3x.png" 2>/dev/null || echo "Failed: 29@3x"
sips -z 58 58 "$SOURCE" --out "AppIcon-29@2x.png" 2>/dev/null || echo "Failed: 29@2x"
sips -z 60 60 "$SOURCE" --out "AppIcon-20@3x.png" 2>/dev/null || echo "Failed: 20@3x"
sips -z 40 40 "$SOURCE" --out "AppIcon-20@2x.png" 2>/dev/null || echo "Failed: 20@2x"

# iPad App Icons
sips -z 167 167 "$SOURCE" --out "AppIcon-83.5@2x.png" 2>/dev/null || echo "Failed: 83.5@2x"
sips -z 152 152 "$SOURCE" --out "AppIcon-76@2x.png" 2>/dev/null || echo "Failed: 76@2x"
sips -z 76 76 "$SOURCE" --out "AppIcon-76@1x.png" 2>/dev/null || echo "Failed: 76@1x"

# App Store (keep original)
cp "$SOURCE" "AppIcon-1024@1x.png" 2>/dev/null || echo "Failed: 1024@1x"

echo "Icon generation complete!"
ls -lh *.png | grep -v "$SOURCE"
