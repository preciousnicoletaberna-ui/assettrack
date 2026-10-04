<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\ErrorCorrection;

use GlobusStudio\QRCode\ErrorCorrection\Polynomial;
use PHPUnit\Framework\TestCase;

final class PolynomialTest extends TestCase
{
    public function testConstructorRemovesLeadingZeros(): void
    {
        $poly = new Polynomial([0, 0, 1, 2, 3]);
        self::assertSame(3, $poly->getLength());
        self::assertSame(1, $poly->get(0));
    }

    public function testGetLength(): void
    {
        $poly = new Polynomial([1, 2, 3]);
        self::assertSame(3, $poly->getLength());
    }

    public function testGetReturnsCoefficient(): void
    {
        $poly = new Polynomial([5, 10, 15]);
        self::assertSame(5, $poly->get(0));
        self::assertSame(10, $poly->get(1));
        self::assertSame(15, $poly->get(2));
    }

    public function testShiftAddsZeros(): void
    {
        $poly = new Polynomial([1, 2], 3);
        self::assertSame(5, $poly->getLength());
        self::assertSame(1, $poly->get(0));
        self::assertSame(2, $poly->get(1));
        self::assertSame(0, $poly->get(2));
    }

    public function testMultiply(): void
    {
        $a = new Polynomial([1, 1]);
        $b = new Polynomial([1, 1]);
        $result = $a->multiply($b);

        self::assertSame(3, $result->getLength());
    }

    public function testModReturnsRemainderShorterThanDivisor(): void
    {
        $a = new Polynomial([1, 0, 0, 0, 0], 0);
        $b = new Polynomial([1, 1]);
        $result = $a->mod($b);

        self::assertLessThan($b->getLength(), $result->getLength());
    }

    public function testModWithShorterDividend(): void
    {
        $short = new Polynomial([1]);
        $long = new Polynomial([1, 2, 3]);
        $result = $short->mod($long);

        self::assertSame(1, $result->getLength());
        self::assertSame(1, $result->get(0));
    }

    public function testAllZeroPolynomial(): void
    {
        $poly = new Polynomial([0, 0, 0]);
        self::assertSame(1, $poly->getLength());
    }

    public function testSingleElement(): void
    {
        $poly = new Polynomial([42]);
        self::assertSame(1, $poly->getLength());
        self::assertSame(42, $poly->get(0));
    }
}
