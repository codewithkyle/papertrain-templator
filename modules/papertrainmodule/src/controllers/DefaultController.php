<?php
/**
 * papertrain module for Craft CMS 3.x
 *
 * Papertrain core
 *
 * @link      https://papertrain.io/
 * @copyright Copyright (c) 2020 Kyle Andrews
 */

namespace modules\papertrainmodule\controllers;

use modules\papertrainmodule\PapertrainModule;

use Craft;
use craft\web\Controller;

/**
 * @author    Kyle Andrews
 * @package   PapertrainModule
 * @since     1.0.0
 */
class DefaultController extends Controller
{

    // Protected Properties
    // =========================================================================

    /**
     * @var    bool|array Allows anonymous access to this controller's actions.
     *         The actions must be in 'kebab-case'
     * @access protected
     */
    protected $allowAnonymous = [];

    // Public Methods
    // =========================================================================

    public function actionRenderBlock(string $block)
    {
        return PapertrainModule::getInstance()->papertrainModuleService->renderBlock($block);
    }

    public function actionLoadScript(string $script)
    {
        $filePath = dirname(__DIR__);
        $filePath .= '/assets/js/';
        $filePath .= $script;
        return Craft::$app->response->sendFile($filePath, $script);
    }
}
