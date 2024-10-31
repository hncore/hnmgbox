<?php

namespace HNMG\LoadBox;

use HNMG\LoadBox\LB_LoadBox;
use HNMG\LoadBox\LB_Functions;
use HNMG\LoadBox\LB_Field;
use HNMG\LoadBox\LB_FieldBuilder;
use HNMG\LoadBox\LB_CSS;


class LB_LoadCore {
    public $id = 0;
    public $fields_prefix = '';
    public $args = array();
    public $fields = array();
    public $fields_objects = array();
    protected $object_id = 0;
    protected $object_type = 'metabox';//'metabox' & 'admin-page'
    protected $reset = false;
    protected $import = false;
    private $nonce = '';
    private $main_tab = false;
    public $update_message = '';
    public $update_error = false;
    public $fields_css = array();

    public function __construct( $args = array() ){
        if( empty( $args['id'] ) ){
            return;
        }

        $this->id = $args['id'];
        $this->fields_prefix = isset( $args['fields_prefix'] ) ? $args['fields_prefix'] : '';
        $this->set_args( $args );

        LB_LoadBox::add( $this );
    }

    public function __call( $name, $arguments ){
        if( LB_Functions::starts_with( 'set_', $name ) && strlen( $name ) > 4 ){
            $property = substr( $name, 4 );
            if( property_exists( $this, $property ) && isset( $arguments[0] ) ){
                $this->$property = $arguments[0];
                return $this->$property;
            }
            return null;
        } else if( LB_Functions::starts_with( 'get_', $name ) && strlen( $name ) > 4 ){
            $property = substr( $name, 4 );
            if( property_exists( $this, $property ) ){
                return $this->$property;
            }
            return null;
        } else if( property_exists( $this, $name ) ){
            return $this->$name;
        } else{
            return $this->arg( $name );
        }
    }

    public function arg( $arg = '', $default_value = null ){
        if( isset( $this->args[$arg] ) ){
            return $this->args[$arg];
        } else if( $default_value ){
            $this->args[$arg] = $default_value;
            return $this->args[$arg];
        }
        return null;
    }

    public function set_args( $args = array() ){
        $default_args = array(
            'id' => '',
            'title' => '',
            'class' => '',
            'fields_prefix' => '',
            'show_callback' => null, // Callback function to check if the metabox should be displayed
            'show_in' => array(), // Post/Page IDs where the metabox should be displayed
            'not_show_in' => array(), // Post/Page IDs where the metabox should not be displayed
            'skin' => 'blue', // Skins: blue, lightblue, green, teal, pink, purple, bluepurple, yellow, orange'
            'layout' => 'wide',// boxed & wide
            'header' => null,
            'footer' => null,
            'form_options' => array(),
            'import_settings' => array(),
            'export_settings' => array(),
            'saved_message' => __( 'Settings updated', 'hnmgbox' ),
            'reset_message' => __( 'Settings reset', 'hnmgbox' ),
            'import_message' => __( 'Settings imported', 'hnmgbox' ),
            'import_message_error' => __( 'There were problems importing the data. Please try again.', 'hnmgbox' ),
            'insert_before' => '',
            'insert_after' => '',
            'css_options' => array(),
        );

        $this->args = wp_parse_args( $args, $default_args );

        $this->args['show_in'] = (array) $this->args['show_in'];
        $this->args['not_show_in'] = (array) $this->args['not_show_in'];

        if( is_array( $this->args['header'] ) && ! empty( $this->args['header'] ) || $this->args['header'] === true ){
            $header_defaults = array(
                'icon' => '<i class="hnmgbox-icon hnmgbox-icon-cog"></i>',
                'desc' => '',
                'class' => '',
                'submit-buttons-sticky' => true,
            );
            if( $this->args['header'] === true ){
                $this->args['header'] = $header_defaults;
            } else{
                $this->args['header'] = wp_parse_args( $this->args['header'], $header_defaults );
            }
        }

        $this->args['form_options'] = wp_parse_args( $this->args['form_options'], array(
            'id' => $this->args['id'],
            'action' => '',
            'method' => 'post',
            'show_save_button' => $this->object_type == 'admin-page' ? true : false,
            'show_reset_button' => $this->object_type == 'admin-page' ? true : false,
            'save_button_id' => 'hnmgbox-save',
            'save_button_name' => 'hnmgbox-save',
            'save_button_text' => __( 'Save Changes', 'hnmgbox' ),
            'save_button_class' => '',
            'reset_button_text' => __( 'Reset to Defaults', 'hnmgbox' ),
            'reset_button_class' => '',
            'insert_after_buttons' => '',
            'insert_before_buttons' => '',
            'insert_before' => '',
            'insert_after' => '',
        ) );

        $this->args['import_settings'] = wp_parse_args( $this->args['import_settings'], array(
            'update_uploads_url' => true,
            'update_plugins_url' => true,
            'show_authentication_fields' => false,
        ) );

        $this->args['css_options'] = wp_parse_args( $this->args['css_options'], array(
            'save' => false,
            'output_path' => HNMGBOX_DIR . 'css/',
            'output_name' => "hnmgbox-css-{$this->id}.css",
            'output_style' => 'compact'//'compact', 'compressed'
        ) );

        return $this->args;
    }

    public function get_form_buttons( $form_options = array() ){
        $args = wp_parse_args( $form_options, $this->arg( 'form_options' ) );
        $save_btn = '';
        $reset_btn = '';
        if( $args['show_save_button'] ){
            //$save_btn = "<input type='submit' name='{$args['save_button_name']}' id='{$args['save_button_id']}' class='hnmgbox-form-btn hnmgbox-btn hnmgbox-btn-{$this->arg( 'skin' )} {$args['save_button_class']}' value='{$args['save_button_text']}'>";
            $save_btn = "<button type='submit' name='{$args['save_button_name']}' id='{$args['save_button_id']}' class='hnmgbox-form-btn hnmgbox-btn hnmgbox-btn-{$this->arg( 'skin' )} {$args['save_button_class']}'>{$args['save_button_text']}</button>";
        }
        if( $args['show_reset_button'] ){
            //$reset_btn = "<input type='button' name='hnmgbox-reset' id='hnmgbox-reset' class='hnmgbox-form-btn hnmgbox-btn {$args['reset_button_class']}' value='{$args['reset_button_text']}'>";
            $reset_btn = "<button type='button' name='hnmgbox-reset' id='hnmgbox-reset' class='hnmgbox-form-btn hnmgbox-btn {$args['reset_button_class']}'>{$args['reset_button_text']}</button>";
        }
        return $args['insert_before_buttons'] . $save_btn . $reset_btn . $args['insert_after_buttons'];
    }

    public function add_group( $field_args = array(), &$parent_object = null ){
        $field_args['type'] = 'group';
        return $this->add_field( $field_args, $parent_object );
    }

    public function get_group( $field_id = '', $parent_object = null ){
        return $this->get_field( $field_id, $parent_object );
    }

    public function add_tab( $field_args = array(), &$parent_object = null, $main_tab = false ){
        $object = $this->get_object( $parent_object );
        if( empty( $field_args['id'] ) ||
            $this->exists_field( $this->prefix_open_field( 'tab' ) . $field_args['id'], $object->fields ) ){
            return;
        }

        $field_args['id'] = $this->prefix_open_field( 'tab' ) . $field_args['id'];
        $field_args['type'] = 'tab';
        $field_args['action'] = 'open';
        $field_args['options']['main_tab'] = $main_tab;
        return $this->add_field( $field_args, $parent_object );
    }

    public function add_main_tab( $field_args = array(), &$parent_object = null ){
        $object = $this->get_object( $parent_object );
        if( empty( $field_args['id'] ) ||
            $this->exists_field( $this->prefix_open_field( 'tab' ) . $field_args['id'], $object->fields ) ){
            return;
        }
        if( ! $this->main_tab ){
            $this->main_tab = true;
            return $this->add_tab( $field_args, $parent_object, true );
        }
        return $this->add_tab( $field_args, $parent_object, false );
    }

    public function close_tab( $field_id = '', &$parent_object = null ){
        $object = $this->get_object( $parent_object );
        if( empty( $field_id ) ||
            $this->exists_field( $this->prefix_close_field( 'tab' ) . $field_id, $object->fields ) ){
            return;
        }
        if( ! $this->exists_field( $this->prefix_open_field( 'tab' ) . $field_id, $object->fields ) ){
            return;
        }
        $field_args['id'] = $this->prefix_close_field( 'tab' ) . $field_id;
        $field_args['type'] = 'tab';
        $field_args['action'] = 'close';
        return $this->add_field( $field_args, $parent_object );
    }

    public function open_tab_item( $item_name = '', &$parent_object = null ){
        $object = $this->get_object( $parent_object );
        if( empty( $item_name ) ){
            return;
        }
        if( $this->exists_field( $this->prefix_open_field( 'tab_item' ) . $item_name, $object->fields ) ){
            $this->remove_tab_item( $item_name, $object );
        }
        $field_args['id'] = $this->prefix_open_field( 'tab_item' ) . $item_name;
        $field_args['type'] = 'tab_item';
        $field_args['action'] = 'open';
        return $this->add_field( $field_args, $parent_object );
    }

    public function close_tab_item( $item_name = '', &$parent_object = null ){
        $object = $this->get_object( $parent_object );
        if( empty( $item_name ) ||
            $this->exists_field( $this->prefix_close_field( 'tab_item' ) . $item_name, $object->fields ) ){
            return;
        }

        if( ! $this->exists_field( $this->prefix_open_field( 'tab_item' ) . $item_name, $object->fields ) ){
            return;
        }
        $field_args['id'] = $this->prefix_close_field( 'tab_item' ) . $item_name;
        $field_args['type'] = 'tab_item';
        $field_args['action'] = 'close';
        return $this->add_field( $field_args, $parent_object );
    }

    public function open_mixed_field( $field_args = array(), &$parent_object = null ){
        $object = $this->get_object( $parent_object );
        $field_id = ! empty( $field_args['id'] ) ? $field_args['id'] : LB_Functions::random_string( 15 );
        if( $this->exists_field( $this->prefix_open_field( 'mixed' ) . $field_id, $object->fields ) ){
            $field_id = LB_Functions::random_string( 15 );
        }
        $field_args['id'] = $this->prefix_open_field( 'mixed' ) . $field_id;
        $field_args['type'] = 'mixed';
        $field_args['action'] = 'open';
        return $this->add_field( $field_args, $parent_object );
    }

    public function close_mixed_field( $field_args = array(), &$parent_object = null ){
        $object = $this->get_object( $parent_object );
        if( ! $id = $this->get_id_last_open_field( 'mixed', $object->fields ) ){
            return;
        }
        $open_field = $object->get_field( $id );
        $field_args['id'] = str_replace( $this->prefix_open_field( 'mixed' ), $this->prefix_close_field( 'mixed' ), $id );
        $field_args['type'] = 'mixed';
        $field_args['action'] = 'close';
        $field_args['desc'] = $open_field->arg( 'desc' );
        $field_args['desc_title'] = $open_field->arg( 'desc_title' );
        $field_args['options'] = $open_field->arg( 'options' );
        $field_args['insert_after_row'] = $open_field->arg( 'insert_after_row' );
        return $this->add_field( $field_args, $parent_object );
    }

    public function add_html( $field_args = array(), &$parent_object = null ){
        $field_args['type'] = 'html_content';
        return $this->add_field( $field_args, $parent_object );
    }

    public function add_section( $field_args = array(), &$parent_object = null ){
        $field_args['type'] = 'section';
        return $this->add_field( $field_args, $parent_object );
    }

    public function add_import_field( $field_args = array(), &$parent_object = null ){
        $field_args['type'] = 'import';
        $field_args['id'] = 'hnmgbox-import-field';
        return $this->add_field( $field_args, $parent_object );
    }

    public function add_export_field( $field_args = array(), &$parent_object = null ){
        $field_args['type'] = 'export';
        $field_args['id'] = 'hnmgbox-export-field';
        return $this->add_field( $field_args, $parent_object );
    }

    public function add_field( $field_args = array(), &$parent_object = null ){
        $object = $this->get_object( $parent_object );

        if( isset( $field_args['id'] ) ){
            $field_id = $this->get_field_id( $field_args['id'] );
            if ( $this->exists_field( $field_id, $object->fields ) ) {
                return $object->fields_objects[ $field_id ];
            }
        }

        if( ! $id = $this->is_valid_field( $field_args, $object->fields ) ){
            return;
        }

        $field_id = $this->get_field_id( $id );
        $field_args['id'] = $field_id;
        $object->fields[$field_id] = $field_args;
        $object->fields_objects[$field_id] = new LB_Field( $this, $object, $field_args );
        if( $this->in_mixed_field( $field_id, $object->fields ) ){
            $object->get_field( $field_id )->set_in_mixed( true );
        }
        $this->add_private_field( $object, $field_args );

        return $object->fields_objects[$field_id];
    }

    private function set_fields_structure( $object, $field_id, $field_args = array() ){
        if( is_a( $object, 'HNMG\LoadBox\LB_Field' ) ){
            switch( $object->get_real_row_level() ){
                case 1:
                    if( isset( $this->fields[$object->id] ) ){
                        $this->fields[$object->id]['fields'][$field_id] = $field_args;
                    }
                    break;

                case 2:
                    $parent = $object->get_parent( '', false );
                    if( $parent ){
                        $id = $parent->id;
                        if( isset( $this->fields[$id]['fields'][$object->id] ) ){
                            $this->fields[$id]['fields'][$object->id]['fields'][$field_id] = $field_args;
                        }
                    }
                    break;

                case 3:
                    $parent_1 = $object->get_parent( '', 1 );
                    $parent_2 = $object->get_parent( '', 2 );

                    if( $parent_1 && $parent_2 ){
                        $id_1 = $parent_1->id;
                        $id_2 = $parent_2->id;
                        if( isset( $this->fields[$id_1]['fields'][$id_2]['fields'][$object->id] ) ){
                            $this->fields[$id_1]['fields'][$id_2]['fields'][$object->id]['fields'][$field_id] = $field_args;
                        }
                    }
                    break;
            }
        }
    }

    private function add_private_field( $object, $field_args = array() ){
        if( $field_args['type'] == 'file' ){
            $field = $object->get_field( $field_args['id'] );

            //Agregamos campo privado para guardar el id de cada archivo
            $object->add_field( array(
                'id' => $field_args['id'] . '_id',
                'type' => 'private',
                'options' => array(
                    'multiple' => $field->arg( 'options', 'multiple' ),
                ),
                'repeatable' => $field->arg( 'repeatable' ),
            ) );
        }

        if( $field_args['type'] == 'number' ){
            $field = $object->get_field( $field_args['id'] );

            //Agregamos campo privado para guardar la unidad del número
            $object->add_field( array(
                'id' => $field_args['id'] . '_unit',
                'type' => 'private',
                'default' => $field->args['options']['unit'],
                'repeatable' => $field->arg( 'repeatable' ),
            ) );
        }

        if( $field_args['type'] == 'group' ){
            $group_object = $object->get_field( $field_args['id'] );

            //Agregamos campos privados adicionales para el grupo
            $group_object->add_field( array(
                'id' => $field_args['id'] . '_name',
                'type' => 'private',
            ) );
            $group_object->add_field( array(
                'id' => $field_args['id'] . '_type',
                'type' => 'private',
                'default' => $group_object->args['controls']['default_type'],
            ) );
            $group_object->add_field( array(
                'id' => $field_args['id'] . '_visibility',
                'type' => 'private',
                'default' => 'visible',
            ) );
        }
    }

    public function get_object( $parent_object = null ){
        $object = $this;
        if( $parent_object != null ){
            $object = $parent_object;
        }
        return $object;
    }

    public function get_field( $field_id = '', $parent_object = null ){
        $field_id = $this->get_field_id( $field_id );
        $object = $this->get_object( $parent_object );
        if( isset( $object->fields_objects[$field_id] ) ){
            return $object->fields_objects[$field_id];
        }
        return null;
    }

    public function is_valid_field( $field_args, $fields = array() ){
        if( isset( $field_args['type'] ) && empty( $field_args['id'] ) ){
            $field_id = LB_Functions::random_string( 15 );
            if( in_array( $field_args['type'], array( 'title', 'html', 'html_content', 'section' ) ) ){
                $field_args['id'] = $field_id;
            }
        }

        if( ! is_array( $field_args ) || empty( $field_args ) || ! isset( $field_args['id'] ) ){
            return false;
        }
        $field_id = str_replace( $this->fields_prefix, '', $field_args['id'] );
        if( empty( $field_id ) || empty( $field_args['type'] ) ){
            return false;
        }

        $field_id = $this->get_field_id( $field_args['id'] );

        return $field_id;
    }

    public function exists_field( $field_id, $fields = array() ){
        $field_id = $this->get_field_id( $field_id );
        if( isset( $fields[$field_id] ) ){
            return true;
        }
        return false;
    }

    public function get_field_id( $field_id ){
        $field_id = LB_Functions::str_trim_to_lower( $field_id, '-' );
        if( ! LB_Functions::starts_with( $this->fields_prefix, $field_id ) ){
            return $this->fields_prefix . $field_id;
        }
        return $field_id;
    }

    public function in_mixed_field( $field_id, $fields = array() ){
        $in_mixed = false;
        if( LB_Functions::starts_with( $this->prefix_open_field( 'mixed' ), $field_id ) || LB_Functions::starts_with( $this->prefix_close_field( 'mixed' ), $field_id ) ){
            return false;
        }
        foreach( $fields as $field ){
            if( LB_Functions::starts_with( $this->prefix_open_field( 'mixed' ), $field['id'] ) ){
                $in_mixed = true;
            } elseif( LB_Functions::starts_with( $this->prefix_close_field( 'mixed' ), $field['id'] ) ){
                $in_mixed = false;
            }
        }
        return $in_mixed;
    }

    public function remove_field( $field_id = '', $parent_object = null ){
        $field_id = $this->get_field_id( $field_id );
        $object = $this->get_object( $parent_object );
        if( isset( $object->fields_objects[$field_id] ) ){
            unset( $object->fields_objects[$field_id] );
            unset( $object->fields[$field_id] );
        }
    }

    public function remove_tab_item( $item_name = '', $parent_object = null ){
        $object = $this->get_object( $parent_object );
        $remove = false;
        foreach( $object->fields_objects as $key => $field ){
            if( $key == $this->prefix_open_field( 'tab_item' ) . $item_name ){
                $remove = true;
            } else if( $key == $this->prefix_close_field( 'tab_item' ) . $item_name ){
                $remove = false;
                unset( $object->fields_objects[$key] );
                unset( $object->fields[$key] );
            }
            if( $remove ){
                unset( $object->fields_objects[$key] );
                unset( $object->fields[$key] );
            }
        }
    }

    public function prefix_open_field( $type ){
        return $this->fields_prefix . "open-{$type}-";
    }

    public function prefix_close_field( $type ){
        return $this->fields_prefix . "close-{$type}-";
    }

    private function get_id_last_open_field( $type, $fields = array() ){
        $id = '';
        foreach( $fields as $field ){
            if( LB_Functions::starts_with( $this->prefix_open_field( $type ), $field['id'] ) ){
                $id = $field['id'];
            } elseif( LB_Functions::starts_with( $this->prefix_close_field( $type ), $field['id'] ) ){
                $id = '';
            }
        }
        return $id;
    }

    public function build_hnmgbox( $object_id = 0, $echo = false ){
        $return = "";
        $return .= $this->create_nonce();

        if( $object_id ){
            $this->object_id = $object_id;
        } else{
            $this->set_object_id();
        }

        $skin = 'hnmgbox-skin-' . $this->arg( 'skin' );

        $hnmgbox_class = "hnmgbox hnmgbox-{$this->object_type} hnmgbox-clearfix hnmgbox-radius hnmgbox-{$this->arg('layout')} {$this->arg('class')} $skin";

        if( $this->main_tab ){
            $hnmgbox_class .= ' hnmgbox-has-main-tab';
        }
        $return .= $this->arg( 'insert_before' );
        $return .= "<div id='hnmgbox-{$this->id}' class='$hnmgbox_class' data-skin='$skin' data-prefix='$this->fields_prefix' data-object-id='$this->object_id' data-object-type='$this->object_type'>";
        $return .= $this->build_header();
        $return .= $this->build_fields();
        $return .= $this->build_footer();
        $return .= "</div>";
        $return .= $this->arg( 'insert_after' );

        if( ! $echo ){
            return $return;
        }
        echo $return;
    }

    public function build_fields(){
        $return = '';
        foreach( $this->fields_objects as $field ){
            $field_builder = new LB_FieldBuilder( $field );
            $return .= $field_builder->build();
        }
        return $return;
    }

    public function create_nonce(){
        $nonce = $this->get_nonce();
        return wp_nonce_field( $nonce, $nonce, false, false );
    }

    public function get_nonce(){
        if( empty( $this->nonce ) ){
            $this->nonce = sanitize_text_field( 'hnmgbox_nonce_' . $this->id );
        }
        return $this->nonce;
    }

    public function build_header(){
        $return = '';
        $header = $this->arg( 'header' );
        if( empty( $header ) ){
            return '';
        }

        $style = "<style>";
        $style .= "
			.hnmgbox-postbox#{$this->id} > .hndle,
			.hnmgbox-postbox#{$this->id} > .handlediv {
				display: none !important;
			}
			.hnmgbox-postbox#{$this->id} > button {
				display: none !important;
			}
		";
        $style .= "</style>";

        $icon = ! empty( $header['icon'] ) ? trim( $header['icon'] ) : '';

        $header_class = 'hnmgbox-header hnmgbox-clearfix ' . $header['class'];
        if( LB_Functions::starts_with( '<img', $icon ) ){
            $header_class .= ' hnmgbox-has-logo';
        }

        $return .= "<div class='$header_class'>";
			
				$return .= "<div class='hnmgbox-header-actions' data-sticky='{$header['submit-buttons-sticky']}'>";
				$return .= $this->get_form_buttons();
				$return .= "</div>";
			
        $return .= "</div>";
        return $style . $return;
    }

    public function build_footer(){
        $return = '';
        $footer = $this->arg( 'footer' );
        if( $footer === null ){
            return '';
        }
        $return .= "<div class='hnmgbox-footer'>";
        $return .= "<div class='hnmgbox-footer-content'>";
        $return .= $footer === true ? "<span>HNMG Framework</span>" : $footer;
        $return .= "</div>";
        $return .= "</div>";
        return $return;
    }

    public function get_post_format($type) {
        $post_formats = array(
            'movie' => 'aside',
            'movies' => 'aside',
            'single_movies' => 'aside',
            'tv_series' => 'gallery',
            'tv_shows' => 'video',
            'theater_movie' => 'audio'
        );
        $post_format = $type ? $post_formats[$type] : '';
        return $post_format;
    }
	
	public function save_fields( $post_id = 0, $data = array(), $meta_key = '' ){
		$data = ! empty( $data ) ? $data : $_POST;
		$this->set_object_id();
		$updated_fields = array();
		$haun_metabox_options = array();
		$post_format = isset( $data['haun_movie_formality'] ) ? $data['haun_movie_formality'] : '';
		if( isset( $data['hnmgbox-import'] ) ){
			$this->import = true;
			$importer = new LB_Importer( $this, $data );
			$import_data = $importer->get_import_hnmgbox_data();
			if( $import_data !== false ){
				$data = wp_parse_args( $import_data, $data );
			} else {
				$this->update_error = true;
			}
		}
		do_action( "hnmgbox_before_save_fields", $this->object_id, $this );
		do_action( "hnmgbox_before_save_fields_{$this->object_type}", $this->object_id, $this );
		foreach ( $this->fields_objects as $field ){
			$field_id = $field->arg( 'id' );
			$field_value = isset( $data[ $field_id ] ) ? $data[ $field_id ] : '';
			if ($field->arg('type') == 'section') {
				foreach ($field->fields_objects as $_field) {
					$sub_field_id = $_field->arg('id');
					$sub_field_value = isset($data[$sub_field_id]) ? $data[$sub_field_id] : '';
					if (strpos($meta_key, '_metabox_options') !== false) {
						if ($_field->arg('type') == 'group' && isset($sub_field_value['1000'])) {
							unset($sub_field_value['1000']);
						}
						$haun_metabox_options[$sub_field_id] = $sub_field_value;
					} else {
						$updated = $this->save_field($_field, $data);
						if ($updated) {
							$updated_fields[] = $updated;
						}
					}
				}
			} else {
				if (strpos($meta_key, '_metabox_options') !== false) {
					if ($field->arg('type') == 'group' && isset($field_value['1000'])) {
						unset($field_value['1000']);
					}
					$haun_metabox_options[$field_id] = $field_value;
				} else {
					$updated = $this->save_field($field, $data);
					if ($updated) {
						$updated_fields[] = $updated;
					}
				}
			}


		}
		
		if ( ! empty( $haun_metabox_options ) ) {
			update_post_meta( $post_id, $meta_key, $haun_metabox_options );
			if ( $meta_key === HNMG_METAPOST && ! empty( $post_format ) ) {
				$post_format_type = $this->get_post_format( $post_format );
				set_post_format( $post_id, $post_format_type );
			}
		}
		
		do_action( "hnmgbox_after_save_fields", $this->object_id, $updated_fields, $this );
		do_action( "hnmgbox_after_save_fields_{$this->object_type}", $this->object_id, $updated_fields, $this );
	}

    public function save_field( $field, $data = array() ){
        $value = isset( $data[$field->id] ) ? $data[$field->id] : '';
        if( in_array( $field->arg( 'type' ), $this->exclude_field_type_for_save() ) ){
            return false;
        }
        if( isset( $data['hnmgbox-reset'] ) ){
            $value = $field->arg( 'default' );
            $this->reset = true;
        }
        if( $field->arg( 'type' ) == 'group' ){
            $value = (array) $value;
            if( isset( $value['1000'] ) ){
                unset( $value['1000'] );//Remove source item
                $value = array_values( $value );
            }

            $value = (array) $field->sanitize_group( $value, true );
            $field->value = null;
        }

        $value = apply_filters( "hnmgbox_filter_field_value_{$field->id}", $value );

        do_action( "hnmgbox_before_save_field", $field->id, $value, $field );
        do_action( "hnmgbox_before_save_field_{$field->id}", $value, $field );

        $saved = $field->save( $value );
        $updated = $saved['updated'];
        $value = $saved['value'];

        do_action( "hnmgbox_after_save_field", $field->id, $value, $field, $updated );
        do_action( "hnmgbox_after_save_field_{$field->id}", $value, $field, $updated );
        if( $field->arg( 'type' ) != 'group' ){
            $css = $field->arg( 'css' );
            if( ! empty( $css['selector'] ) ){
                $this->fields_css[$field->id] = $css;
                $this->fields_css[$field->id]['value'] = str_replace( '{value}', $value, $css['value'] );
            }
        }

        if( $updated ){
            return $field->id;
        }
        return false;
    }

    public function generate_css_file( $field ){
        $css_options = $this->arg( 'css_options' );
        if( empty( $this->fields_css ) || ! $css_options['save'] ){
            return;
        }
        $style = '';
        $css = new LB_CSS();
        foreach( $this->fields_css as $rule ){
            $css->selector = $rule['selector'];
            $value = $rule['important'] ? $rule['value'] . ' !important' : $rule['value'];
            $css->prop( $rule['property'], $value );
            $style .= $css->build_css();
            if( $css_options['output_style'] == 'compact' ){
                $style .= "\n";
            }
            $css->css = array();
        }
        $file_path = trailingslashit( $css_options['output_path'] ) . $css_options['output_name'];
        if( is_writable( $css_options['output_path'] ) ){
            file_put_contents( $file_path, $style );
        }
    }

    public function get_fields_data( $format = 'json' ){
        $fields_data = array();
        foreach( $this->fields_objects as $field ){
            if( $field->arg( 'type' ) == 'section' ){
                foreach( $field->fields_objects as $_field ){
                    $data = $this->get_field_data( $_field );
                    if( $data !== false ){
                        $fields_data[$_field->id] = $data;
                    }
                }
            } else{
                $data = $this->get_field_data( $field );
                if( $data !== false ){
                    $fields_data[$field->id] = $data;
                }
            }
        }
        $fields_data['wp_upload_dir'] = wp_upload_dir()['baseurl'];
        $fields_data['plugins_url'] = plugins_url();

        if( $format == 'json' ){
            return json_encode( $fields_data );
        }

        return $fields_data;
    }

    public function get_field_data( $field ){
        $value = '';
        if( in_array( $field->arg( 'type' ), $this->exclude_field_type_for_save() ) ){
            return false;
        }

        $value = $field->get_saved_value();

        if( $field->arg( 'type' ) == 'group' ){
            $value = (array) $field->sanitize_group( $value );
        } else{
            $value = $field->sanitize_value( $value );
        }
        return $value;
    }

    public function exists_callback( $callback = '', $object = null ){
        if( $object == null ){
            $object = $this;
        }
        if( ! isset( $object->args[$callback] ) ){
            return '';
        }
        if( $object->args[$callback] === false ){
            return false;
        }
        if( is_callable( $object->args[$callback] ) ){
            return true;
        }
        return null;
    }

    public function exclude_field_type_for_save(){
        return array( 'title', 'tab', 'tab_item', 'mixed', 'section', 'import', 'export', 'html', 'html_content', 'button' );
    }

}