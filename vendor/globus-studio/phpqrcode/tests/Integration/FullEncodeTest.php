<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Integration;

use GlobusStudio\QRCode\Encoder\Encoder;
use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;
use GlobusStudio\QRCode\QRCode;
use PHPUnit\Framework\TestCase;

final class FullEncodeTest extends TestCase
{
    /**
     * @dataProvider versionDataProvider
     */
    public function testModuleCountMatchesVersionFormula(int $version): void
    {
        $data = str_repeat('0', $version);
        $matrix = Encoder::encode($data, ErrorCorrectionLevel::L, $version);
        $expectedSize = $version * 4 + 17;

        self::assertSame($expectedSize, count($matrix));
        self::assertSame($expectedSize, count($matrix[0]));
    }

    /**
     * @return array<string, array{int}>
     */
    public static function versionDataProvider(): array
    {
        $data = [];
        for ($v = 1; $v <= 10; $v++) {
            $data["version-$v"] = [$v];
        }

        return $data;
    }

    public function testFacadeSvg(): void
    {
        $svg = QRCode::svg('https://example.com');
        self::assertStringStartsWith('<svg', $svg);
        self::assertStringContainsString('xmlns', $svg);
    }

    public function testFacadeHtml(): void
    {
        $html = QRCode::html('test data');
        self::assertStringStartsWith('<table', $html);
        self::assertStringContainsString('</table>', $html);
    }

    public function testFacadeString(): void
    {
        $str = QRCode::string('test');
        self::assertNotEmpty($str);
        self::assertStringContainsString("\n", $str);
    }

    public function testFacadeMatrix(): void
    {
        $matrix = QRCode::matrix('test');
        self::assertNotEmpty($matrix);
        self::assertIsBool($matrix[0][0]);
    }

    public function testFacadePng(): void
    {
        if (!extension_loaded('gd')) {
            self::markTestSkipped('GD extension is not available');
        }

        $png = QRCode::png('test');
        self::assertStringStartsWith('data:image/png;base64,', $png);
    }

    public function testObjectApi(): void
    {
        $qr = new QRCode('hello world', ErrorCorrectionLevel::H);
        $matrix = $qr->getMatrix();

        self::assertNotEmpty($matrix);
        self::assertSame(count($matrix), count($matrix[0]));
    }

    public function testMatrixIsCachedOnInstance(): void
    {
        $qr = new QRCode('test');
        $matrix1 = $qr->getMatrix();
        $matrix2 = $qr->getMatrix();

        self::assertSame($matrix1, $matrix2);
    }

    public function testEmptyDataThrows(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new QRCode('');
    }

    public function testAllErrorCorrectionLevels(): void
    {
        $levels = [
            ErrorCorrectionLevel::L,
            ErrorCorrectionLevel::M,
            ErrorCorrectionLevel::Q,
            ErrorCorrectionLevel::H,
        ];

        foreach ($levels as $level) {
            $matrix = Encoder::encode('test', $level);
            self::assertSame(21, count($matrix));
        }
    }

    public function testNumericModeUsed(): void
    {
        $matrix = Encoder::encode('1234567890', ErrorCorrectionLevel::L);
        self::assertSame(21, count($matrix));
    }

    public function testAlphanumericModeUsed(): void
    {
        $matrix = Encoder::encode('HELLO WORLD', ErrorCorrectionLevel::L);
        self::assertSame(21, count($matrix));
    }

    public function testLargeDataVersion40(): void
    {
        $data = str_repeat('A', 1800);
        $matrix = Encoder::encode($data, ErrorCorrectionLevel::L);
        self::assertGreaterThan(100, count($matrix));
    }

    public function testSpecialCharacters(): void
    {
        $matrix = Encoder::encode("Hello\nWorld\t!", ErrorCorrectionLevel::M);
        self::assertNotEmpty($matrix);
    }

    public function testUnicodeData(): void
    {
        $matrix = Encoder::encode("\xD0\x9F\xD1\x80\xD0\xB8\xD0\xB2\xD0\xB5\xD1\x82", ErrorCorrectionLevel::M);
        self::assertNotEmpty($matrix);
    }
}
