<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Math;

use GlobusStudio\QRCode\Math\GaloisField;
use PHPUnit\Framework\TestCase;

final class GaloisFieldTest extends TestCase
{
    public function testExpReturnsCorrectValuesForSmallInputs(): void
    {
        self::assertSame(1, GaloisField::exp(0));
        self::assertSame(2, GaloisField::exp(1));
        self::assertSame(4, GaloisField::exp(2));
        self::assertSame(128, GaloisField::exp(7));
    }

    public function testLogReturnsCorrectValues(): void
    {
        self::assertSame(0, GaloisField::log(1));
        self::assertSame(1, GaloisField::log(2));
        self::assertSame(2, GaloisField::log(4));
        self::assertSame(7, GaloisField::log(128));
    }

    public function testLogThrowsOnZero(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        GaloisField::log(0);
    }

    public function testLogThrowsOnNegative(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        GaloisField::log(-1);
    }

    public function testExpHandlesNegativeInput(): void
    {
        $result = GaloisField::exp(-1);
        self::assertSame(GaloisField::exp(254), $result);
    }

    public function testExpHandlesLargeInput(): void
    {
        $result = GaloisField::exp(256);
        self::assertSame(GaloisField::exp(1), $result);
    }

    public function testExpLogInverse(): void
    {
        for ($i = 1; $i < 256; $i++) {
            self::assertSame($i, GaloisField::exp(GaloisField::log($i)));
        }
    }

    public function testExpTableHas256Elements(): void
    {
        for ($i = 0; $i < 255; $i++) {
            $val = GaloisField::exp($i);
            self::assertGreaterThanOrEqual(0, $val);
            self::assertLessThan(256, $val);
        }
    }
}
