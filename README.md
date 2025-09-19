# BLP ↔ PNG Toolkit

A web toolkit for bidirectional conversion between Blizzard BLP image files and
PNG format in your browser.

**Live preview:** Available at
[https://blp.pinta.land/](https://blp.pinta.land/)

## Features

### BLP to PNG Conversion

- **Upload** a `.blp` file to view its metadata and a live PNG preview
- **Export to PNG** with multiple format options including RGBA, RGB, Grayscale,
  and Palette formats
- **Smart recommendations** based on BLP header analysis (alpha channel, image
  size, etc.)

### PNG to BLP Conversion

- **Upload** a `.png` file to convert it to BLP format
- **Multiple BLP formats** including DXT1, DXT3, DXT5, Palette, and Uncompressed
- **Smart alpha detection** - automatically recommends formats with alpha
  support for transparent images
- **Auto-resizing** to power-of-2 dimensions with padding options
- **Mipmap generation** for optimal texture quality

## Technical Details

[@pinta365/blp](https://jsr.io/@pinta365/blp) for BLP file parsing and
conversion
