<?php

namespace HNMG\LoadBox;

use HNMG\LoadBox\LB_AssetsLoader;
use HNMG\LoadBox\LB_Actions;
use HNMG\LoadBox\LB_LoadCore;
use HNMG\LoadBox\LB_Functions;

class LB_LoadBox {
	public $version;
    private static $instance = null;
    private static $loadbox = array();

    public function __construct( $version = '1.0.0' ){
        $this->version = $version;
        add_action('current_screen', array( $this, 'load_assets' ) );
    }

	public static function init( $version = '1.0.0' ){
        if( null === self::$instance ){
            self::$instance = new self( $version );
        }
        return self::$instance;
    }

	public function load_assets(){
        $load_scripts = false;
        $screen = get_current_screen();
        foreach( self::$loadbox as $hnmgbox ){
            if( is_a( $hnmgbox, 'HNMG\LoadBox\LB_Metabox' ) ){
                if( in_array( $screen->post_type, (array) $hnmgbox->arg( 'post_types' ) ) ){
                    $load_scripts = true;
                }
            } else{
                if( false !== stripos( $screen->id, $hnmgbox->id ) ){
                    $load_scripts = true;
                }
            }
        }
        if( $load_scripts ){
            new LB_AssetsLoader( $this->version );
        }
    }
	
	public static function new_hnmgbox( $options = array() ){
        if( empty( $options['id'] ) ){
            return false;
        }
        $hnmgbox = self::get( $options['id'] );
        if( $hnmgbox ){
            return $hnmgbox;
        }
        return new LB_LoadCore( $options );
    }
	
	public static function get( $hnmgbox_id ){
        $hnmgbox_id = trim( $hnmgbox_id );
        if( empty( $hnmgbox_id ) ){
            return null;
        }
        if( LB_Functions::is_empty( self::$loadbox ) || ! isset( self::$loadbox[$hnmgbox_id] ) ){
            return null;
        }

        return self::$loadbox[$hnmgbox_id];
    }
	
	public static function get_all_hnmgboxs(){
        return self::$loadbox;
    }

	public static function add( $hnmgbox ){
        if( is_a( $hnmgbox, 'HNMG\LoadBox\LB_LoadCore' ) ){
            self::$loadbox[$hnmgbox->get_id()] = $hnmgbox;
        }
    }
	
	public static function remove_hnmgbox( $id ){
        if( isset( self::$loadbox[$id] ) ){
            unset( self::$loadbox[$id] );
        }
    }

	public static function get_field_value( $hnmgbox_id, $field_id = '', $default = '', $post_id = '' ){
        $value = '';
        $hnmgbox = self::get( $hnmgbox_id );
        if( ! $hnmgbox ){
            return false;
        }
        switch( $hnmgbox->get_object_type() ){
            case 'metabox':
                $value = $hnmgbox->get_field_value( $field_id, $post_id, $default );
                break;

            case 'admin-page':
                $value = $hnmgbox->get_field_value( $field_id, $default );
                break;
        }
        if( LB_Functions::is_empty( $value ) ){
            return $default;
        }
        return $value;
    }

}
