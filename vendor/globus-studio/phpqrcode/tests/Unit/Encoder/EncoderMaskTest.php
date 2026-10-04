<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Encoder;

use GlobusStudio\QRCode\Encoder\Encoder;
use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;
use GlobusStudio\QRCode\QRCode;
use PHPUnit\Framework\TestCase;

final class EncoderMaskTest extends TestCase
{
    public function testFixedMaskProducesDifferentResults(): void
    {
        $m0 = Encoder::encode('test', ErrorCorrectionLevel::M, null, 0);
        $m3 = Encoder::encode('test', ErrorCorrectionLevel::M, null, 3);

        self::assertNotSame($m0, $m3);
        self::assertSame(count($m0), count($m3));
    }

    public function testAllMaskPatternsValid(): void
    {
        for ($mask = 0; $mask <= 7; $mask++) {
            $matrix = Encoder::encode('test', ErrorCorrectionLevel::M, null, $mask);
            self::assertSame(21, count($matrix));
        }
    }

    public function testInvalidMaskThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Encoder::encode('test', ErrorCorrectionLevel::M, null, 8);
    }

    public function testNegativeMaskThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        Encoder::encode('test', ErrorCorrectionLevel::M, null, -1);
    }

    public function testFacadeMaskOption(): void
    {
        $m0 = QRCode::matrix('test', ['mask' => 0]);
        $m7 = QRCode::matrix('test', ['mask' => 7]);

        self::assertNotSame($m0, $m7);
    }

    public function testObjectApiWithMask(): void
    {
        $qr = new QRCode('test', ErrorCorrectionLevel::M, null, 2);
        $matrix = $qr->getMatrix();

        self::assertSame(21, count($matrix));
    }

    public function testNullMaskUsesAutoSelection(): void
    {
        $auto = Encoder::encode('test', ErrorCorrectionLevel::M, null, null);
        self::assertSame(21, count($auto));
    }
}
