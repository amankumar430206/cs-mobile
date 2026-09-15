"""Generate cs-mobile icon, splash and in-app logo assets from resources/logo.

Usage (from cs-mobile): python scripts/generate-brand-assets.py ..   (needs Pillow; reads ../resources/logo)
"""
import os
import sys

from PIL import Image

ROOT = sys.argv[1]
SRC = os.path.join(ROOT, "resources", "logo")
OUT = os.path.join(ROOT, "cs-mobile", "assets")
BRAND_OUT = os.path.join(OUT, "brand")
os.makedirs(BRAND_OUT, exist_ok=True)

CREAM = (0xFF, 0xFC, 0xF3, 255)  # brand.foreground
INK = (0x11, 0x11, 0x11, 255)  # brand.secondary
CANVAS = 1024


def cropped(name):
    image = Image.open(os.path.join(SRC, name)).convert("RGBA")
    alpha = image.getchannel("A").point(lambda v: 255 if v > 16 else 0)
    return image.crop(alpha.getbbox())


def fit_width(image, width):
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.LANCZOS)


def centered(art, background, width_fraction):
    canvas = Image.new("RGBA", (CANVAS, CANVAS), background)
    scaled = fit_width(art, round(CANVAS * width_fraction))
    canvas.alpha_composite(scaled, ((CANVAS - scaled.width) // 2, (CANVAS - scaled.height) // 2))
    return canvas


def save(image, path, opaque=False):
    if opaque:
        image = image.convert("RGB")
    image.save(path, optimize=True)
    print(f"{os.path.relpath(path, ROOT)} {image.size}")


symbol_dark = cropped("cs-symbol-dark.png")  # black C + orange !, for light backgrounds
symbol_light = cropped("cs-symbol-light.png")  # cream C + yellow !, for dark backgrounds

# iOS / generic icon: must be opaque and fill the square.
save(centered(symbol_dark, CREAM, 0.62), os.path.join(OUT, "icon.png"), opaque=True)

# Android adaptive icon: the launcher masks to a ~61% safe circle, so the whole glyph
# (diagonal included) stays inside it at 48% width.
save(centered(symbol_dark, (0, 0, 0, 0), 0.48), os.path.join(OUT, "android-icon-foreground.png"))
save(Image.new("RGB", (CANVAS, CANVAS), CREAM[:3]), os.path.join(OUT, "android-icon-background.png"), opaque=True)
silhouette = Image.new("RGBA", symbol_dark.size, (255, 255, 255, 255))
silhouette.putalpha(symbol_dark.getchannel("A"))
save(centered(silhouette, (0, 0, 0, 0), 0.48), os.path.join(OUT, "android-icon-monochrome.png"))

# Splash: transparent, the splash background color comes from app config.
save(centered(symbol_dark, (0, 0, 0, 0), 0.9), os.path.join(OUT, "splash-icon.png"))
save(centered(symbol_light, (0, 0, 0, 0), 0.9), os.path.join(OUT, "splash-icon-dark.png"))

# In-app wordmarks, ~3x a 200pt display width.
save(fit_width(cropped("cs-logo-dark.png"), 600), os.path.join(BRAND_OUT, "wordmark-on-light.png"))
save(fit_width(cropped("cs-logo-light.png"), 600), os.path.join(BRAND_OUT, "wordmark-on-dark.png"))
