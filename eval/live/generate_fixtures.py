#!/usr/bin/env python3
"""Generate the synthetic documents used by the live Gemini sample.

Every field is invented. The images are deliberately plain so the sample
measures Gemini's reading of realistic-but-clean fixtures, not graphic design.
Requires Pillow (pip install pillow).
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(__file__).parent / "fixtures"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

WIDTH, HEIGHT = 1000, 620


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def document(title: str, lines: list[str], subtitle: str) -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), "#f8f5ec")
    draw = ImageDraw.Draw(img)
    draw.rectangle([12, 12, WIDTH - 12, HEIGHT - 12], outline="#1f2937", width=4)
    draw.rectangle([12, 12, WIDTH - 12, 100], fill="#1f2937")
    draw.text((40, 34), title, font=font(36, bold=True), fill="#ffffff")
    draw.text((40, 120), subtitle, font=font(24, bold=True), fill="#374151")

    y = 190
    for line in lines:
        draw.text((40, y), line, font=font(30), fill="#111827")
        y += 62

    draw.text(
        (40, HEIGHT - 56),
        "SYNTHETIC SAMPLE - NOT A REAL DOCUMENT - ALL DETAILS ARE INVENTED",
        font=font(18),
        fill="#9ca3af",
    )
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    licences = [
        (
            "dl-clean.png",
            "DRIVER LICENCE",
            [
                "Name: Alex Sample",
                "Licence No: SYN-100001",
                "Expiry Date: 2029-03-14",
            ],
            "NEW SOUTH WALES - DEMO LICENCE",
        ),
        (
            "dl-rotated.png",
            "DRIVER LICENCE",
            [
                "Name: Bailey Example",
                "Licence No: SYN-100002",
                "Expiry Date: 2028-11-02",
            ],
            "VICTORIA - DEMO LICENCE",
        ),
        (
            "dl-blurry.png",
            "DRIVER LICENCE",
            [
                "Name: Casey Fiction",
                "Licence No: SYN-100003",
                "Expiry Date: 2030-01-01",
            ],
            "QUEENSLAND - DEMO LICENCE",
        ),
    ]

    for filename, title, lines, subtitle in licences:
        img = document(title, lines, subtitle)
        if filename == "dl-rotated.png":
            img = img.rotate(6, expand=True, fillcolor="#f8f5ec")
        if filename == "dl-blurry.png":
            img = img.filter(ImageFilter.GaussianBlur(radius=2.2))
        img.save(OUT / filename)

    document(
        "AUTHORISED DRIVING INSTRUCTOR",
        [
            "Instructor Name: Grace Example",
            "ADI Registration: ADI-SYN-2001",
            "Expiry Date: 2028-02-29",
        ],
        "TRANSPORT AUTHORITY - DEMO CERTIFICATE",
    ).save(OUT / "adi.png")

    document(
        "WORKING WITH CHILDREN CHECK",
        [
            "Cardholder: Morgan Mock",
            "WWCC Number: WWC-SYN-4001",
            "Expiry Date: 2032-01-15",
        ],
        "DEMO WWCC CARD",
    ).save(OUT / "wwcc.png")

    document(
        "VEHICLE REGISTRATION",
        [
            "Make: Toyota",
            "Model: Corolla",
            "Year: 2021",
            "Registration: SYN-123",
            "Colour: White",
        ],
        "DEMO REGISTRATION CERTIFICATE",
    ).save(OUT / "vehicle.png")

    print(f"Wrote {len(list(OUT.glob('*.png')))} fixtures to {OUT}")


if __name__ == "__main__":
    main()
