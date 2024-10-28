<?php
$hnmgbox->add_import_field(array(
  'name' => 'Select Demo',
  'default' => 'demo-key-2',
  'desc' => 'Choose a demo, then click import button',
  'items' => array(
    'demo-key-1' => HNMGBOX_URL.'example/img/demo1.png',
    'demo-key-2' => HNMGBOX_URL.'example/img/demo2.png',
    'demo-key-3' => HNMGBOX_URL.'example/img/demo3.png'
  ),
  'items_desc' => array(
    'demo-key-1' => array(
      'title'             => 'Demo 2',
      'content'           => 'Local files',
      'import_hnmgbox'       => HNMGBOX_DIR.'hnmgbox-backup-test.json',
      'import_wp_content' => HNMGBOX_DIR .'wp-content-data.xml',
      //Import widget- Not implemented yet, but you can add your own function to import widgets
      'import_wp_widget'  => HNMGBOX_DIR .'wp-widget-data.txt',
      'import_wp_widget_callback'=> 'your_function_to_import_widgets'
    ),
    'demo-key-2' => array(
      'title'             => 'Demo 2',
      'content'           => 'Remote files',
      'import_hnmgbox'       => 'http://hnmgboxframework.com/demos/demo2/hnmgbox-data.json',
      'import_wp_content' => 'http://hnmgboxframework.com/demos/demo2/wp-content-data.xml',
      //Import widget- Not implemented yet, but you can add your own function to import widgets
      'import_wp_widget'  => HNMGBOX_DIR .'wp-widget-data2.txt',//Not implemented yet
      'import_wp_widget_callback'=> 'your_function_to_import_widgets'
    ),
    'demo-key-3' => array(
      'title'             => 'Demo 3',
      'content'           => 'Info demo 3',
      'import_hnmgbox'       => 'http://hnmgboxframework.com/demos/demo3/hnmgbox-data.json',
      'import_wp_content' => 'http://hnmgboxframework.com/demos/demo3/wp-content-data.xml',
      //Import widget- Not implemented yet, but you can add your own function to import widgets
      'import_wp_widget'  => HNMGBOX_DIR .'wp-widget-data3.txt',//Not implemented yet
      'import_wp_widget_callback'=> 'your_function_to_import_widgets'
    ),
  ),
  'options' => array(
    'import_from_file' => false,
    'import_from_url' => false,
    'width' => '200px',
  ),
));
