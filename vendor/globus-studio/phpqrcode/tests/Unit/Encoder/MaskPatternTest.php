<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Encoder;

use GlobusStudio\QRCode\Encoder\MaskPattern;
use PHPUnit\Framework\TestCase;

final class MaskPatternTest extends TestCase
{
    public function testPattern000(): void
    {
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_000, 0, 0));
        self::assertFalse(MaskPattern::getMask(MaskPattern::PATTERN_000, 0, 1));
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_000, 1, 1));
    }

    public function testPattern001(): void
    {
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_001, 0, 0));
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_001, 0, 1));
        self::assertFalse(MaskPattern::getMask(MaskPattern::PATTERN_001, 1, 0));
    }

    public function testPattern010(): void
    {
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_010, 0, 0));
        self::assertFalse(MaskPattern::getMask(MaskPattern::PATTERN_010, 0, 1));
        self::assertFalse(MaskPattern::getMask(MaskPattern::PATTERN_010, 0, 2));
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_010, 0, 3));
    }

    public function testPattern011(): void
    {
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_011, 0, 0));
        self::assertFalse(MaskPattern::getMask(MaskPattern::PATTERN_011, 0, 1));
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_011, 1, 2));
    }

    public function testPattern100(): void
    {
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_100, 0, 0));
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_100, 1, 0));
        self::assertFalse(MaskPattern::getMask(MaskPattern::PATTERN_100, 2, 0));
    }

    public function testPattern101(): void
    {
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_101, 0, 0));
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_101, 0, 1));
    }

    public function testPattern110(): void
    {
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_110, 0, 0));
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_110, 0, 1));
    }

    public function testPattern111(): void
    {
        self::assertTrue(MaskPattern::getMask(MaskPattern::PATTERN_111, 0, 0));
        self::assertFalse(MaskPattern::getMask(MaskPattern::PATTERN_111, 1, 1));
    }

    public function testInvalidPatternThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        MaskPattern::getMask(99, 0, 0);
    }

    public function testGetLostPointReturnsPositiveValue(): void
    {
        $size = 21;
        $modules = [];
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                $modules[$r][$c] = ($r + $c) % 2 === 0;
            }
        }

        $lostPoint = MaskPattern::getLostPoint($modules, $size);
        self::assertGreaterThanOrEqual(0, $lostPoint);
    }
}
