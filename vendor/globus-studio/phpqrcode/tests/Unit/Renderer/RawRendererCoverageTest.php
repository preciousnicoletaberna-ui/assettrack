<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Renderer;

use GlobusStudio\QRCode\Encoder\Encoder;
use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;
use GlobusStudio\QRCode\Renderer\RawRenderer;
use PHPUnit\Framework\TestCase;

final class RawRendererCoverageTest extends TestCase
{
    public function testToArrayWithRealMatrix(): void
    {
        $matrix = Encoder::encode('test', ErrorCorrectionLevel::M);
        $renderer = new RawRenderer();
        $result = $renderer->toArray($matrix);

        self::assertSame(count($matrix), count($result));
        foreach ($result as $row) {
            foreach ($row as $cell) {
                self::assertContains($cell, [0, 1]);
            }
        }
    }

    public function testRenderWithRealMatrix(): void
    {
        $matrix = Encoder::encode('test', ErrorCorrectionLevel::M);
        $renderer = new RawRenderer();
        $json = $renderer->render($matrix);

        $decoded = json_decode($json, true);
        self::assertIsArray($decoded);
        self::assertSame(count($matrix), count($decoded));
    }
}
