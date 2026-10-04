<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Renderer;

use GlobusStudio\QRCode\Renderer\HtmlRenderer;
use PHPUnit\Framework\TestCase;

final class HtmlRendererTest extends TestCase
{
    private function createMatrix(): array
    {
        return [
            [true, false],
            [false, true],
        ];
    }

    public function testRenderReturnsHtmlTable(): void
    {
        $renderer = new HtmlRenderer();
        $result = $renderer->render($this->createMatrix());

        self::assertStringStartsWith('<table', $result);
        self::assertStringEndsWith('</table>', $result);
    }

    public function testRenderContainsCorrectCellCount(): void
    {
        $renderer = new HtmlRenderer();
        $result = $renderer->render($this->createMatrix());

        self::assertSame(4, substr_count($result, '<td'));
    }

    public function testCustomColors(): void
    {
        $renderer = new HtmlRenderer([
            'foreground' => '#ff0000',
            'background' => '#0000ff',
        ]);
        $result = $renderer->render($this->createMatrix());

        self::assertStringContainsString('#ff0000', $result);
        self::assertStringContainsString('#0000ff', $result);
    }

    public function testXssSafe(): void
    {
        $renderer = new HtmlRenderer([
            'size' => '"><script>alert(1)</script>',
        ]);
        $result = $renderer->render($this->createMatrix());

        self::assertStringNotContainsString('<script>', $result);
    }

    public function testCustomSize(): void
    {
        $renderer = new HtmlRenderer(['size' => '5px']);
        $result = $renderer->render($this->createMatrix());

        self::assertStringContainsString('5px', $result);
    }
}
