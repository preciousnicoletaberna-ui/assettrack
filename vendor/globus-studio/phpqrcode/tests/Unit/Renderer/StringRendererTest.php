<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Renderer;

use GlobusStudio\QRCode\Renderer\StringRenderer;
use PHPUnit\Framework\TestCase;

final class StringRendererTest extends TestCase
{
    private function createMatrix(): array
    {
        return [
            [true, false],
            [false, true],
        ];
    }

    public function testRenderReturnsString(): void
    {
        $renderer = new StringRenderer(['margin' => 0]);
        $result = $renderer->render($this->createMatrix());

        self::assertIsString($result);
        self::assertNotEmpty($result);
    }

    public function testRenderContainsNewlines(): void
    {
        $renderer = new StringRenderer(['margin' => 0]);
        $result = $renderer->render($this->createMatrix());

        self::assertSame(2, substr_count($result, "\n"));
    }

    public function testMarginAddsLines(): void
    {
        $renderer = new StringRenderer(['margin' => 2]);
        $result = $renderer->render($this->createMatrix());

        $lines = explode("\n", rtrim($result, "\n"));
        self::assertSame(6, count($lines));
    }

    public function testCustomCharacters(): void
    {
        $renderer = new StringRenderer([
            'dark' => 'X',
            'light' => '.',
            'margin' => 0,
        ]);
        $result = $renderer->render($this->createMatrix());

        self::assertStringContainsString('X', $result);
        self::assertStringContainsString('.', $result);
    }

    public function testDefaultUsesBlockChars(): void
    {
        $renderer = new StringRenderer(['margin' => 0]);
        $result = $renderer->render($this->createMatrix());

        self::assertStringContainsString("\xe2\x96\x88", $result);
    }
}
