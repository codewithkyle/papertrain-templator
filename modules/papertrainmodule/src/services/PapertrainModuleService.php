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

    public function getConfig()
    {
        $path = FileHelper::normalizePath(Craft::$app->getPath()->getConfigPath() . '/papertrain/papertrain.json');
        if (file_exists($path))
        {
            return $path;
        }
        return null;
    }

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
                'imageFormat' => 'webp',
            ]);

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

        $css = '';
        foreach ($files as $file)
        {
            $path = $_SERVER['DOCUMENT_ROOT'] . '/assets/' . $file . '.css';
            if (file_exists($path))
            {
                $css .= file_get_contents($path);
            }
        }
        $html = '<style>' . $css . '</style>';
        return TemplateHelper::raw($html);
    }
}
