<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Util;

use GlobusStudio\QRCode\Data\AbstractQRData;
use GlobusStudio\QRCode\Util\ModeDetector;
use PHPUnit\Framework\TestCase;

final class ModeDetectorTest extends TestCase
{
    public function testDetectsNumeric(): void
    {
        self::assertSame(AbstractQRData::MODE_NUMBER, ModeDetector::detect('1234567890'));
    }

    public function testDetectsAlphanumeric(): void
    {
        self::assertSame(AbstractQRData::MODE_ALPHA_NUM, ModeDetector::detect('HELLO WORLD'));
    }

    public function testDetectsByte(): void
    {
        self::assertSame(AbstractQRData::MODE_8BIT_BYTE, ModeDetector::detect('hello world'));
    }

    public function testDetectsKanji(): void
    {
        self::assertSame(AbstractQRData::MODE_KANJI, ModeDetector::detect("\x82\x60\x82\x61"));
    }

    public function testEmptyStringReturnsByte(): void
    {
        self::assertSame(AbstractQRData::MODE_8BIT_BYTE, ModeDetector::detect(''));
    }

    public function testMixedNumericAlphaDetectsAlpha(): void
    {
        self::assertSame(AbstractQRData::MODE_ALPHA_NUM, ModeDetector::detect('123ABC'));
    }

    public function testUrlDetectsByte(): void
    {
        self::assertSame(AbstractQRData::MODE_8BIT_BYTE, ModeDetector::detect('https://example.com'));
    }

    public function testSpecialCharsDetectsByte(): void
    {
        self::assertSame(AbstractQRData::MODE_8BIT_BYTE, ModeDetector::detect('hello@world'));
    }
}
