<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Encoder;

use GlobusStudio\QRCode\Encoder\BitBuffer;
use PHPUnit\Framework\TestCase;

final class BitBufferTest extends TestCase
{
    public function testInitialState(): void
    {
        $buffer = new BitBuffer();
        self::assertSame(0, $buffer->getLengthInBits());
        self::assertSame([], $buffer->getBuffer());
    }

    public function testPutBitTrue(): void
    {
        $buffer = new BitBuffer();
        $buffer->putBit(true);
        self::assertSame(1, $buffer->getLengthInBits());
        self::assertTrue($buffer->get(0));
    }

    public function testPutBitFalse(): void
    {
        $buffer = new BitBuffer();
        $buffer->putBit(false);
        self::assertSame(1, $buffer->getLengthInBits());
        self::assertFalse($buffer->get(0));
    }

    public function testPutMultipleBits(): void
    {
        $buffer = new BitBuffer();
        $buffer->putBit(true);
        $buffer->putBit(false);
        $buffer->putBit(true);
        $buffer->putBit(true);
        self::assertSame(4, $buffer->getLengthInBits());
        self::assertTrue($buffer->get(0));
        self::assertFalse($buffer->get(1));
        self::assertTrue($buffer->get(2));
        self::assertTrue($buffer->get(3));
    }

    public function testPutNumber(): void
    {
        $buffer = new BitBuffer();
        $buffer->put(0b1010, 4);
        self::assertSame(4, $buffer->getLengthInBits());
        self::assertTrue($buffer->get(0));
        self::assertFalse($buffer->get(1));
        self::assertTrue($buffer->get(2));
        self::assertFalse($buffer->get(3));
    }

    public function testPutLargeNumber(): void
    {
        $buffer = new BitBuffer();
        $buffer->put(0xFF, 8);
        self::assertSame(8, $buffer->getLengthInBits());
        for ($i = 0; $i < 8; $i++) {
            self::assertTrue($buffer->get($i));
        }
    }

    public function testBufferSpansMultipleBytes(): void
    {
        $buffer = new BitBuffer();
        $buffer->put(0xFF, 8);
        $buffer->put(0x00, 8);
        self::assertSame(16, $buffer->getLengthInBits());
        self::assertSame([0xFF, 0x00], $buffer->getBuffer());
    }

    public function testGetBufferReturnsArray(): void
    {
        $buffer = new BitBuffer();
        $buffer->put(0xAB, 8);
        $result = $buffer->getBuffer();
        self::assertIsArray($result);
        self::assertSame([0xAB], $result);
    }
}
