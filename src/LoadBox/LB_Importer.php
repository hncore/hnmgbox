<?php

namespace HNMG\LoadBox;

use HNMG\LoadBox\LB_Functions;

class LB_Importer {
	private $hnmgbox = null;
    private $data = array();
    private $update_uploads_url = false;
    private $update_plugins_url = true;
    private $username = null;
    private $password = null;
	
	public function __construct( $hnmgbox, $data = array(), $settings ){
        $this->hnmgbox = $hnmgbox;
        $this->data = $data;
        $this->update_uploads_url = $settings['update_uploads_url'];
        $this->update_plugins_url = $settings['update_plugins_url'];
        if( $settings['show_authentication_fields'] ){
            $this->username = ! empty( $data['hnmgbox-import-username'] ) ? $data['hnmgbox-import-username'] : null;
            $this->password = ! empty( $data['hnmgbox-import-password'] ) ? $data['hnmgbox-import-password'] : null;
        }
    }
	
	public function get_import_hnmgbox_data(){
        $import_hnmgbox_data = false;
        $json_hnmgbox_data = false;
        $data = $this->data;
        $prefix = $this->hnmgbox->arg( 'fields_prefix' );
        $import_from = $data[$prefix . 'hnmgbox-import-field'];
        switch( $import_from ){
            case 'from_file':
                if( isset( $_FILES["hnmgbox-import-file"] ) ){
                    $file_name = $_FILES['hnmgbox-import-file']['name'];
                    if( LB_Functions::ends_with( '.json', $file_name ) ){
                        $json_hnmgbox_data = file_get_contents( $_FILES['hnmgbox-import-file']['tmp_name'] );
                    }
                }
            break;
            case 'from_url':
                if( LB_Functions::ends_with( '.json', $data['hnmgbox-import-url'] ) ){
                    $json_hnmgbox_data = $this->get_json_from_url( $data['hnmgbox-import-url'] );
                }
            break;
            default:
                $import_source = $import_from;
                $import_wp_content = '';
                $import_wp_widget = '';
                $widget_cb = '';
                if( isset( $data['hnmgbox-import-data'] ) ){
                    $sources = isset( $data['hnmgbox-import-data'][$import_source] ) ? $data['hnmgbox-import-data'][$import_source] : array();
                    $import_hnmgbox = isset( $sources['import_hnmgbox'] ) ? $sources['import_hnmgbox'] : '';
                    $import_wp_content = isset( $sources['import_wp_content'] ) ? $sources['import_wp_content'] : '';
                    $import_wp_widget = isset( $sources['import_wp_widget'] ) ? $sources['import_wp_widget'] : '';
                    $widget_cb = isset( $sources['import_wp_widget_callback'] ) ? $sources['import_wp_widget_callback'] : '';
                } else {
                    $import_hnmgbox = $import_source;
                }
                if( LB_Functions::ends_with( '.json', $import_hnmgbox ) ){
                    $json_hnmgbox_data = $this->get_json_from_url( $import_hnmgbox );
                }

                if( file_exists( $import_wp_content ) ){
                    echo '<h2>Importing wordpress data from local file, please wait ...</h2>';
                    $this->set_wp_content_data( $import_wp_content );
                } else if( LB_Functions::remote_file_exists( $import_wp_content ) ){
                    $file_content = file_get_contents( $import_wp_content );
                    if( $file_content !== false ){
                        if( false !== file_put_contents( HNMGBOX_DIR . 'wp-content-data.xml', $file_content ) ){
                            echo '<h2>Importing wordpress data from remote file, please wait ...</h2>';
                            $this->set_wp_content_data( HNMGBOX_DIR . 'wp-content-data.xml' );
                            unlink( HNMGBOX_DIR . 'wp-content-data.xml' );
                        }
                    }
                }
                if( file_exists( $import_wp_widget ) || LB_Functions::remote_file_exists( $import_wp_widget ) ){
                    if( is_callable( $widget_cb ) ){
                        call_user_func( $widget_cb, $import_wp_widget );
                    }
                }
                break;
        }

        if( $json_hnmgbox_data !== false ){
            $json_hnmgbox_data = $this->update_urls_from_data( $json_hnmgbox_data );
            $import_hnmgbox_data = json_decode( $json_hnmgbox_data, true );
        }

        if( is_array( $import_hnmgbox_data ) && ! empty( $import_hnmgbox_data ) ){
            return $import_hnmgbox_data;
        }

        return false;
    }

    public function set_wp_content_data( $file ){
        if( ! defined( 'WP_LOAD_IMPORTERS' ) ) define( 'WP_LOAD_IMPORTERS', true );

        $importer_error = false;
        if( ! class_exists( '\WP_Import' ) ){
            $class_wp_import = HNMGBOX_DIR . 'libs/wordpress-importer/wordpress-importer.php';
            if( file_exists( $class_wp_import ) ){
                require_once $class_wp_import;
            } else{
                $importer_error = true;
            }
        }

        if( $importer_error ){
            die( "Error on import" );
        } else{
            if( is_file( $file ) && class_exists( '\WP_Import' ) ){
                $wp_import = new \WP_Import();
                $wp_import->fetch_attachments = true;
                $wp_import->import( $file );
            } else{
                echo "The XML file containing the dummy content is not available or could not be read .. You might want to try to set the file permission to chmod 755.<br/>If this doesn't work please use the Wordpress importer and import the XML file (should be located in your download .zip: Sample Content folder) manually";
            }
        }
    }

    public function update_urls_from_data( $json_data ){
        $data = json_decode( $json_data, true );
        $json_data = str_replace( '\\/', '/', $json_data );
        if( $this->update_uploads_url && isset( $data['wp_upload_dir'] ) ){
            $json_data = str_replace( $data['wp_upload_dir'], wp_upload_dir(), $json_data );
        }
        if( $this->update_plugins_url && isset( $data['plugins_url'] ) ){
            $json_data = str_replace( $data['plugins_url'], plugins_url(), $json_data );
        }
        return $json_data;
    }

    private function get_json_from_url( $url ){
        $json = file_get_contents( $url );
        $json_decode = json_decode( $json );
        if( $json_decode === null ){
            $options = array();
            if( ! empty( $this->username ) && ! empty( $this->password ) ){
                $options = array(
                    'headers' => array(
                        'Authorization' => "Basic ". base64_encode("$this->username:$this->password")
                    ),
                );
            }
            $response = wp_remote_get( $url, $options );
            if( is_wp_error( $response ) ){
                $options['sslverify'] = false;
                $response = wp_remote_get( $url, $options );
            }
            if( is_wp_error( $response ) ){
                return false;
            } else{
                $json = wp_remote_retrieve_body( $response );
            }
        }
        return $json;
    }

}
