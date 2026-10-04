<?php

declare(strict_types=1);

namespace GlobusStudio\QRCode\Tests\Unit\Encoder;

use GlobusStudio\QRCode\Encoder\MaskPattern;
use PHPUnit\Framework\TestCase;

final class MaskPatternCoverageTest extends TestCase
{
    public function testGetBestPatternReturnsValidPattern(): void
    {
        $size = 21;
        $modules = [];
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                $modules[$r][$c] = null;
            }
        }

        $pattern = MaskPattern::getBestPattern($modules, $size);
        self::assertGreaterThanOrEqual(0, $pattern);
        self::assertLessThan(8, $pattern);
    }

    public function testGetBestPatternWithMixedModules(): void
    {
        $size = 21;
        $modules = [];
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                if ($r < 7 && $c < 7) {
                    $modules[$r][$c] = true;
                } elseif ($r < 7 && $c > $size - 8) {
                    $modules[$r][$c] = true;
                } else {
                    $modules[$r][$c] = null;
                }
            }
        }

        $pattern = MaskPattern::getBestPattern($modules, $size);
        self::assertGreaterThanOrEqual(0, $pattern);
        self::assertLessThan(8, $pattern);
    }

    public function testGetLostPointWithUniformDarkMatrix(): void
    {
        $size = 21;
        $modules = [];
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                $modules[$r][$c] = true;
            }
        }

        $lostPoint = MaskPattern::getLostPoint($modules, $size);
        self::assertGreaterThan(0, $lostPoint);
    }

    public function testGetLostPointWithUniformLightMatrix(): void
    {
        $size = 21;
        $modules = [];
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                $modules[$r][$c] = false;
            }
        }

        $lostPoint = MaskPattern::getLostPoint($modules, $size);
        self::assertGreaterThan(0, $lostPoint);
    }

    public function testGetLostPointLevel3PatternHorizontal(): void
    {
        $size = 21;
        $modules = [];
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                $modules[$r][$c] = false;
            }
        }

        $modules[0][0] = true;
        $modules[0][1] = false;
        $modules[0][2] = true;
        $modules[0][3] = true;
        $modules[0][4] = true;
        $modules[0][5] = false;
        $modules[0][6] = true;

        $lostPoint = MaskPattern::getLostPoint($modules, $size);
        self::assertGreaterThan(0, $lostPoint);
    }

    public function testGetLostPointLevel3PatternVertical(): void
    {
        $size = 21;
        $modules = [];
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                $modules[$r][$c] = false;
            }
        }

        $modules[0][0] = true;
        $modules[1][0] = false;
        $modules[2][0] = true;
        $modules[3][0] = true;
        $modules[4][0] = true;
        $modules[5][0] = false;
        $modules[6][0] = true;

        $lostPoint = MaskPattern::getLostPoint($modules, $size);
        self::assertGreaterThan(0, $lostPoint);
    }
}
