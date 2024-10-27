HNMGBOX.events = (function (window, document, $) {
  'use strict';
  var hnmgbox_events = {};
  var hnmgbox;

  hnmgbox_events.init = function () {
    var $hnmgbox = $('.hnmgbox');

    hnmgbox_events.on_change_colorpicker($hnmgbox);

    hnmgbox_events.on_change_code_editor($hnmgbox);

    hnmgbox_events.on_change_file($hnmgbox);

    hnmgbox_events.on_change_image_selector($hnmgbox);

    hnmgbox_events.on_change_icon_selector($hnmgbox);

    hnmgbox_events.on_change_number($hnmgbox);

    hnmgbox_events.on_change_oembed($hnmgbox);

    hnmgbox_events.on_change_radio($hnmgbox);

    hnmgbox_events.on_change_checkbox($hnmgbox);

    hnmgbox_events.on_change_switcher($hnmgbox);

    hnmgbox_events.on_change_select($hnmgbox);

    hnmgbox_events.on_change_text($hnmgbox);

    hnmgbox_events.on_change_date($hnmgbox);

    hnmgbox_events.on_change_time($hnmgbox);

    hnmgbox_events.on_change_textarea($hnmgbox);

    hnmgbox_events.on_change_wp_editor($hnmgbox);

  };

  hnmgbox_events.on_change_colorpicker = function ($hnmgbox) {
    $hnmgbox.on('change', '.hnmgbox-type-colorpicker .hnmgbox-element', function () {
      var $input = $(this);
      var value = $input.val();
      hnmgbox.update_prev_values($(this), value);

      $(this).trigger('hnmgbox_changed_value', value);
      hnmgbox_events.show_hide_row($(this), value, 'colorpicker');
    });
  };

  hnmgbox_events.on_change_code_editor = function ($hnmgbox) {
    $hnmgbox.find('.hnmgbox-code-editor').each(function (index, el) {
      var editor = ace.edit($(el).attr('id'));
      editor.getSession().on('change', function (e) {
        $(el).trigger('hnmgbox_changed_value', editor.getValue());
        hnmgbox_events.show_hide_row($(el), editor.getValue(), 'code_editor');
      });
    });
  };

  hnmgbox_events.on_change_file = function ($hnmgbox) {
    $hnmgbox.on('change', '.hnmgbox-type-file .hnmgbox-element', function () {
      var $field = $(this).closest('.hnmgbox-field');
      var multiple = $field.hasClass('hnmgbox-has-multiple');
      var value = '';
      value = $(this).val();
      if( ! multiple ){
        value = $(this).val();
      } else {
        $field.find('.hnmgbox-element').each(function(index, input){
          value += $(input).val() + ',';
        });
        value = value.replace(/,\s*$/, "");
        $(this).trigger('hnmgbox_changed_value', value);
      }

      $(this).trigger('hnmgbox_changed_value', value);
      hnmgbox_events.show_hide_row($(this), value, 'file');

      if (hnmgbox.is_image_file(value) && !multiple) {
        var $wrap_preview = $(this).closest('.hnmgbox-field').find('.hnmgbox-wrap-preview').first();
        var preview_size = $wrap_preview.data('preview-size');
        var item_body;
        var obj = {
          url: value,
        };
        var $new_item = $('<li />', { 'class': 'hnmgbox-preview-item hnmgbox-preview-file' });
        $new_item.addClass('hnmgbox-preview-image');
        item_body = '<img src="' + obj.url + '" style="width: ' + preview_size.width + '; height: ' + preview_size.height + '" data-full-img="' + obj.url + '" class="hnmgbox-image hnmgbox-preview-handler">';
        $new_item.html(item_body + '<a class="hnmgbox-btn hnmgbox-btn-iconize hnmgbox-btn-small hnmgbox-btn-red hnmgbox-remove-preview"><i class="hnmgbox-icon hnmgbox-icon-times-circle"></i></a>');
        $wrap_preview.html($new_item);
      }
    });
    $hnmgbox.on('hnmgbox_after_add_files', '.hnmgbox-type-file .hnmgbox-field', function (e, selected_files, media) {
      var value;
      if (!media.multiple) {
        $(selected_files).each(function (index, obj) {
          value = obj.url;
        });
      } else {
        value = [];
        $(selected_files).each(function (index, obj) {
          value.push(obj.url);
        });
      }
      $(this).find('.hnmgbox-element').trigger('hnmgbox_changed_value', [value]);
      hnmgbox_events.show_hide_row($(this), [value], 'file');
    });
  };

  hnmgbox_events.on_change_image_selector = function ($hnmgbox) {
    $hnmgbox.on('imgSelectorChanged', '.hnmgbox-type-image_selector .hnmgbox-element', function () {
      if ($(this).closest('.hnmgbox-image-selector').data('image-selector').like_checkbox) {
        var value = [];
        $(this).closest('.hnmgbox-radiochecks').find('input[type=checkbox]:checked').each(function (index, el) {
          value.push($(this).val());
        });
        $(this).trigger('hnmgbox_changed_value', [value]);
        hnmgbox_events.show_hide_row($(this), [value], 'image_selector');
      } else {
        $(this).trigger('hnmgbox_changed_value', $(this).val());
        hnmgbox_events.show_hide_row($(this), $(this).val(), 'image_selector');
      }
    });
  };

  hnmgbox_events.on_change_icon_selector = function ($hnmgbox) {
    $hnmgbox.on('change', '.hnmgbox-type-icon_selector .hnmgbox-element', function () {
      $(this).trigger('hnmgbox_changed_value', $(this).val());
      hnmgbox_events.show_hide_row($(this), $(this).val(), 'icon_selector');
    });
  };

  hnmgbox_events.on_change_number = function ($hnmgbox) {
    $hnmgbox.on('change', '.hnmgbox-type-number .hnmgbox-unit-number', function () {
      $(this).closest('.hnmgbox-field').find('.hnmgbox-element').trigger('input');
    });
    $hnmgbox.on('input', '.hnmgbox-type-number .hnmgbox-element', function () {
      $(this).trigger('hnmgbox_changed_value', $(this).val());
      hnmgbox_events.show_hide_row($(this), $(this).val(), 'number');
    });
    $hnmgbox.on('change', '.hnmgbox-type-number .hnmgbox-element', function () {
      var value = $(this).val();
      var validValue = value;
      var arr = ['auto', 'initial', 'inherit'];
      if ($.inArray(value, arr) < 0) {
        validValue = value.toString().replace(/[^0-9.\-]/g, '');
      }
      //Validate values
      if( value != validValue ){
        value = validValue;
        var $field = $(this).closest('.hnmgbox-field');
        hnmgbox.set_field_value($field, value, $field.find('input.hnmgbox-unit-number').val());
      }
      $(this).trigger('hnmgbox_changed_value', value);
      hnmgbox_events.show_hide_row($(this), value, 'number');
    });
  };

  hnmgbox_events.on_change_oembed = function ($hnmgbox) {
    $hnmgbox.on('change', '.hnmgbox-type-oembed .hnmgbox-element', function () {
      $(this).trigger('hnmgbox_changed_value', $(this).val());
      hnmgbox_events.show_hide_row($(this), $(this).val(), 'oembed');
    });
  };

  hnmgbox_events.on_change_radio = function ($hnmgbox) {
    $hnmgbox.on('ifChecked', '.hnmgbox-type-radio .hnmgbox-element', function () {
      $(this).trigger('hnmgbox_changed_value', $(this).val());
      hnmgbox_events.show_hide_row($(this), $(this).val(), 'radio');
    });
  };

  hnmgbox_events.on_change_checkbox = function ($hnmgbox) {
    $hnmgbox.on('ifChanged', '.hnmgbox-type-checkbox .hnmgbox-element', function () {
      var value = [];
      $(this).closest('.hnmgbox-radiochecks').find('input[type=checkbox]:checked').each(function (index, el) {
        value.push($(this).val());
      });
      $(this).trigger('hnmgbox_changed_value', [value]);
      hnmgbox_events.show_hide_row($(this), [value], 'checkbox');
    });
  };

  hnmgbox_events.on_change_switcher = function ($hnmgbox) {
    $hnmgbox.on('statusChange', '.hnmgbox-type-switcher .hnmgbox-element', function () {
      $(this).trigger('hnmgbox_changed_value', $(this).val());
      hnmgbox_events.show_hide_row($(this), $(this).val(), 'switcher');
    });
  };

  hnmgbox_events.on_change_select = function ($hnmgbox) {
    $hnmgbox.on('change', '.hnmgbox-type-select .hnmgbox-element', function (event) {
      var $input = $(this).find('input[type="hidden"]');
      var value = $input.val();
      hnmgbox.update_prev_values($input, value);
      $(this).trigger('hnmgbox_changed_value', value);
      hnmgbox_events.show_hide_row($(this), value, 'select');
    });
  };

  hnmgbox_events.on_change_text = function ($hnmgbox) {
    $hnmgbox.on('input', '.hnmgbox-type-text .hnmgbox-element', function () {
      var $input = $(this);
      var value = $input.val();
      hnmgbox.update_prev_values($input, value);
      $input.trigger('hnmgbox_changed_value', value);
      hnmgbox_events.show_hide_row($input, value, 'text');

      var $helper = $input.next('.hnmgbox-field-helper');
      if ($helper.length && $input.closest('.hnmgbox-helper-maxlength').length && $input.attr('maxlength')) {
        $helper.text($input.val().length + '/' + $input.attr('maxlength'));
      }
    });
  };

  hnmgbox_events.on_change_date = function ($hnmgbox) {
    $hnmgbox.on('change', '.hnmgbox-type-date .hnmgbox-element', function () {
      var $input = $(this);
      var value = $input.val();
      hnmgbox.update_prev_values($input, value);
      $input.trigger('hnmgbox_changed_value', value);
      hnmgbox_events.show_hide_row($input, value, 'date');
    });
  };

  hnmgbox_events.on_change_time = function ($hnmgbox) {
    $hnmgbox.on('change', '.hnmgbox-type-time .hnmgbox-element', function () {
      var $input = $(this);
      var value = $input.val();
      hnmgbox.update_prev_values($input, value);
      $input.trigger('hnmgbox_changed_value', value);
      hnmgbox_events.show_hide_row($input, value, 'time');
    });
  };

  hnmgbox_events.on_change_textarea = function ($hnmgbox) {
    $hnmgbox.on('input', '.hnmgbox-type-textarea .hnmgbox-element', function () {
      $(this).text($(this).val());
      $(this).trigger('hnmgbox_changed_value', $(this).val());
      hnmgbox_events.show_hide_row($(this), $(this).val(), 'textarea');
    });
  };

  hnmgbox_events.on_change_wp_editor = function ($hnmgbox) {
    var $wp_editors = $hnmgbox.find('.hnmgbox-type-wp_editor textarea.wp-editor-area');
    $hnmgbox.on('input', '.hnmgbox-type-wp_editor textarea.wp-editor-area', function () {
      $(this).trigger('hnmgbox_changed_value', $(this).val());
      hnmgbox_events.show_hide_row($(this), $(this).val(), 'wp_editor');
    });
    if (typeof tinymce === 'undefined') {
      return;
    }
    setTimeout(function () {
      $wp_editors.each(function (index, el) {
        var ed_id = $(el).attr('id');
        var wp_editor = tinymce.get(ed_id);
        if (wp_editor) {
          wp_editor.on('change input', function (e) {
            var value = wp_editor.getContent();
            $(el).trigger('hnmgbox_changed_value', wp_editor.getContent());
            hnmgbox_events.show_hide_row($(el), wp_editor.getContent(), 'wp_editor');
          });
        }
      });
    }, 1000);
  };

  hnmgbox_events.show_hide_row = function ($el, field_value, type) {
    var prefix = $el.closest('.hnmgbox').data('prefix');
    var $row_changed = $el.closest('.hnmgbox-row');
    var value = '';
    var operator = '==';
    var $rows = $row_changed.siblings('.hnmgbox-row');
    var $group_item = $row_changed.closest('.hnmgbox-group-item');
    if ($group_item.length) {
      $rows = $group_item.find('.hnmgbox-row');
    } else {
      $rows.each(function (index, el) {
        if ($(el).data('field-type') == 'mixed') {
          $(el).find('.hnmgbox-row').each(function (i, mixed_row) {
            $rows.push($(mixed_row)[0]);
          });
        }
      });
    }

    $rows.each(function (index, el) {
      var $row = $(el);
      var data_show_hide = $row.data('show-hide');
      var show_if = data_show_hide.show_if;
      var hide_if = data_show_hide.hide_if;
      var show = true;
      var hide = false;
      var check_show = true;
      var check_hide = true;

      if (is_empty(show_if) || is_empty(show_if[0])) {
        check_show = false;
      }
      if (is_empty(hide_if) || is_empty(hide_if[0])) {
        check_hide = false;
      }

      //Si el campo donde se originó el cambio no afecta al campo actual, no hacer nada
      if ($row.is($row_changed) || $row_changed.data('field-id') != prefix + show_if[0]) {
        return true;
      }


      if (check_show) {
        if ($.isArray(show_if[0])) {

        } else {
          if (show_if.length == 2) {
            value = show_if[1];
          } else if (show_if.length == 3) {
            value = show_if[2];
            operator = !is_empty(show_if[1]) ? show_if[1] : operator;
            operator = operator == '=' ? '==' : operator;
          }
          if ($.inArray(operator, ['==', '!=', '>', '>=', '<', '<=']) > -1) {
            show = hnmgbox.compare_values_by_operator(field_value, operator, value);
          } else if ($.inArray(operator, ['in', 'not in']) > -1) {
            if (!is_empty(value) && $.isArray(value)) {
              show = operator == 'in' ? $.inArray(field_value, value) > -1 : $.inArray(field_value, value) == -1;
            }
          }
        }

      }

      if (check_hide) {
        if ($.isArray(hide_if[0])) {

        } else {
          if (hide_if.length == 2) {
            value = hide_if[1];
          } else if (hide_if.length == 3) {
            value = hide_if[2];
            operator = !is_empty(hide_if[1]) ? hide_if[1] : operator;
            operator = operator == '=' ? '==' : operator;
          }
          if ($.inArray(operator, ['==', '!=', '>', '>=', '<', '<=']) > -1) {
            hide = hnmgbox.compare_values_by_operator(field_value, operator, value);
          } else if ($.inArray(operator, ['in', 'not in']) > -1) {
            if (!is_empty(value) && $.isArray(value)) {
              hide = operator == 'in' ? $.inArray(field_value, value) > -1 : $.inArray(field_value, value) == -1;
            }
          }
        }
      }

      if (check_show) {
        if (check_hide) {
          if (show) {
            if (hide) {
              hnmgbox_events.hide_row($row);
            } else {
              hnmgbox_events.show_row($row);
            }
          } else {
            hnmgbox_events.hide_row($row);
          }
        } else {
          if (show) {
            hnmgbox_events.show_row($row);
          } else {
            hnmgbox_events.hide_row($row);
          }
        }
      }

      if (check_hide) {
        if (hide) {
          hnmgbox_events.hide_row($row);
        } else if (check_show) {
          if (show) {
            hnmgbox_events.show_row($row);
          } else {
            hnmgbox_events.hide_row($row);
          }
        } else {
          hnmgbox_events.show_row($row);
        }
        // if( check_show ){
        // 	if( hide ){
        // 		hnmgbox_events.hide_row($row);
        // 	} else {
        // 		if( show ){
        // 			hnmgbox_events.show_row($row);
        // 		} else {
        // 			hnmgbox_events.hide_row($row);
        // 		}
        // 	}
        // } else {
        // 	if( hide ){
        // 		hnmgbox_events.hide_row($row);
        // 	} else {
        // 		hnmgbox_events.show_row($row);
        // 	}
        // }
      }
    });
  };

  hnmgbox_events.show_row = function ($row) {
    var data_show_hide = $row.data('show-hide');
    var delay = parseInt(data_show_hide.delay);
    if (data_show_hide.effect == 'slide') {
      $row.slideDown(delay, function () {
        if ($row.hasClass('hnmgbox-row-mixed')) {
          $row.css('display', 'inline-block');
        }
      });
    } else if (data_show_hide.effect == 'fade') {
      $row.fadeIn(delay, function () {
        if ($row.hasClass('hnmgbox-row-mixed')) {
          $row.css('display', 'inline-block');
        }
      });
    } else {
      $row.show();
      if ($row.hasClass('hnmgbox-row-mixed')) {
        $row.css('display', 'inline-block');
      }
    }
  };
  hnmgbox_events.hide_row = function ($row) {
    var data_show_hide = $row.data('show-hide');
    var delay = parseInt(data_show_hide.delay);
    if (data_show_hide.effect == 'slide') {
      $row.slideUp(delay, function () {
      });
    } else if (data_show_hide.effect == 'fade') {
      $row.fadeOut(delay, function () {
      });
    } else {
      $row.hide();
    }
  };

  function is_empty(value) {
    return (value === undefined || value === false || $.trim(value).length === 0);
  }

  //Debug
  function c(msg) {
    console.log(msg);
  }

  function cc(msg, msg2) {
    console.log(msg, msg2);
  }

  //Document Ready
  $(function () {
    hnmgbox = window.HNMGBOX;
    hnmgbox_events.init();
  });

  return hnmgbox_events;

})(window, document, jQuery);


//Events when you change some value of any field.
/*jQuery(document).ready(function($) {
	$('.hnmgbox-type-colorpicker .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'colorpicker changed:' );
		console.log( value );
	});

	$('.hnmgbox-code-editor').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'code_editor changed:' );
		console.log( value );
	});

	$('.hnmgbox-type-file .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'file changed:' );
		console.log( value );
	});

	$('.hnmgbox-type-image_selector .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'image_selector changed:' );
		console.log( value );
	});

	$('.hnmgbox-type-number .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'number changed:' );
		console.log( value );
	});

	$('.hnmgbox-type-oembed .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'oembed changed:' );
		console.log( value );
	});

	$('.hnmgbox-type-radio .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'radio changed:' );
		console.log( value );
	});

	$('.hnmgbox-type-checkbox .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'checkbox changed:' );
		console.log( value );
	});

	$('.hnmgbox-type-switcher .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'switcher:' );
		console.log( value );
	});

	$('.hnmgbox-type-select .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'select:' );
		console.log( value );
	});

	$('.hnmgbox-type-text .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'Texto:' );
		console.log( value );
	});

	$('.hnmgbox-type-textarea .hnmgbox-element').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'textarea:' );
		console.log( value );
	});

	$('.hnmgbox-type-wp_editor .wp-editor-area').on('hnmgbox_changed_value', function( event, value ){
		console.log( 'wp_editor:' );
		console.log( value );
	});

	$hnmgbox.on('hnmgbox_on_init_wp_editor', function (e, wp_editor, args) {
    //After Init
    console.log('hnmgbox_on_init_wp_editor', wp_editor);
    wp_editor.on('click', function (e) {
      console.log('Editor was clicked');
    });
    //Enable "Right to Left" button
    if (wp_editor.controlManager.buttons.rtl) {//Check if "Right to Left" exists
      wp_editor.controlManager.buttons.rtl.$el.trigger('click');
    }
  });

  $hnmgbox.on('hnmgbox_on_setup_wp_editor', function (e, wp_editor) {
    //Before Init
    console.log('hnmgbox_on_setup_wp_editor', wp_editor);

    //Add your buttons
    wp_editor.settings.toolbar3 = 'fontselect | media, image';
  });

});*/


