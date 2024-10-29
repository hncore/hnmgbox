<?php

namespace HNMG\LoadBox;

use HNMG\LoadBox\LB_LoadCore;

class LB_AdminPage extends LB_LoadCore {

	public function __construct( $args = array() ){
        if( ! is_array( $args ) || LB_Functions::is_empty( $args ) || empty( $args['id'] ) ){
            return;
        }
        $args['id'] = sanitize_title( $args['id'] );
        $this->args = wp_parse_args( $args, array(
            'id' => '',
            'title' => __( 'Admin Page', 'hnmgbox' ),
            'menu_title' => __( 'HNMG Page', 'hnmgbox' ),
            'parent' => false,
            'capability' => 'manage_options',
            'position' => null,
            'icon' => '',
        ) );
        $this->object_type = 'admin-page';
        parent::__construct( $this->args );
        $this->set_object_id();
        $this->hooks();
    }
	
	public function set_object_id( $object_id = 0 ){
        if( $object_id ){
            $this->object_id = $object_id;
        }
        if( $this->object_id ){
            return $this->object_id;
        }
        $this->object_id = $this->id;
        return $this->object_id;
    }
	
	private function hooks(){
        add_action( 'admin_init', array( $this, 'init' ) );
        add_action( 'admin_menu', array( $this, 'add_admin_page' ), 101 );
        add_action( "admin_action_hnmgbox_process_form_{$this->object_id}", array( $this, 'admin_action_hnmgbox_process_form' ), 10 );
        add_action( "hnmgbox_after_save_fields_admin-page_{$this->object_id}", array( $this, 'after_save_fields' ), 10, 3 );
    }
	
	public function settings_notice_key(){
        return $this->get_object_id() . '-notices';
    }
	
	public function init(){
        register_setting( $this->id, $this->id );
    }
	
	public function add_admin_page() {
		if ( ! current_user_can( 'administrator' ) ) {
			return false;
		}
		if ( 'Theme Options' === $this->args['title'] || 'Tùy Chọn Themes' === $this->args['title'] ) {
			$current_theme = wp_get_theme();
			$this->args['menu_title'] = sprintf(__('Options %s', 'hnmgbox'), $current_theme->get('Name'));
			$this->args['title'] = sprintf(__('Options %s', 'hnmgbox'), $current_theme->get('Name'));
			add_submenu_page('hnmg-dashboard', $this->args['title'], $this->args['menu_title'], $this->args['capability'], $this->args['id'], array( $this, 'build_admin_page' ), 1);
		} else {
			add_submenu_page( "", $this->args['title'], $this->args['menu_title'], $this->args['capability'], $this->args['id'], array( $this, 'build_admin_page' ) );
		}
	}
	
	public function build_admin_page(){
        $this->set_object_id( $this->id );
        $display = "";
        $style = "
			<style>
			#setting-error-{$this->id} {
				margin-left: 1px;
				margin-right: 20px;
				margin-top: 10px;
			}
			</style>
		";
        $settings_error = get_settings_errors( $this->settings_notice_key() );
        if( $settings_error ){
            settings_errors( $this->settings_notice_key() );
        }
        $display .= "<div class='wrap hnmgbox-wrap-admin-page'>";
        if( ! empty( $this->args['title'] ) && empty( $this->args['header'] ) ){
            $display .= "<h1 class='hnmgbox-admin-page-title'>";
            $display .= "<i class='hnmgbox-icon hnmgbox-icon-cog'></i>";
            $display .= esc_html( get_admin_page_title() );
            $display .= "</h1>";
        }
        $display .= $this->get_form( $this->args['form_options'] );
        $display .= "</div>";
        echo apply_filters( $_GET['page'], $style.$display);
    }
	
	public function get_form( $form_options = array(), $echo = false ){
        $form = "";
        $args = wp_parse_args( $form_options, $this->arg( 'form_options' ) );
        $args['action'] = "admin.php?action=hnmgbox_process_form_{$this->object_id}";
        $form .= $args['insert_before'];
        $form .= "<form id='{$args['id']}' class='hnmgbox-form' action='{$args['action']}' method='{$args['method']}' enctype='multipart/form-data'>";
        $form .= wp_referer_field( false );
        $form .= "<input type='hidden' name='hnmgbox_id' value='{$this->object_id}'>";
        $form .= $this->build_hnmgbox( $this->get_object_id(), false );
        if( empty( $this->args['header'] ) ){
            $form .= $this->get_form_buttons( $args );
        }
        $form .= "</form>";
        $form .= $args['insert_after'];
        if( ! $echo ){
            return $form;
        }
        echo $form;
    }

	public function set_field_value( $field_id, $value = '' ){
        $field_id = $this->get_field_id( $field_id );
        $options = (array) get_option( $this->id );
        $options[$field_id] = $value;
        return update_option( $this->id, $options );
    }

	public function get_field_value( $field_id, $default = '' ){
        $value = '';
        $field_id = $this->get_field_id( $field_id );
        $options = get_option( $this->id );
        if( isset( $options[$field_id] ) ){
            $value = $options[$field_id];
        }
        if( LB_Functions::is_empty( $value ) ){
            return $default;
        }
        return $value;
    }
	
	public function get_options(){
        $options = get_option( $this->id );
        if( is_array( $options ) && ! empty( $options ) ){
            return $options;
        }
        return array();
    }
	
	public function admin_action_hnmgbox_process_form() {
		if ( $this->can_save_form() ) {
			$meta_key = $this->args['id'];
			$this->save_fields( $this->get_object_id(), $_POST, $meta_key );
		}
		$goback = add_query_arg( 'settings-updated', 'true', wp_get_referer() );
		wp_redirect( $goback );
		exit;
	}

	
	private function can_save_form(){
        $args = $this->arg( 'form_options' );
        $save_button = $args['save_button_name'];
        if( ! isset( $_POST[$save_button] ) && ! isset( $_POST['hnmgbox-reset'] ) && ! isset( $_POST['hnmgbox-import'] ) ){
            return false;
        }
        if( isset( $_POST[$this->get_nonce()] ) ){
            if( ! wp_verify_nonce( $_POST[$this->get_nonce()], $this->get_nonce() ) ){
                return false;
            }
        } else{
            return false;
        }

        return true;
    }
	
	public function after_save_fields( $data, $object_id, $updated_fields = array() ){
        if( $this->id != $object_id ){
            return;
        }
        if( isset( $data['display_message_on_save'] ) && $data['display_message_on_save'] == false ){
            return;
        }
        $type = 'updated';
        $this->update_message = $this->arg( 'saved_message' );
        if( $this->reset ){
            $this->update_message = $this->arg( 'reset_message' );
        }
        if( $this->import ){
            $this->update_message = $this->arg( 'import_message' );
            if( $this->update_error ){
                $this->update_message = $this->arg( 'import_message_error' );
                $type = 'error';
            }
        }
        add_settings_error( $this->settings_notice_key(), $this->id, $this->update_message, $type );
        set_transient( 'settings_errors', get_settings_errors(), 30 );
    }
	
}