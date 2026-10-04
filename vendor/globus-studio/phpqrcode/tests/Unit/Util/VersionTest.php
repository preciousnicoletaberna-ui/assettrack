<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Util;

use GlobusStudio\QRCode\Data\AbstractQRData;
use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;
use GlobusStudio\QRCode\Util\Version;
use PHPUnit\Framework\TestCase;

final class VersionTest extends TestCase
{
    public function testGetMaxLengthVersion1(): void
    {
        $length = Version::getMaxLength(1, AbstractQRData::MODE_NUMBER, ErrorCorrectionLevel::L);
        self::assertSame(41, $length);
    }

    public function testGetMaxLengthVersion1Byte(): void
    {
        $length = Version::getMaxLength(1, AbstractQRData::MODE_8BIT_BYTE, ErrorCorrectionLevel::L);
        self::assertSame(17, $length);
    }

    public function testGetMinimumVersionSmallData(): void
    {
        $version = Version::getMinimumVersion(10, AbstractQRData::MODE_NUMBER, ErrorCorrectionLevel::L);
        self::assertSame(1, $version);
    }

    public function testGetMinimumVersionLargerData(): void
    {
        $version = Version::getMinimumVersion(100, AbstractQRData::MODE_8BIT_BYTE, ErrorCorrectionLevel::M);
        self::assertGreaterThan(1, $version);
    }

    public function testGetMinimumVersionThrowsOnOverflow(): void
    {
        $this->expectException(\OverflowException::class);
        Version::getMinimumVersion(99999, AbstractQRData::MODE_8BIT_BYTE, ErrorCorrectionLevel::H);
    }

    public function testGetPatternPositionVersion1(): void
    {
        $pos = Version::getPatternPosition(1);
        self::assertSame([], $pos);
    }

    public function testGetPatternPositionVersion2(): void
    {
        $pos = Version::getPatternPosition(2);
        self::assertSame([6, 18], $pos);
    }

    public function testGetPatternPositionVersion40(): void
    {
        $pos = Version::getPatternPosition(40);
        self::assertSame([6, 30, 58, 86, 114, 142, 170], $pos);
    }

    public function testGetMaxLengthVersion40(): void
    {
        $length = Version::getMaxLength(40, AbstractQRData::MODE_8BIT_BYTE, ErrorCorrectionLevel::L);
        self::assertSame(2953, $length);
    }

    public function testInvalidModeThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Version::getMaxLength(1, 99, ErrorCorrectionLevel::L);
    }

    public function testInvalidECLevelThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Version::getMaxLength(1, AbstractQRData::MODE_NUMBER, 99);
    }
}
