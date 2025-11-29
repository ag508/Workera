from colorthief import ColorThief
import sys
import os

try:
    img_path = 'frontend/public/images/brand/Workera_Full_Icon.png'
    if not os.path.exists(img_path):
        print(f"Error: File not found at {img_path}")
        sys.exit(1)

    color_thief = ColorThief(img_path)
    # Get the dominant color
    dominant_color = color_thief.get_color(quality=1)
    # Get the palette
    palette = color_thief.get_palette(color_count=6)

    print(f"Dominant: #{dominant_color[0]:02x}{dominant_color[1]:02x}{dominant_color[2]:02x}")
    print("Palette:")
    for color in palette:
        print(f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}")
except Exception as e:
    print(f"Error: {e}")
