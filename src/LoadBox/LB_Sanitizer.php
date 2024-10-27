<?php

namespace HNMG\LoadBox;

use HNMG\LoadBox\LB_Functions;

class LB_Sanitizer {
	public $field = null;
	public $value = null;
	public $default_value = '';

	public function __construct( $field, $value ){
		$this->field = $field;
		$this->value = $value;
		if( $this->field->is_saved_field() ) {
			$this->default_value = $this->field->validate_value('');
		} else {
			$this->default_value = $this->field->arg( 'default' );
		}
	}
	
	public function __call( $name, $arguments ) {
		return $this->sanitize();
	}

	public function sanitize(){
		$sanitized_value = '';
		switch ( $this->field->arg( 'type' ) ) {
			case 'wp_editor':
				$sanitized_value = $this->sanitize_value( $this->value, 'wp_kses_post' );
			break;
			case 'code_editor':
			case 'textarea':
				$sanitized_value = $this->sanitize_value( stripslashes( $this->value ), 'wp_specialchars_decode' );
			break;
            case 'text':
                $sanitized_value = $this->sanitize_value( stripslashes( $this->value ) , 'wp_specialchars_decode' );
            break;
			default:
				$sanitized_value = $this->sanitize_value( $this->value, 'sanitize_text_field' );
			break;
		}
		return $sanitized_value;
	}
	
	public function sanitize_value( $value = null, $sanitize_function = 'sanitize_text_field' ){
		if( $value === null ){
			$value = $this->value;
		}
		if( LB_Functions::is_empty( $value ) ){
			return '';
		}
		if( is_array( $value ) ){
			return array_map( $sanitize_function, $value );
		}
		return call_user_func( $sanitize_function, $value );
	}
	
	public function checkbox(){
		$value = $this->validate_multiple_values( $this->value, array_keys( $this->field->arg( 'items' ) ), true );
		return $this->sanitize_value( $value );
	}
	
	public function colorpicker(){
		$value = trim( $this->value );
		$value = $this->field->validate_colorpicker( $value );
		if( $value ){
			return $this->sanitize_value( $value );
		} else if( LB_Functions::get_format_color( $this->default_value ) ){
			return $this->sanitize_value( $this->default_value );
		}
		return '';
	}	
	
	public function file(){
		if( $this->field->arg( 'options', 'multiple' ) ){
			$files = (array) $this->value;
			$value = array();
			foreach ( $files as $file_url ){
				if( $val = $this->validate_file_value( $file_url ) ){
					$value[] = $val;
				}
			}
		} else {
			$value = $this->validate_file_value( $this->value );
		}
		if( LB_Functions::is_empty( $value ) ){
			$value = $this->validate_file_value( $this->default_value );
		}
		return $this->sanitize_value( $value );
	}
	
	public function validate_file_value( $value = '' ){
		$value = trim( $value );
		$value = $this->validate_url_value( $value );
		$extension = LB_Functions::get_file_extension( $value );
		$mime_types = (array) $this->field->arg( 'options' , 'mime_types' );

		if( ! LB_Functions::is_empty( $mime_types ) ){
			if( ! $extension || ! in_array( $extension, $mime_types ) ){
				return '';
			}
		}
		return $value;
	}
	
	public function image_selector(){
		if( $this->field->is_checkbox_image_selector() ){
			$value = $this->validate_multiple_values( $this->value, array_keys( $this->field->arg( 'items' ) ), true );
		} else {
			$value = $this->validate_single_value( $this->value, array_keys( $this->field->arg( 'items' ) ), true );
		}
		return $this->sanitize_value( $value );
	}

	public function number(){
		$attributes = $this->field->arg( 'attributes' );
		$options = $this->field->arg( 'options' );
		$value = trim( $this->value );
		$valid_number = true;
		if( in_array( $value, array('auto', 'initial', 'inherit', 'normal' ) ) ){
			return $this->sanitize_value( $value );
		}
		$value = preg_replace("/[^0-9.\-]/", "", $value);
		if( $options['disable_spinner'] ){
			return $this->sanitize_value( $value );
		}
		else if( is_numeric( $value ) ){
			if( is_numeric( $attributes['min'] ) && $value < $attributes['min'] ){
				$valid_number = false;
			}
			if( is_numeric( $attributes['max'] ) && $value > $attributes['max'] ){
				$valid_number = false;
			}
			if( $valid_number ){
				return $this->sanitize_value( $value );
			}
		}
		return $this->sanitize_value( $this->default_value );
	}
	
	public function radio(){
		$value = $this->validate_single_value( $this->value, array_keys( $this->field->arg( 'items' ) ), true );
		return $this->sanitize_value( $value );
	}
	
	public function select(){
		if( $this->field->arg( 'options', 'multiple' ) ){
			$value = $this->value;
			if( ! is_array( $value ) ){
				$value = (array) $this->value;
			}
			$value = isset( $value[0] ) ? $value[0] : '';
			$value = explode( ',', stripslashes( $value ) );
            if( LB_Functions::is_empty( $value ) ){
                $value = (array) $this->default_value;
            }
		} else {
            $value = stripslashes( $this->value );
		}

		$sanitized_value = $this->sanitize_value( $value );

		return $sanitized_value;
	}

	public function oembed(){
		$value = $this->validate_url_value( $this->value );
		if( empty( $value ) ){
			$value = $this->validate_url_value( $this->default_value );
		}
		return $this->sanitize_value( $value );
	}

	public function switcher(){
		$options =  $this->field->arg( 'options' );
		$value = $this->validate_single_value( $this->value, array( $options['on_value'], $options['off_value'] ), true );
		return $this->sanitize_value( $value );
	}

	public function validate_single_value( $value = '', $valid_values = null, $set_default = true ){
        $value = trim( $value );
        if( $valid_values === null ){
            $valid_values = $this->field->arg( 'items' );
        }
        if( in_array( $value, $valid_values ) ){
            return $value;
        }
        if( $set_default ){
            return $this->default_value;
        }
        return '';
	}
	
	public function validate_multiple_values( $value = array(), $valid_values = null, $set_default = true ){
		$value = LB_Functions::array_filter( $value );

		if( LB_Functions::is_empty( $value ) && $set_default ){
			$value = (array) $this->default_value;
		}
		return $value;
	}
	
	public function validate_url_value( $value = '' ){
		$value = trim( $value );
		$protocols = array_filter( (array) $this->field->arg( 'options', 'protocols' ) );
		if( empty( $protocols ) ){
			$protocols = null;
		}
		return esc_url_raw( $value, $protocols );
	}

}