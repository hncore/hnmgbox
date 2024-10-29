<?php
use HNMG\LoadBox\LB_Metabox;
use HNMG\LoadBox\LB_AdminPage;
use HNMG\LoadBox\LB_LoadBox;

function hnmgbox_get_all(){
  return LB_LoadBox::get_all_hnmgboxs();
}


function hnmgbox_get( $hnmgbox_id ){
  return LB_LoadBox::get( $hnmgbox_id );
}


function hnmgbox_new_metabox( $options = array() ){
  return new LB_Metabox( $options );
}


function hnmgbox_new_admin_page( $options = array() ){
  return new LB_AdminPage( $options );
}


function hnmgbox_get_field_value( $hnmgbox_id, $field_id = '', $default = '', $post_id = '' ){
  return LB_LoadBox::get_field_value( $hnmgbox_id, $field_id, $default, $post_id );
}

function hnmg_value($field_id) {
	$value = LB_LoadBox::get_field_value(HNMG_OPTION, $field_id, $default = '', $post_id = '' );
	if ($value === 'on') {
		return true;
	} elseif ($value === 'off') {
		return false;
	}
	return $value;
}

add_shortcode( 'hnmgbox_get_field_value', 'hnmgbox_get_field_value_shortcode' );
function hnmgbox_get_field_value_shortcode( $atts ) {
    $a = shortcode_atts( array(
        'hnmgbox_id' => null,
        'field_id' => '',
        'default' => '',
        'post_id' => '',
    ), $atts );
    return hnmgbox_get_field_value( $a['hnmgbox_id'], $a['field_id'], $a['default'], $a['post_id'] );
}

