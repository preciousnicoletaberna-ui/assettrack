<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Data;

use GlobusStudio\QRCode\Data\AbstractQRData;
use GlobusStudio\QRCode\Data\NumericData;
use GlobusStudio\QRCode\Encoder\BitBuffer;
use PHPUnit\Framework\TestCase;

final class NumericDataTest extends TestCase
{
    public function testValidNumericData(): void
    {
        $data = new NumericData('0123456789');
        self::assertSame(AbstractQRData::MODE_NUMBER, $data->getMode());
        self::assertSame(10, $data->getLength());
    }

    public function testInvalidDataThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new NumericData('12A34');
    }

    public function testIsValid(): void
    {
        self::assertTrue(NumericData::isValid('0123456789'));
        self::assertFalse(NumericData::isValid('12A'));
        self::assertFalse(NumericData::isValid(''));
    }

    public function testWriteThreeDigits(): void
    {
        $data = new NumericData('123');
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(10, $buffer->getLengthInBits());
    }

    public function testWriteOneRemainingDigit(): void
    {
        $data = new NumericData('1234');
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(14, $buffer->getLengthInBits());
    }

    public function testWriteTwoRemainingDigits(): void
    {
        $data = new NumericData('12345');
        $buffer = new BitBuffer();
        $data->write($buffer);
        self::assertSame(17, $buffer->getLengthInBits());
    }

    public function testGetLengthInBitsVersion1(): void
    {
        $data = new NumericData('123');
        self::assertSame(10, $data->getLengthInBits(1));
    }

    public function testGetLengthInBitsVersion10(): void
    {
        $data = new NumericData('123');
        self::assertSame(12, $data->getLengthInBits(10));
    }

    public function testGetLengthInBitsVersion27(): void
    {
        $data = new NumericData('123');
        self::assertSame(14, $data->getLengthInBits(27));
    }
}
