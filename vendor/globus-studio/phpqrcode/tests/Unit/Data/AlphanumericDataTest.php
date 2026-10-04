<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Data;

use GlobusStudio\QRCode\Data\AbstractQRData;
use GlobusStudio\QRCode\Data\AlphanumericData;
use GlobusStudio\QRCode\Encoder\BitBuffer;
use PHPUnit\Framework\TestCase;

final class AlphanumericDataTest extends TestCase
{
    public function testValidAlphanumericData(): void
    {
        $data = new AlphanumericData('HELLO WORLD');
        self::assertSame(AbstractQRData::MODE_ALPHA_NUM, $data->getMode());
        self::assertSame(11, $data->getLength());
    }

    public function testInvalidDataThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new AlphanumericData('hello');
    }

    public function testIsValid(): void
    {
        self::assertTrue(AlphanumericData::isValid('HELLO'));
        self::assertTrue(AlphanumericData::isValid('0123456789'));
        self::assertTrue(AlphanumericData::isValid(' $%*+-./:'));
        self::assertFalse(AlphanumericData::isValid('hello'));
        self::assertFalse(AlphanumericData::isValid(''));
    }

    public function testWriteEvenLength(): void
    {
        $data = new AlphanumericData('AB');
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(11, $buffer->getLengthInBits());
    }

    public function testWriteOddLength(): void
    {
        $data = new AlphanumericData('ABC');
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(17, $buffer->getLengthInBits());
    }

    public function testAllValidCharacters(): void
    {
        $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
        $data = new AlphanumericData($chars);
        self::assertSame(strlen($chars), $data->getLength());
    }

    public function testGetLengthInBits(): void
    {
        $data = new AlphanumericData('A');
        self::assertSame(9, $data->getLengthInBits(1));
        self::assertSame(11, $data->getLengthInBits(10));
        self::assertSame(13, $data->getLengthInBits(27));
    }
}
