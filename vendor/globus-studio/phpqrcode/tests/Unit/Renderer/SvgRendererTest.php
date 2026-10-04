<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Renderer;

use GlobusStudio\QRCode\Renderer\SvgRenderer;
use PHPUnit\Framework\TestCase;

final class SvgRendererTest extends TestCase
{
    private function createMatrix(): array
    {
        return [
            [true, false, true],
            [false, true, false],
            [true, false, true],
        ];
    }

    public function testRenderReturnsSvgString(): void
    {
        $renderer = new SvgRenderer();
        $result = $renderer->render($this->createMatrix());

        self::assertStringStartsWith('<svg', $result);
        self::assertStringEndsWith('</svg>', $result);
    }

    public function testRenderContainsXmlns(): void
    {
        $renderer = new SvgRenderer();
        $result = $renderer->render($this->createMatrix());

        self::assertStringContainsString('xmlns="http://www.w3.org/2000/svg"', $result);
    }

    public function testRenderContainsPath(): void
    {
        $renderer = new SvgRenderer();
        $result = $renderer->render($this->createMatrix());

        self::assertStringContainsString('<path', $result);
    }

    public function testCustomColors(): void
    {
        $renderer = new SvgRenderer([
            'foreground' => '#ff0000',
            'background' => '#00ff00',
        ]);
        $result = $renderer->render($this->createMatrix());

        self::assertStringContainsString('#ff0000', $result);
        self::assertStringContainsString('#00ff00', $result);
    }

    public function testCustomSize(): void
    {
        $renderer = new SvgRenderer(['size' => 5, 'margin' => 0]);
        $result = $renderer->render($this->createMatrix());

        self::assertStringContainsString('width="15"', $result);
    }

    public function testXssSafeAttributes(): void
    {
        $renderer = new SvgRenderer([
            'foreground' => '"><script>alert(1)</script>',
        ]);
        $result = $renderer->render($this->createMatrix());

        self::assertStringNotContainsString('<script>', $result);
    }

    public function testEmptyMatrixReturnsValidSvg(): void
    {
        $renderer = new SvgRenderer();
        $result = $renderer->render([]);

        self::assertStringStartsWith('<svg', $result);
        self::assertStringEndsWith('</svg>', $result);
    }
}
