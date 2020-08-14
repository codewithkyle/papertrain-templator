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

/**
 * @author    Kyle Andrews
 * @package   PapertrainModule
 * @since     1.0.0
 */
class PapertrainModuleService extends Component
{
    // Public Methods
    // =========================================================================

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
