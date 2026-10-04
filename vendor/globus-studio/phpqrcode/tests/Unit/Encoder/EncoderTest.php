<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Encoder;

use GlobusStudio\QRCode\Encoder\Encoder;
use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;
use PHPUnit\Framework\TestCase;

final class EncoderTest extends TestCase
{
    public function testEncodeNumericData(): void
    {
        $matrix = Encoder::encode('12345', ErrorCorrectionLevel::L);
        self::assertSame(21, count($matrix));
        self::assertSame(21, count($matrix[0]));
    }

    public function testEncodeAlphanumericData(): void
    {
        $matrix = Encoder::encode('HELLO', ErrorCorrectionLevel::M);
        self::assertSame(21, count($matrix));
    }

    public function testEncodeByteData(): void
    {
        $matrix = Encoder::encode('hello world', ErrorCorrectionLevel::M);
        self::assertSame(21, count($matrix));
    }

    public function testEncodeWithHighErrorCorrection(): void
    {
        $matrix = Encoder::encode('test', ErrorCorrectionLevel::H);
        self::assertSame(21, count($matrix));
    }

    public function testModuleCountFormula(): void
    {
        $matrix = Encoder::encode('A', ErrorCorrectionLevel::L, 1);
        self::assertSame(21, count($matrix));

        $matrix = Encoder::encode('A', ErrorCorrectionLevel::L, 2);
        self::assertSame(25, count($matrix));
    }

    public function testEncodeLongData(): void
    {
        $data = str_repeat('A', 100);
        $matrix = Encoder::encode($data, ErrorCorrectionLevel::L);
        self::assertGreaterThan(21, count($matrix));
    }

    public function testEncodeWithExplicitVersion(): void
    {
        $matrix = Encoder::encode('TEST', ErrorCorrectionLevel::M, 5);
        $expected = 5 * 4 + 17;
        self::assertSame($expected, count($matrix));
    }

    public function testMatrixContainsBooleans(): void
    {
        $matrix = Encoder::encode('test', ErrorCorrectionLevel::M);
        foreach ($matrix as $row) {
            foreach ($row as $cell) {
                self::assertIsBool($cell);
            }
        }
    }

    public function testInvalidErrorCorrectionLevel(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Encoder::encode('test', 99);
    }

    public function testVersion7HasTypeNumber(): void
    {
        $matrix = Encoder::encode('A', ErrorCorrectionLevel::L, 7);
        $expected = 7 * 4 + 17;
        self::assertSame($expected, count($matrix));
    }

    public function testEncodeUrl(): void
    {
        $matrix = Encoder::encode('https://example.com', ErrorCorrectionLevel::M);
        self::assertGreaterThanOrEqual(21, count($matrix));
    }

    public function testDataOverflowThrows(): void
    {
        $this->expectException(\OverflowException::class);
        Encoder::encode(str_repeat('A', 500), ErrorCorrectionLevel::H, 1);
    }
}
