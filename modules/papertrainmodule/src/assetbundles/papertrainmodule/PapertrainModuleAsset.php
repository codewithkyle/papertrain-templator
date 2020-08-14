<?php
/**
 * papertrain module for Craft CMS 3.x
 *
 * Papertrain core
 *
 * @link      https://papertrain.io/
 * @copyright Copyright (c) 2020 Kyle Andrews
 */

namespace modules\papertrainmodule\assetbundles\papertrainmodule;

use Craft;
use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

/**
 * @author    Kyle Andrews
 * @package   PapertrainModule
 * @since     1.0.0
 */
class PapertrainModuleAsset extends AssetBundle
{
    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init()
    {
        $this->sourcePath = "@modules/papertrainmodule/assetbundles/papertrainmodule/dist";

        $this->depends = [
            CpAsset::class,
        ];

        $this->js = [
            'js/PapertrainModule.js',
        ];

        $this->css = [
            'css/PapertrainModule.css',
        ];

        parent::init();
    }
}
