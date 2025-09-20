import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Primary Meta Tags */}
        <title>
          BLP ↔ PNG Toolkit - Convert Blizzard BLP Files to PNG Online
        </title>
        <meta
          name="title"
          content="BLP ↔ PNG Toolkit - Convert Blizzard BLP Files to PNG Online"
        />
        <meta
          name="description"
          content="Free online tool to convert Blizzard BLP image files to PNG format and vice versa. Supports DXT1, DXT3, DXT5, Palette, and Uncompressed formats with smart recommendations."
        />
        <meta
          name="keywords"
          content="BLP converter, PNG to BLP, BLP to PNG, Blizzard BLP, World of Warcraft textures, game texture converter, DXT compression, texture format converter"
        />
        <meta name="author" content="Pinta365" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://blp.pinta.land/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blp.pinta.land/" />
        <meta
          property="og:title"
          content="BLP ↔ PNG Toolkit - Convert Blizzard BLP Files to PNG Online"
        />
        <meta
          property="og:description"
          content="Free online tool to convert Blizzard BLP image files to PNG format and vice versa. Supports multiple compression formats with smart recommendations."
        />
        <meta
          property="og:image"
          content="https://blp.pinta.land/favicon.svg"
        />
        <meta property="og:image:width" content="32" />
        <meta property="og:image:height" content="32" />
        <meta
          property="og:image:alt"
          content="BLP Toolkit Favicon - BLP to PNG conversion tool"
        />
        <meta property="og:site_name" content="BLP Toolkit" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://blp.pinta.land/" />
        <meta
          property="twitter:title"
          content="BLP ↔ PNG Toolkit - Convert Blizzard BLP Files to PNG Online"
        />
        <meta
          property="twitter:description"
          content="Free online tool to convert Blizzard BLP image files to PNG format and vice versa. Supports multiple compression formats with smart recommendations."
        />
        <meta
          property="twitter:image"
          content="https://blp.pinta.land/favicon.svg"
        />
        <meta
          property="twitter:image:alt"
          content="BLP Toolkit Favicon - BLP to PNG conversion tool"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        {/* Theme Color */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />

        {/* Performance and Security */}
        <meta http-equiv="X-Content-Type-Options" content="nosniff" />
        <meta http-equiv="X-Frame-Options" content="DENY" />
        <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BLP ↔ PNG Toolkit",
            "description":
              "Free online tool to convert Blizzard BLP image files to PNG format and vice versa",
            "url": "https://blp.pinta.land/",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
            },
            "creator": {
              "@type": "Person",
              "name": "Pinta365",
            },
            "featureList": [
              "BLP to PNG conversion",
              "PNG to BLP conversion",
              "DXT1, DXT3, DXT5 compression support",
              "Palette and Uncompressed formats",
              "Smart format recommendations",
              "Mipmap generation",
              "Auto-resizing to power-of-2 dimensions",
            ],
          })}
        </script>
      </head>
      <body class="bg-gray-100">
        <Component />
      </body>
    </html>
  );
});
