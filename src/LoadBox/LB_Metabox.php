<?php

namespace HNMG\LoadBox;

use HNMG\LoadBox\LB_Functions;
use HNMG\LoadBox\LB_LoadCore;

class LB_Metabox extends LB_LoadCore {

	public function __construct( $args = array() ){
        if( ! is_array( $args ) || LB_Functions::is_empty( $args ) || empty( $args['id'] ) ){
            return;
        }
        $args['id'] = sanitize_title( $args['id'] );
        $this->args = wp_parse_args( $args, array(
            'id' => '',
            'title' => __( 'HNMG Metabox', 'hnmgbox' ),
            'context' => 'normal',
            'priority' => 'high',
            'post_types' => 'post',
            'closed' => false,
        ) );
        $this->object_type = 'metabox';
        $this->set_object_id();
        $this->args['post_types'] = (array) $this->args['post_types'];
        parent::__construct( $this->args );
        $this->hooks();
    }
	
	public function set_object_id( $object_id = 0 ){
        if( LB_Functions::is_post_page( 'new' ) ){
            return 0;
        }
        if( $object_id ){
            $this->object_id = $object_id;
        }
        if( $this->object_id ){
            return $this->object_id;
        }
        if( ! $object_id ){
            $object_id = isset( $_GET['post'] ) ? $_GET['post'] : $object_id;
        }
        if( ! $object_id ){
            $object_id = isset( $_REQUEST['post'] ) ? $_REQUEST['post'] : $object_id;
        }
        if( ! $object_id ){
            $object_id = isset( $GLOBALS['post']->ID ) ? $GLOBALS['post']->ID : 0;
        }
        $this->object_id = $object_id;
        return $this->object_id;
    }
	
	private function hooks(){
        add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
        add_action( 'save_post', array( $this, 'save_metabox' ), 10, 3 );
    }

	public function add_meta_boxes(){
        if( ! $this->should_show() ){
            return;
        }
        foreach( $this->arg( 'post_types' ) as $post_type ){
            add_meta_box(
                $this->id,
                $this->args['title'],
                array( $this, 'build_metabox' ),
                $post_type,
                $this->args['context'],
                $this->args['priority']
            );
            add_filter( "postbox_classes_{$post_type}_{$this->id}", array( $this, "add_metabox_classes" ) );
        }
    }
	
	public function build_metabox(){
        echo $this->build_hnmgbox();
    }

	public function add_metabox_classes( $classes = array() ){
        array_push( $classes, 'hnmgbox-postbox' );
        if( $this->arg( 'closed' ) && empty( $this->args['header'] ) ){
            array_push( $classes, 'closed' );
        }
        return $classes;
    }
	
	public function should_show(){
        $show = true;
        $show_callback = $this->exists_callback( 'show_callback' );
        $show_in = $this->arg( 'show_in' );
        $not_show_in = $this->arg( 'not_show_in' );

        if( $show_callback === false ){
            return false;
        } elseif( $show_callback ){
            $show = (bool) call_user_func( $this->args['show_callback'], $this );
        }
        if( ! LB_Functions::is_empty( $show_in ) ){
            if( in_array( $this->object_id, $show_in ) ){
                return true;
            } else{
                return false;
            }
        }
        if( ! LB_Functions::is_empty( $not_show_in ) ){
            if( in_array( $this->object_id, $not_show_in ) ){
                return false;
            } else{
                return true;
            }
        }

        return $show;
    }

	public function save_metabox( $post_id, $post, $update ) {
		if ( ! in_array( $post->post_type, $this->arg( 'post_types' ) ) ) {
			return $post_id;
		}
		if ( ! $this->can_save_metabox( $post ) ) {
			return $post_id;
		}
		$meta_key = $this->args['id']; 
		$this->save_fields( $post_id, $_POST, $meta_key );
	}

	
	public function set_field_value( $field_id, $value = '', $post_id = '' ){
        $field_id = $this->get_field_id( $field_id );
        if( empty( $post_id ) ){
            $post_id = $this->get_object_id();
            if( empty( $post_id ) ){
                $post_id = LB_Functions::get_the_ID();
            }
        }
        return update_post_meta( $post_id, $field_id, $value );
    }
	
	public function get_field_value( $field_id, $post_id = '', $default = '' ) {
		$field_id = $this->get_field_id( $field_id );
		if ( empty( $post_id ) ) {
			$post_id = $this->get_object_id();
			if ( empty( $post_id ) ) {
				$post_id = LB_Functions::get_the_ID();
			}
		}
		if ( ! in_array( get_post_type( $post_id ), $this->arg( 'post_types' ) ) ) {
			return $default;
		}
		$all_options = get_post_meta( $post_id, $this->arg('id'), true );
		if ( is_array( $all_options ) && isset( $all_options[ $field_id ] ) ) {
			return $all_options[ $field_id ];
		}
		return $default;
	}

	
	public function can_save_metabox( $post ){
        if( isset( $_POST[$this->get_nonce()] ) ){
            if( ! wp_verify_nonce( $_POST[$this->get_nonce()], $this->get_nonce() ) ){
                return false;
            }
        } else{
            return false;
        }
        if( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ){
            return false;
        }
        if( 'page' == $_POST['post_type'] ){
            if( ! current_user_can( 'edit_page', $post->ID ) ){
                return false;
            }
        } else{
            if( ! current_user_can( 'edit_post', $post->ID ) ){
                return false;
            }
        }
        return true;
    }

}
