<?php
/**
 * papertrain module for Craft CMS 3.x
 *
 * Papertrain core
 *
 * @link      https://papertrain.io/
 * @copyright Copyright (c) 2020 Kyle Andrews
 */

namespace modules\papertrainmodule;

use modules\papertrainmodule\services\PapertrainModuleService as PapertrainModuleServiceService;
use modules\papertrainmodule\variables\PapertrainModuleVariable;

use Craft;
use craft\events\RegisterTemplateRootsEvent;
use craft\events\TemplateEvent;
use craft\i18n\PhpMessageSource;
use craft\web\View;
use craft\web\UrlManager;
use craft\web\twig\variables\CraftVariable;
use craft\events\RegisterUrlRulesEvent;
use craft\events\RegisterCpNavItemsEvent;
use craft\web\twig\variables\Cp;

use yii\base\Event;
use yii\base\InvalidConfigException;
use yii\base\Module;

/**
 * Class PapertrainModule
 *
 * @author    Kyle Andrews
 * @package   PapertrainModule
 * @since     1.0.0
 *
 * @property  PapertrainModuleServiceService $papertrainModuleService
 */
class PapertrainModule extends Module
{
    // Static Properties
    // =========================================================================

    /**
     * @var PapertrainModule
     */
    public static $instance;

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function __construct($id, $parent = null, array $config = [])
    {
        Craft::setAlias('@modules/papertrainmodule', $this->getBasePath());
        $this->controllerNamespace = 'modules\papertrainmodule\controllers';

        // Translation category
        $i18n = Craft::$app->getI18n();
        /** @noinspection UnSafeIsSetOverArrayInspection */
        if (!isset($i18n->translations[$id]) && !isset($i18n->translations[$id.'*'])) {
            $i18n->translations[$id] = [
                'class' => PhpMessageSource::class,
                'sourceLanguage' => 'en-US',
                'basePath' => '@modules/papertrainmodule/translations',
                'forceTranslation' => true,
                'allowOverrides' => true,
            ];
        }

        Event::on(View::class, View::EVENT_REGISTER_CP_TEMPLATE_ROOTS, function (RegisterTemplateRootsEvent $e) {
            if (is_dir($baseDir = $this->getBasePath().DIRECTORY_SEPARATOR.'templates')) {
                $e->roots['papertrain'] = $this->getBasePath().DIRECTORY_SEPARATOR.'templates';
            }
        });

        // Set this as the global instance of this module class
        static::setInstance($this);

        parent::__construct($id, $parent, $config);
    }

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();
        self::$instance = $this;

        Event::on(
            Cp::class,
            Cp::EVENT_REGISTER_CP_NAV_ITEMS,
            function(RegisterCpNavItemsEvent $event) {
                $event->navItems[] = [
                    'url' => 'papertrain/page-builder',
                    'label' => 'Page Builder',
                    'icon' => '@modules/papertrainmodule/assets/img/page-builder-icon.svg',
                ];
            }
        );

        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_CP_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                // API
                $event->rules['papertrain/api/render/<block:.*>'] = 'papertrain-module/default/render-block';
                $event->rules['papertrain/api/load/<script:.*>'] = 'papertrain-module/default/load-asset';

                // Utility
                $event->rules['papertrain/core/preact/<script:.*>'] = 'papertrain-module/default/load-core-script';
            }
        );

        Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            function (Event $event) {
                /** @var CraftVariable $variable */
                $variable = $event->sender;
                $variable->set('papertrain', PapertrainModuleVariable::class);
            }
        );

        Craft::info(
            Craft::t(
                'papertrain-module',
                '{name} module loaded',
                ['name' => 'papertrain']
            ),
            __METHOD__
        );
    }

    // Protected Methods
    // =========================================================================
}
