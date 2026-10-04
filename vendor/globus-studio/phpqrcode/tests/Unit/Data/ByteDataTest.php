<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Data;

use GlobusStudio\QRCode\Data\AbstractQRData;
use GlobusStudio\QRCode\Data\ByteData;
use GlobusStudio\QRCode\Encoder\BitBuffer;
use PHPUnit\Framework\TestCase;

final class ByteDataTest extends TestCase
{
    public function testByteMode(): void
    {
        $data = new ByteData('hello');
        self::assertSame(AbstractQRData::MODE_8BIT_BYTE, $data->getMode());
    }

    public function testLength(): void
    {
        $data = new ByteData('test');
        self::assertSame(4, $data->getLength());
    }

    public function testWrite(): void
    {
        $data = new ByteData('AB');
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(16, $buffer->getLengthInBits());
    }

    public function testWriteUtf8(): void
    {
        $data = new ByteData("\xC3\xA9");
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(16, $buffer->getLengthInBits());
    }

    public function testBinaryData(): void
    {
        $data = new ByteData("\x00\xFF");
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(16, $buffer->getLengthInBits());
    }

    public function testGetLengthInBits(): void
    {
        $data = new ByteData('a');
        self::assertSame(8, $data->getLengthInBits(1));
        self::assertSame(16, $data->getLengthInBits(10));
        self::assertSame(16, $data->getLengthInBits(27));
    }

    public function testEmptyString(): void
    {
        $data = new ByteData('');
        self::assertSame(0, $data->getLength());
    }
}
