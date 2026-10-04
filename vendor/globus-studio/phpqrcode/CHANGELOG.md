# Changelog

## [1.0.0] - 2024-01-01

### Added
- Full QR Code encoding (versions 1-40)
- Error correction levels L, M, Q, H
- Numeric, alphanumeric, byte, and kanji encoding modes
- Automatic mode detection and version selection
- SVG renderer (zero dependencies)
- HTML renderer (zero dependencies)
- String/ASCII renderer (zero dependencies)
- PNG renderer (requires ext-gd)
- Raw matrix renderer (JSON output)
- Simple static API: `QRCode::svg()`, `QRCode::png()`, `QRCode::html()`, `QRCode::string()`, `QRCode::matrix()`
- Object-oriented API with custom renderers
- 100% test coverage
- PHP 7.4–9.0 support
- PHPStan level max compliance
- PSR-4 autoloading
- XSS-safe HTML/SVG output
