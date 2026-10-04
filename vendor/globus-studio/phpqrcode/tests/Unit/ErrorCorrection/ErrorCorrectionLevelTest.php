<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\ErrorCorrection;

use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;
use PHPUnit\Framework\TestCase;

final class ErrorCorrectionLevelTest extends TestCase
{
    public function testConstants(): void
    {
        self::assertSame(1, ErrorCorrectionLevel::L);
        self::assertSame(0, ErrorCorrectionLevel::M);
        self::assertSame(3, ErrorCorrectionLevel::Q);
        self::assertSame(2, ErrorCorrectionLevel::H);
    }

    public function testIsValidTrue(): void
    {
        self::assertTrue(ErrorCorrectionLevel::isValid(ErrorCorrectionLevel::L));
        self::assertTrue(ErrorCorrectionLevel::isValid(ErrorCorrectionLevel::M));
        self::assertTrue(ErrorCorrectionLevel::isValid(ErrorCorrectionLevel::Q));
        self::assertTrue(ErrorCorrectionLevel::isValid(ErrorCorrectionLevel::H));
    }

    public function testIsValidFalse(): void
    {
        self::assertFalse(ErrorCorrectionLevel::isValid(4));
        self::assertFalse(ErrorCorrectionLevel::isValid(-1));
        self::assertFalse(ErrorCorrectionLevel::isValid(99));
    }

    public function testValidateReturnsValue(): void
    {
        self::assertSame(ErrorCorrectionLevel::L, ErrorCorrectionLevel::validate(ErrorCorrectionLevel::L));
    }

    public function testValidateThrowsOnInvalid(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        ErrorCorrectionLevel::validate(99);
    }
}
