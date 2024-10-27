<?php

namespace HNMG\LoadBox;

class LB_AssetsLoader {
	public static $version;
    public static $js_loaded = false;
    public static $css_loaded = false;
	protected $hnmgbox;
	protected $object_type;

	public function __construct( $version = '1.0.0' ) {
		self::$version = $version;
		add_action( 'admin_enqueue_scripts', [$this, 'load_assets'], 10 );
	}

	public function load_assets( $hook ){
		$this->load_google_fonts();
		$this->load_scripts();
		$this->load_styles();
	}

	private function load_google_fonts() {
		wp_enqueue_style( 'hnmgbox-open-sans', 'https://fonts.googleapis.com/css?family=Open+Sans:400,400i,600,600i,700', false );
	}

	private function load_scripts(){
		if( self::$js_loaded ){
			return;
		}
		$scripts = [
			//'hnmgbox-sui-dropdown' 		=> 'libs/semantic-ui/components/dropdown.js',
			//'hnmgbox-sui-transition' 	=> 'libs/semantic-ui/components/transition.min.js',
			//'hnmgbox-tipso' 			=> 'assets/js/hnmgbox-tipso.js',
			//'hnmgbox-switcher' 			=> 'assets/js/hnmgbox-switcher.js',
			//'hnmgbox-spinner' 			=> 'assets/js/hnmgbox-spinner.js',
			//'hnmgbox-confirm' 			=> 'assets/js/hnmgbox-confirm.js',
			//'hnmgbox-img-selector' 		=> 'assets/js/hnmgbox-imageselector.js',
			//'hnmgbox-colorpicker' 		=> 'assets/js/hnmgbox-colorpicker.js',
			//'hnmgbox-tab' 				=> 'assets/js/hnmgbox-tabs.js',
			'hnmgbox-ace-editor' 		=> 'libs/ace/ace.js',
			'hnmgbox' 					=> 'assets/js/hnmgbox.js',
			'hnmgbox-events' 			=> 'assets/js/hnmgbox-events.js',
			//'hnmgbox-icheck' 			=> 'assets/js/hnmgbox-icheck.js',
		];

		foreach ($scripts as $handle => $src) {
			wp_register_script($handle, HNMGBOX_URL . $src, [], self::$version);
			wp_enqueue_script($handle);
		}
		$deps_scripts = ['jquery', 'jquery-ui-core', 'jquery-ui-sortable', 'hnmgbox-libs'];
		
		if (function_exists('wp_enqueue_media')) {
			wp_enqueue_media();
		} else {
			wp_enqueue_script('media-upload');
		}
		wp_register_script( 'hnmgbox-libs', HNMGBOX_URL . 'assets/js/hnmgbox-libs.min.js', array( 'jquery' ) );
        wp_enqueue_script( 'hnmgbox-libs' );
		wp_register_script('hnmgbox-core', HNMGBOX_URL . 'assets/js/hnmgbox-core.js', $deps_scripts, self::$version);
		wp_enqueue_script('hnmgbox-core');
		wp_localize_script('hnmgbox-core', 'hnmgbox_ajax_var', [
			'url' => str_replace(['http:', 'https:'], ['', ''], admin_url('admin-ajax.php')),
			'nonce' => wp_create_nonce('ajax-nonce')
		]);
		
		wp_localize_script( 'hnmgbox', 'HNMGBOX_JS', $this->localization() );
		
		self::$js_loaded = true;
	}


	private function load_styles() {
		if (self::$css_loaded) {
			return;
		}
		$styles = [
			'hnmgbox-sui-icon' 			=> 'libs/semantic-ui/components/icon.min.css',
			'hnmgbox-sui-flag' 			=> 'libs/semantic-ui/components/flag.min.css',
			'hnmgbox-sui-dropdown' 		=> 'libs/semantic-ui/components/dropdown.min.css',
			'hnmgbox-sui-transition' 	=> 'libs/semantic-ui/components/transition.min.css',
			'hnmgbox-sui-menu' 			=> 'libs/semantic-ui/components/menu.min.css',
			'hnmgbox-tipso' 			=> 'assets/css/hnmgbox-tipso.css',
			'hnmgbox-switcher' 			=> 'assets/css/hnmgbox-switcher.css',
			'hnmgbox-radiocheckbox' 	=> 'assets/skins/minimal/_all.css',
			'hnmgbox' 					=> 'assets/css/hnmgbox.css',
		];
		
		if( LB_Functions::is_fontawesome_version( '5.x' ) ){
            wp_register_style( 'hnmgbox-awesome', HNMGBOX_URL . 'assets/css/hnmgbox-awesome-5.6.3.css', array(), self::$version );
        } else{
            wp_register_style( 'hnmgbox-awesome', HNMGBOX_URL . 'assets/css/hnmgbox-awesome.css', array(), self::$version );
        }
        wp_enqueue_style( 'hnmgbox-awesome' );


		foreach ($styles as $handle => $src) {
			wp_register_style($handle, HNMGBOX_URL . $src, [], self::$version);
			wp_enqueue_style($handle);
		}
		
		self::$css_loaded = true;
	}

	public function localization(){
		$l10n = array(
			  'ajax_url' => admin_url( 'admin-ajax.php' ),
			  'ajax_nonce' => wp_create_nonce( 'hnmgbox_ajax_nonce' ),
			  'text' => array(
				'popup' => array(
					'accept_button' => _x( 'Accept', 'Button - On confirm popup', 'hnmgbox' ),
					'cancel_button' => _x( 'Cancel', 'Button - On confirm popup', 'hnmgbox' ),
				),
				'remove_item_popup' => array(
					'title' => _x( 'Delete', 'Title - On popup "remove item"', 'hnmgbox' ),
					'content' => _x( 'Are you sure you want to delete?', 'Content - On popup "remove item"', 'hnmgbox' ),
				),
				'validation_url_popup' => array(
					'title' => _x( 'Validation', 'Title - On popup "Validation url"', 'hnmgbox' ),
					'content' => _x( 'Please enter a valid url', 'Content - On popup "Validation url"', 'hnmgbox' ),
				),
				'reset_popup' => array(
					'title' => __( 'Reset theme options', 'hnmgbox' ),
					'content' => __( 'Are you sure you want to reset all options to the default values? All saved data will be lost.', 'hnmgbox' ),
				),
				'import_popup' => array(
					'title' => _x( 'Import theme options', 'Title - On popup "Import theme options"', 'hnmgbox' ),
					'content' => _x( 'Are you sure you want to import all options? All current values will be lost and will be overwritten.', 'Content - On popup "Import theme options"', 'hnmgbox' ),
				)
			  )
			);
		return $l10n;
	}


}