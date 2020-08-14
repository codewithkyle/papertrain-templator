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

    public function actionLoadAsset(string $file)
    {
        $path = $_SERVER['DOCUMENT_ROOT'] . '/assets/' . $file;
        if (file_exists($path))
        {
            return Craft::$app->response->sendFile($path, $file);
        }
        else
        {
            return Craft::$app->getResponse()->setStatusCode(404);
        }
    }

    public function actionLoadCoreScript(string $script)
    {
        $filePath = dirname(__DIR__);
        $filePath .= '/assets/js/';
        $filePath .= $script;
        if (file_exists($filePath))
        {
            return Craft::$app->response->sendFile($filePath, $script);
        }
        else
        {
            return Craft::$app->getResponse()->setStatusCode(404);
        }
    }
}
