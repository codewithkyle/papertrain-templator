<?php
/**
 * papertrain module for Craft CMS 3.x
 *
 * Papertrain core
 *
 * @link      https://papertrain.io/
 * @copyright Copyright (c) 2020 Kyle Andrews
 */

namespace modules\papertrainmodule\services;

use modules\papertrainmodule\PapertrainModule;

use Craft;
use craft\base\Component;
use craft\helpers\Template as TemplateHelper;
use craft\helpers\FileHelper;
use craft\web\View;

/**
 * @author    Kyle Andrews
 * @package   PapertrainModule
 * @since     1.0.0
 */
class PapertrainModuleService extends Component
{
    // Public Methods
    // =========================================================================
    public function renderBlock(string $block)
    {
        $model = include(FileHelper::normalizePath(Craft::$app->getPath()->getConfigPath() . '/papertrain/blocks/' . $block . '.php'));
        if (!empty($model))
        {
            $view = Craft::$app->getView();
            $view->setTemplateMode(View::TEMPLATE_MODE_SITE);

            $data = [];
            foreach ($model as $key => $value)
            {
                switch (gettype($value))
                {
                    case "string":
                        $data[$key] = TemplateHelper::raw($value);    
                        break;
                    default:
                        $data[$key] = $value;
                        break;
                }
            }
            $html = $view->renderTemplate('_blocks/' . $block, [
                'data' => $data,
            ]);

            $publicDir = $_SERVER['DOCUMENT_ROOT'];
            $css = file_get_contents($publicDir . '/assets/' . $block . '.css');
            $html .= '<style>' . $css . '</style>';

            return TemplateHelper::raw($html);
        }
        else
        {
            return null;
        }
    }

    public function injectCriticalCSS($css)
    {
        $files = array();
        if (is_array($css))
        {
            $files = $css;
        }
        elseif (is_string($css))
        {
            $files[] = $css;
        }
        else
        {
            return;
        }

        $publicDir = $_SERVER['DOCUMENT_ROOT'];
        $css = '';
        foreach ($files as $file)
        {
            try
            {
                $css .= file_get_contents($publicDir . '/assets/' . $file . '.css');
            }
            catch (Exception $e)
            {
                Craft::log('Failed to open CSS file: ' . $e->getMessage(), LogLevel::Warning, false, 'pwamodule');
            }
        }
        $html = '<style>' . $css . '</style>';
        return TemplateHelper::raw($html);
    }
}
