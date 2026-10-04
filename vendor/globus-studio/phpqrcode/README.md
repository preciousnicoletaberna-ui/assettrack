# globus-studio/phpqrcode

Zero-dependency QR Code generator for PHP 7.4–9.0.

[![CI](https://github.com/MADEVAL/phpqrcode/actions/workflows/ci.yml/badge.svg)](https://github.com/MADEVAL/phpqrcode/actions)
[![Coverage](https://codecov.io/gh/MADEVAL/phpqrcode/branch/main/graph/badge.svg)](https://codecov.io/gh/MADEVAL/phpqrcode)
[![PHP Version](https://img.shields.io/packagist/php-v/globus-studio/phpqrcode)](https://packagist.org/packages/globus-studio/phpqrcode)
[![License](https://img.shields.io/packagist/l/globus-studio/phpqrcode)](LICENSE)

## Features

- Dead simple API — one line to generate QR
- Zero runtime dependencies
- PHP 7.4 / 8.0 / 8.1 / 8.2 / 8.3 / 8.4 / 8.5 / 9.0
- QR Code versions 1–40, all error correction levels
- Multiple output formats: SVG, PNG, HTML, ASCII, raw matrix
- 100% test coverage
- PHPStan level max
- PSR-4 autoloading

## Installation

```bash
composer require globus-studio/phpqrcode
```

## Usage

```php
use GlobusStudio\QRCode\QRCode;

// SVG string
$svg = QRCode::svg('https://example.com');

// PNG as data URI (requires ext-gd)
$png = QRCode::png('https://example.com');

// HTML table
$html = QRCode::html('https://example.com');

// ASCII art
echo QRCode::string('https://example.com');

// Raw boolean matrix
$matrix = QRCode::matrix('https://example.com');
```

## Options

```php
use GlobusStudio\QRCode\QRCode;
use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;

$svg = QRCode::svg('data', [
    'level' => ErrorCorrectionLevel::H,
    'size' => 4,
    'margin' => 2,
    'foreground' => '#000000',
    'background' => '#ffffff',
]);
```

## Object API

```php
use GlobusStudio\QRCode\QRCode;
use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;
use GlobusStudio\QRCode\Renderer\SvgRenderer;

$qr = new QRCode('https://example.com', ErrorCorrectionLevel::H);
$svg = $qr->render(new SvgRenderer(['size' => 6]));
$matrix = $qr->getMatrix();
```

## Error Correction Levels

| Level | Recovery |
|-------|----------|
| L | ~7% |
| M | ~15% |
| Q | ~25% |
| H | ~30% |

## Renderers

| Renderer | Dependencies | Output |
|----------|-------------|--------|
| SvgRenderer | none | SVG XML string |
| HtmlRenderer | none | HTML table |
| StringRenderer | none | ASCII/UTF-8 |
| PngRenderer | ext-gd | PNG binary |
| RawRenderer | none | JSON / int[][] |

## License

MIT — see [LICENSE](LICENSE).
