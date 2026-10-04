<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Renderer;

use GlobusStudio\QRCode\Renderer\RawRenderer;
use PHPUnit\Framework\TestCase;

final class RawRendererTest extends TestCase
{
    public function testRenderReturnsJson(): void
    {
        $matrix = [[true, false], [false, true]];
        $renderer = new RawRenderer();
        $result = $renderer->render($matrix);

        self::assertSame('[[1,0],[0,1]]', $result);
    }

    public function testToArrayReturnsIntMatrix(): void
    {
        $matrix = [[true, false], [false, true]];
        $renderer = new RawRenderer();
        $result = $renderer->toArray($matrix);

        self::assertSame([[1, 0], [0, 1]], $result);
    }

    public function testRenderEmptyMatrix(): void
    {
        $renderer = new RawRenderer();
        $result = $renderer->render([]);

        self::assertSame('[]', $result);
    }

    public function testToArrayAllTrue(): void
    {
        $matrix = [[true, true], [true, true]];
        $renderer = new RawRenderer();
        $result = $renderer->toArray($matrix);

        self::assertSame([[1, 1], [1, 1]], $result);
    }

    public function testToArrayAllFalse(): void
    {
        $matrix = [[false, false], [false, false]];
        $renderer = new RawRenderer();
        $result = $renderer->toArray($matrix);

        self::assertSame([[0, 0], [0, 0]], $result);
    }
}
