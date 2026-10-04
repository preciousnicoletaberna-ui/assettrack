<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Data;

use GlobusStudio\QRCode\Data\ByteData;
use GlobusStudio\QRCode\Data\KanjiData;
use PHPUnit\Framework\TestCase;

final class AbstractQRDataCoverageTest extends TestCase
{
    public function testGetData(): void
    {
        $data = new ByteData('hello');
        self::assertSame('hello', $data->getData());
    }

    public function testGetLengthInBitsInvalidVersion(): void
    {
        $data = new ByteData('test');
        $this->expectException(\InvalidArgumentException::class);
        $data->getLengthInBits(0);
    }

    public function testGetLengthInBitsVersion41Invalid(): void
    {
        $data = new ByteData('test');
        $this->expectException(\InvalidArgumentException::class);
        $data->getLengthInBits(41);
    }

    public function testKanjiWriteSecondRange(): void
    {
        $data = new KanjiData("\xE0\x40");
        $buffer = new \GlobusStudio\QRCode\Encoder\BitBuffer();
        $data->write($buffer);
        self::assertSame(13, $buffer->getLengthInBits());
    }
}
