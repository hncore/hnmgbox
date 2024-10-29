<?php

namespace HNMG\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Blade;
use Roots\Acorn\Sage\SageServiceProvider;

use HNMG\LoadCore\HN_Core;

use HNMG\LoadBox\LB_Actions;
use HNMG\LoadBox\LB_AdminPage;
use HNMG\LoadBox\LB_AssetsLoader;
use HNMG\LoadBox\LB_LoadBox;
use HNMG\LoadBox\LB_LoadCore;
use HNMG\LoadBox\LB_MetaBox;

class BoxServiceProvider extends SageServiceProvider {
    private $load;

    public function boot() {
		$this->constants();
		$this->localization();
        $this->app->make(LB_Actions::class);
        $this->app->make(LB_AdminPage::class);
        $this->app->make(LB_AssetsLoader::class);
        $this->app->make(LB_MetaBox::class);
        $this->app->make(LB_LoadCore::class);
        $this->app->make(LB_LoadBox::class);
		if (is_admin() && !has_action('hnmg_admin_init')) {
			do_action('hnmg_admin_init');
		}
		if (!has_action('hnmg_init')) {
			do_action('hnmg_init');
		}

    }
	
	public function constants(){
		define( 'HNMGBOX_DIR', trailingslashit(str_replace('src/Providers', 'resources', wp_normalize_path(dirname(__FILE__)))));
		define( 'HNMGBOX_URL', trailingslashit($this->get_url()));
		defined('HNMGBOX_FONTAWESOME_VERSION') or define('HNMGBOX_FONTAWESOME_VERSION', '4.x');
	}
	
	 private function get_url() {
        $part_dir = explode('wp-content', HNMGBOX_DIR);
        $right_part_dir = end($part_dir);
        if (preg_match('/\/themes\//', $right_part_dir)) {
            $temp = explode('/themes/', $right_part_dir, 2);
            $hnmanager_url = content_url() . '/themes/' . $temp[1];
        } elseif (preg_match('/\/plugins\//', $right_part_dir)) {
            $temp = explode('/plugins/', $right_part_dir, 2);
            $hnmanager_url = content_url() . '/plugins/' . $temp[1];
        } else {
            $hnmanager_url = ''; 
        }
        return str_replace("\\", "/", $hnmanager_url);
    }
	
	public function localization(){
		load_textdomain('hnmgbox', HNMGBOX_DIR . 'lang/hnmgbox-' . get_locale() . '.mo' );
	}
	
}
