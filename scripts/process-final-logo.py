"""Prepare the approved Zinoo logo artwork for web and Android surfaces."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("The source logo is fully transparent.")
    return bbox


def isolate_light_artwork(image: Image.Image) -> Image.Image:
    """Convert a light logo on a solid background into a transparent asset."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, _ = pixels[x, y]
            # The supplied brand artwork is white on blue.  The minimum channel
            # separates its anti-aliased white lettering from the blue field.
            alpha = max(0, min(255, (min(red, green, blue) - 72) * 2))
            pixels[x, y] = (red, green, blue, alpha)
    return rgba.crop(alpha_bbox(rgba))


def find_mark_right(image: Image.Image) -> int:
    """Find the large transparent gutter between the symbol and wordmark."""
    alpha = image.getchannel("A")
    occupied = [alpha.crop((x, 0, x + 1, image.height)).getbbox() is not None for x in range(image.width)]
    gaps: list[tuple[int, int]] = []
    start = None
    for index, has_pixel in enumerate(occupied + [True]):
        if not has_pixel and start is None:
            start = index
        elif has_pixel and start is not None:
            gaps.append((start, index))
            start = None
    internal = [gap for gap in gaps if gap[0] > image.width * 0.15 and gap[1] < image.width * 0.75]
    if not internal:
        raise ValueError("Could not identify the symbol/wordmark gutter.")
    return max(internal, key=lambda gap: gap[1] - gap[0])[0]


def contain_square(image: Image.Image, size: int, padding: float = 0.11) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    usable = round(size * (1 - padding * 2))
    scale = min(usable / image.width, usable / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    return canvas


def launcher_icon(mark: Image.Image, size: int, padding: float = 0.14) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), "white")
    canvas.alpha_composite(contain_square(mark, size, padding))
    return canvas.convert("RGB")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, default=Path("public/brand"))
    args = parser.parse_args()

    source = Image.open(args.source).convert("RGBA")
    # Accept both the original transparent lockup and the approved white-on-blue
    # artwork. The latter is converted to a reusable transparent wordmark.
    logo = source.crop(alpha_bbox(source)) if source.getchannel("A").getbbox() != source.getbbox() else isolate_light_artwork(source)
    try:
        mark = logo.crop((0, 0, find_mark_right(logo), logo.height))
        mark = mark.crop(alpha_bbox(mark))
    except ValueError:
        # The new lockup has no separate symbol: use its leading "z" as the mark.
        first_gap = next((x for x in range(logo.width // 4, logo.width) if logo.getchannel("A").crop((x, 0, x + 1, logo.height)).getbbox() is None), logo.width)
        mark = logo.crop((0, 0, first_gap, logo.height)).crop(alpha_bbox(logo.crop((0, 0, first_gap, logo.height))))

    args.output.mkdir(parents=True, exist_ok=True)
    logo.save(args.output / "zinoo-logo.png", optimize=True)
    mark.save(args.output / "zinoo-mark.png", optimize=True)
    contain_square(mark, 512).save(args.output / "zinoo-mark-512.png", optimize=True)
    contain_square(mark, 192).save(args.output / "zinoo-mark-192.png", optimize=True)
    contain_square(mark, 64, padding=0.08).save(args.output / "zinoo-mark-64.png", optimize=True)
    contain_square(mark, 64, padding=0.08).save("public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    android = Path("android/app/src/main/res")
    densities = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
    for density, size in densities.items():
        icon_dir = android / f"mipmap-{density}"
        launcher_icon(mark, size).save(icon_dir / "ic_launcher.png", optimize=True)
        launcher_icon(mark, size).save(icon_dir / "ic_launcher_round.png", optimize=True)
        contain_square(mark, round(size * 2.25), padding=0.24).save(icon_dir / "ic_launcher_foreground.png", optimize=True)

    print(f"source={source.width}x{source.height} logo={logo.width}x{logo.height} mark={mark.width}x{mark.height}")


if __name__ == "__main__":
    main()
