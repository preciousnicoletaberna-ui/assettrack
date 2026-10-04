<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Renderer;

use GlobusStudio\QRCode\Renderer\PngRenderer;
use PHPUnit\Framework\TestCase;

final class PngRendererTest extends TestCase
{
    private function createMatrix(): array
    {
        return [
            [true, false, true],
            [false, true, false],
            [true, false, true],
        ];
    }

    protected function setUp(): void
    {
        if (!extension_loaded('gd')) {
            self::markTestSkipped('GD extension is not available');
        }
    }

    public function testRenderReturnsPngData(): void
    {
        $renderer = new PngRenderer(['size' => 1, 'margin' => 0]);
        $result = $renderer->render($this->createMatrix());

        self::assertStringStartsWith("\x89PNG", $result);
    }

    public function testRenderDataUriReturnsBase64(): void
    {
        $renderer = new PngRenderer(['size' => 1, 'margin' => 0]);
        $result = $renderer->renderDataUri($this->createMatrix());

        self::assertStringStartsWith('data:image/png;base64,', $result);
    }

    public function testCustomColors(): void
    {
        $renderer = new PngRenderer([
            'size' => 1,
            'margin' => 0,
            'foreground' => 0xFF0000,
            'background' => 0x00FF00,
        ]);
        $result = $renderer->render($this->createMatrix());

        self::assertStringStartsWith("\x89PNG", $result);
    }

    public function testNoGdExtensionThrows(): void
    {
        if (extension_loaded('gd')) {
            self::markTestSkipped('GD extension is loaded, cannot test missing extension');
        }

        $this->expectException(\RuntimeException::class);
        new PngRenderer();
    }
}
