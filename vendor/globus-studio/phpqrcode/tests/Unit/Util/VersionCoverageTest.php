<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Util;

use GlobusStudio\QRCode\Data\AbstractQRData;
use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;
use GlobusStudio\QRCode\Util\Version;
use PHPUnit\Framework\TestCase;

final class VersionCoverageTest extends TestCase
{
    public function testGetMaxLengthVersion11(): void
    {
        $length = Version::getMaxLength(11, AbstractQRData::MODE_NUMBER, ErrorCorrectionLevel::L);
        self::assertSame(772, $length);
    }

    public function testGetMaxLengthVersion20(): void
    {
        $length = Version::getMaxLength(20, AbstractQRData::MODE_8BIT_BYTE, ErrorCorrectionLevel::M);
        self::assertGreaterThan(0, $length);
    }

    public function testGetMaxLengthVersion30Kanji(): void
    {
        $length = Version::getMaxLength(30, AbstractQRData::MODE_KANJI, ErrorCorrectionLevel::Q);
        self::assertGreaterThan(0, $length);
    }

    public function testGetMaxLengthInvalidVersion(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Version::getMaxLength(0, AbstractQRData::MODE_NUMBER, ErrorCorrectionLevel::L);
    }

    public function testGetMaxLengthVersion41(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Version::getMaxLength(41, AbstractQRData::MODE_NUMBER, ErrorCorrectionLevel::L);
    }

    public function testGetMinimumVersionForAllModes(): void
    {
        $v = Version::getMinimumVersion(10, AbstractQRData::MODE_ALPHA_NUM, ErrorCorrectionLevel::M);
        self::assertSame(1, $v);

        $v = Version::getMinimumVersion(5, AbstractQRData::MODE_KANJI, ErrorCorrectionLevel::H);
        self::assertGreaterThanOrEqual(1, $v);
    }

    public function testGetMaxLengthAllLevelsVersion15(): void
    {
        $levels = [ErrorCorrectionLevel::L, ErrorCorrectionLevel::M, ErrorCorrectionLevel::Q, ErrorCorrectionLevel::H];
        foreach ($levels as $level) {
            $length = Version::getMaxLength(15, AbstractQRData::MODE_8BIT_BYTE, $level);
            self::assertGreaterThan(0, $length);
        }
    }
}
