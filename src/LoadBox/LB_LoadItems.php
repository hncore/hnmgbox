<?php

namespace HNMG\LoadBox;

use HNMG\LoadBox\LB_Functions;
use HNMG\LoadBox\LB_GoogleFonts;

class LB_LoadItems {
	private static $instance = null;
	public static $google_fonts = array();

	public static function terms( $taxonomy = '', $args = array(), $more_items = array() ){
        $args = wp_parse_args( $args, array(
            'hide_empty' => false,
        ) );
        $terms = get_terms( $taxonomy, $args );
        if( is_wp_error( $terms ) ){
            return array();
        }
        $items = array();
        foreach( $terms as $term ){
            $items[$term->slug] = $term->name;
        }
        return array_merge( $more_items, $items );
    }

	public static function post_types( $args = array(), $operator = 'and', $more_items = array() ){
        $post_types = get_post_types( $args, 'objects', $operator );
        $items = array();
        foreach( $post_types as $post_type ){
            $items[$post_type->name] = $post_type->label;
        }
        return array_merge( $more_items, $items );
    }
	
	public static function posts_by_post_type( $post_type = 'post', $args = array(), $more_items = array() ){
        $args = wp_parse_args( $args, array(
            'post_type' => $post_type,
            'posts_per_page' => 5,
        ) );
        $posts = get_posts( $args );
        $items = array();
        foreach( $posts as $post ){
            $items[$post->ID] = $post->post_title;
        }
        return LB_Functions::nice_array_merge( $more_items, $items );
    }

	public static function google_fonts( $more_items = array() ){
        if( ! empty( self::$google_fonts ) ){
            return LB_Functions::nice_array_merge( $more_items, self::$google_fonts );
        }
        $items = array();
        $gf = new LB_GoogleFonts();
        $google_fonts = $gf->get_fonts();
        foreach( $google_fonts as $font ){
            $items[$font->family] = $font->family;
        }
        self::$google_fonts = $items;
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function web_safe_fonts( $more_items = array() ){
        $web_safe_fonts = include HNMGBOX_DIR . 'data/web-safe-fonts.php';
        $items = array();
        foreach( $web_safe_fonts as $font ){
            $items[$font] = $font;
        }
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function border_style( $more_items = array() ){
        $items = array(
            'solid' => 'Solid',
            'none' => 'None',
            'dotted' => 'Dotted',
            'dashed' => 'Dashed',
            'double' => 'Double',
            'groove' => 'Groove',
            //'ridge'  => 'Ridge',
            //'inset'  => 'Inset',
            //'outset' => 'Outset',
            //'hidden' => 'Hidden',
        );
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function opacity( $more_items = array() ){
        $items = array(
            '1' => '1',
            '0.9' => '0.9',
            '0.8' => '0.8',
            '0.7' => '0.7',
            '0.6' => '0.6',
            '0.5' => '0.5',
            '0.4' => '0.4',
            '0.3' => '0.3',
            '0.2' => '0.2',
            '0.1' => '0.1',
            '0' => '0',
        );
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function text_align( $more_items = array() ){
        $items = array(
            'left' => 'Left',
            'right' => 'Right',
            'center' => 'Center',
            'justify' => 'Justify',
            //'initial' => 'Initial',
            //'inherit' => 'Inherit',
        );
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function font_style( $more_items = array() ){
        $items = array(
            'normal' => 'Normal',
            'italic' => 'Italic',
            'oblique' => 'Oblique',
            //'initial' => 'Initial',
            //'inherit' => 'Inherit',
        );
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function font_weight( $more_items = array() ){
        $items = array(
            '300' => 'Light 300',
            '400' => 'Regular 400',
            '500' => 'Medium 500',
            '600' => 'Semi bold 600',
            '700' => 'Bold 700',
            '800' => 'Extra bold 800',
            '900' => 'Black 900',
        );
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function text_transform( $more_items = array() ){
        $items = array(
            'none' => 'None',
            'uppercase' => 'Uppercase',
            'lowercase' => 'Lowercase',
            'capitalize' => 'Capitalize',
        );
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function countries_icons( $more_items = array() ){
        $countries = include HNMGBOX_DIR . 'data/countries-icons.php';
        $items = array();
        foreach( $countries as $country ){
            $value = $country['value'];
            $option = $country['option'];
            if( isset( $country['icon'] ) ){
                $icon = $country['icon'];
                $option = "<i class='{$icon}'></i>" . $option;
            }
            $items[$value] = $option;
        }
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function icons( $more_items = array() ){
        if( LB_Functions::is_fontawesome_version( '5.x' ) ){
            $icons = include HNMGBOX_DIR . 'data/icons-font-awesome-5.6.3.php';
        } else{
            $icons = include HNMGBOX_DIR . 'data/icons-font-awesome.php';
        }
        $items = array();
        foreach( $icons as $icon ){
            $items[$icon] = "<i class='$icon'></i>$icon";
        }
        return LB_Functions::nice_array_merge( $more_items, $items );
    }
	
	public static function icon_fonts( $more_items = array() ){
        if( LB_Functions::is_fontawesome_version( '5.x' ) ){
            $icons = include HNMGBOX_DIR . 'data/icons-font-awesome-5.6.3.php';
        } else{
            $icons = include HNMGBOX_DIR . 'data/icons-font-awesome.php';
        }
        $items = array();
        foreach( $icons as $icon ){
            $items[$icon] = "<i class='$icon'></i>";
        }
        return LB_Functions::nice_array_merge( $more_items, $items );
    }

    public static function countries( $more_items = array() ){
        $countries = include HNMGBOX_DIR . 'data/countries.php';
        return LB_Functions::nice_array_merge( $more_items, $countries );
    }

    public static function eu_countries( $more_items = array() ){
        $eu_countries = include HNMGBOX_DIR . 'data/eu-countries.php';
        return LB_Functions::nice_array_merge( $more_items, $eu_countries );
    }
	
}