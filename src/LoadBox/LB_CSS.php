<?php

namespace HNMG\LoadBox;

class LB_CSS {
    public $props = array();
    public $selector = null;

    public function __construct( $selector = null ){
        $this->selector = $selector;
    }

    public function merge_props( $arr ){
        $this->props = array_merge( $this->props, $arr );
    }
	
    public function prop( $name, $value = null ){
        if( ! is_null( $value ) ) {
            $this->props[$name] = $value;
            return true;
        }
        return isset( $this->props[$name] ) ? $this->props[$name] : null;
    }

    public function remove_prop( $name ){
        if( isset( $this->props[$name] ) ){
            unset( $this->props[$name] );
            return true;
        }
        return false;
    }

    public function remove_props( $props = array() ){
        foreach( $props as $prop ){
            $this->remove_prop( $prop );
        }
        return $this->props;
    }

    public function build_css( $css = array() ){
        $style = $this->get_inline_style( $css );
        if( $this->selector && ! empty( $style ) ){
            return $this->selector . '{ ' . $style . '}';
        }
        return $style;
    }

    public function get_inline_style( $css = array() ){
        $style = '';
        if( empty( $css ) || ! is_array( $css ) ){
            $css = $this->props;
        }
        foreach( $css as $prop => $value ){
            $style .= "{$prop}:{$value}; ";
        }
        return $style;
    }

    public function get_props(){
        return $this->props;
    }


    public static function number( $value, $unit = '' ){
        if( in_array( $value, array( 'auto', 'initial', 'inherit', 'normal' ) ) ){
            return $value;
        }
        if( ! is_numeric( $value ) ){
            return '0px';
        }
        $value = preg_replace( "/[^0-9.\-]/", "", $value );
        if( is_numeric( $value ) ){
            return $value . $unit;
        }
        return '0px';
    }

}

