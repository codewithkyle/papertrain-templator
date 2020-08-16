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

    public function getBlockData(string $id)
    {
        $html = [];
        $entry = \craft\elements\Entry::find()
                    ->section('demoBlocks')
                    ->with(['pageBuilder'])
                    ->id($id)
                    ->one();
        if (!empty($entry))
        {
            $oldMode = Craft::$app->view->getTemplateMode();
            Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_SITE);
            $html = Craft::$app->view->renderTemplate('_page-builder/data', [
                'data' => $entry['pageBuilder'][0],
            ]);
            Craft::$app->view->setTemplateMode($oldMode);
        }
        return json_decode($html);
    }

    public function getConfig()
    {
        $entries = \craft\elements\Entry::find()
                        ->section('demoBlocks')
                        ->all();
        $ret = [
            'groups' => [],
            'blocks' => [],
        ];
        foreach ($entries as $entry)
        {
            switch ($entry->type){
                case "pageBuilderGroup":
                    $ret['groups'][] = [
                        'handle' => $entry->slug,
                        'label' => $entry->title,
                    ];
                    break;
                case "pageBuilderBlock":
                    $resources = [];
                    $resourcesTable = $entry->getFieldValue('pageBuilderResources');
                    foreach ((array) $resourcesTable as $row)
                    {
                        $resources[] = $row['file'];
                    }
                    $block = \craft\elements\MatrixBlock::find()->ownerId($entry->id)->one();
                    $ret['blocks'][] = [
                        'handle' => $entry->slug,
                        'label' => $entry->title,
                        'group' => $entry->parent->slug ?? null,
                        'resources' => $resources,
                        'id' => $entry->id,
                    ];
                    break;
            }
        }
        return $ret;
    }

    public function renderBlock(string $id, string $handle)
    {
        $html = '';
        $entry = \craft\elements\Entry::find()
                    ->section('demoBlocks')
                    ->with(['pageBuilder'])
                    ->id($id)
                    ->one();
        if (!empty($entry))
        {
            $oldMode = Craft::$app->view->getTemplateMode();
            Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_SITE);
            $html = Craft::$app->view->renderTemplate('_blocks/' . $handle, [
                'data' => $entry['pageBuilder'][0],
                'imageFormat' => 'webp',
            ]);
            Craft::$app->view->setTemplateMode($oldMode);
        }
        return TemplateHelper::raw($html);
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
