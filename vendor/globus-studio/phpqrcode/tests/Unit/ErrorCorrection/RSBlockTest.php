<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\ErrorCorrection;

use GlobusStudio\QRCode\ErrorCorrection\ErrorCorrectionLevel;
use GlobusStudio\QRCode\ErrorCorrection\RSBlock;
use PHPUnit\Framework\TestCase;

final class RSBlockTest extends TestCase
{
    public function testGetBlocksVersion1LevelL(): void
    {
        $blocks = RSBlock::getBlocks(1, ErrorCorrectionLevel::L);
        self::assertCount(1, $blocks);
        self::assertSame(26, $blocks[0]->getTotalCount());
        self::assertSame(19, $blocks[0]->getDataCount());
    }

    public function testGetBlocksVersion1LevelH(): void
    {
        $blocks = RSBlock::getBlocks(1, ErrorCorrectionLevel::H);
        self::assertCount(1, $blocks);
        self::assertSame(26, $blocks[0]->getTotalCount());
        self::assertSame(9, $blocks[0]->getDataCount());
    }

    public function testGetBlocksVersion5LevelQ(): void
    {
        $blocks = RSBlock::getBlocks(5, ErrorCorrectionLevel::Q);
        self::assertCount(4, $blocks);
    }

    public function testGetBlocksVersion10LevelM(): void
    {
        $blocks = RSBlock::getBlocks(10, ErrorCorrectionLevel::M);
        self::assertCount(5, $blocks);
    }

    public function testGetBlocksVersion40LevelL(): void
    {
        $blocks = RSBlock::getBlocks(40, ErrorCorrectionLevel::L);
        self::assertGreaterThan(0, count($blocks));
    }

    public function testInvalidErrorCorrectionLevel(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        RSBlock::getBlocks(1, 99);
    }

    public function testDataCountLessThanTotalCount(): void
    {
        $blocks = RSBlock::getBlocks(1, ErrorCorrectionLevel::M);
        foreach ($blocks as $block) {
            self::assertLessThan($block->getTotalCount(), $block->getDataCount());
        }
    }
}
