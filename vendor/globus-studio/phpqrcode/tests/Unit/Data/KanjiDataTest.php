<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Data;

use GlobusStudio\QRCode\Data\AbstractQRData;
use GlobusStudio\QRCode\Data\KanjiData;
use GlobusStudio\QRCode\Encoder\BitBuffer;
use PHPUnit\Framework\TestCase;

final class KanjiDataTest extends TestCase
{
    public function testKanjiMode(): void
    {
        $data = new KanjiData("\x82\x60\x82\x61");
        self::assertSame(AbstractQRData::MODE_KANJI, $data->getMode());
    }

    public function testLengthIsHalfByteLength(): void
    {
        $data = new KanjiData("\x82\x60\x82\x61");
        self::assertSame(2, $data->getLength());
    }

    public function testInvalidDataThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new KanjiData('hello');
    }

    public function testOddLengthThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new KanjiData("\x82\x60\x82");
    }

    public function testEmptyThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new KanjiData('');
    }

    public function testIsValid(): void
    {
        self::assertTrue(KanjiData::isValid("\x82\x60\x82\x61"));
        self::assertFalse(KanjiData::isValid('AB'));
        self::assertFalse(KanjiData::isValid(''));
        self::assertFalse(KanjiData::isValid("\x82"));
    }

    public function testWrite(): void
    {
        $data = new KanjiData("\x82\x60");
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(13, $buffer->getLengthInBits());
    }

    public function testWriteMultipleChars(): void
    {
        $data = new KanjiData("\x82\x60\x82\x61");
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(26, $buffer->getLengthInBits());
    }

    public function testGetLengthInBits(): void
    {
        $data = new KanjiData("\x82\x60");
        self::assertSame(8, $data->getLengthInBits(1));
        self::assertSame(10, $data->getLengthInBits(10));
        self::assertSame(12, $data->getLengthInBits(27));
    }
}
