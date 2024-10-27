
window.HNMGBOX = (function (window, document, $) {
  'use strict';
  var hnmgbox = {
    duplicate: false,
    media: {
      frames: {}
    },
    delays: {
      removeItem: {
        fade: 200,
        confirm: 100,
        events: 400,//tiene que ser mayor a fade
      }
    }
  };

  hnmgbox.init = function () {
    hnmgbox.$hnmgbox = $('.hnmgbox');
    var $form = hnmgbox.$hnmgbox.closest('.hnmgbox-form');
    if (!$form.length) {
      $form = hnmgbox.$hnmgbox.closest('form#post');
    }

    //Disable form submit on enter
    $form.on('keyup keypress', 'input', function (e) {
      var keyCode = e.which;
      if (keyCode === 13) {
        e.preventDefault();
        return false;
      }
    });

    $(window).resize(function () {
      if (viewport().width <= 850) {
        $('#post-body').addClass('hnmgbox-columns-1');
      } else {
        $('#post-body').removeClass('hnmgbox-columns-1');
      }
    }).resize();


    hnmgbox.init_image_selector();
    hnmgbox.init_tab();
    hnmgbox.init_switcher();
    hnmgbox.init_spinner();
    hnmgbox.init_checkbox();
    hnmgbox.init_dropdown();
    hnmgbox.init_colorpicker();
    hnmgbox.init_code_editor();
    hnmgbox.init_sortable_preview_items();
    hnmgbox.init_sortable_checkbox();
    hnmgbox.init_sortable_repeatable_items();
    hnmgbox.init_sortable_group_items();
    hnmgbox.init_tooltip();

    hnmgbox.load_oembeds();
    setTimeout(function () {
      hnmgbox.load_icons_for_icon_selector();
    }, 200);

    hnmgbox.$hnmgbox.on('click', '#hnmgbox-reset', hnmgbox.on_click_reset_values);
    hnmgbox.$hnmgbox.on('click', '#hnmgbox-import', hnmgbox.on_click_import_values);
    hnmgbox.$hnmgbox.on('ifClicked', '.hnmgbox-type-import .hnmgbox-radiochecks input', hnmgbox.toggle_import);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-type-import .hnmgbox-radiochecks input, .hnmgbox-wrap-import-inputs .item-key-from_url input, .hnmgbox-wrap-import-inputs .item-key-from_file input', hnmgbox.toggle_import);

    hnmgbox.$hnmgbox.on('click', '.hnmgbox-add-group-item', hnmgbox.new_group_item);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-duplicate-group-item', hnmgbox.new_group_item);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-remove-group-item', hnmgbox.remove_group_item);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-group-control-item', hnmgbox.on_click_group_control_item);
    hnmgbox.$hnmgbox.on('sort_group_items', '.hnmgbox-group-wrap', hnmgbox.sort_group_items);
    hnmgbox.$hnmgbox.on('sort_group_control_items', '.hnmgbox-group-control', hnmgbox.sort_group_control_items);

    hnmgbox.$hnmgbox.on('click', '.hnmgbox-add-repeatable-item', hnmgbox.add_repeatable_item);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-remove-repeatable-item', hnmgbox.remove_repeatable_item);
    hnmgbox.$hnmgbox.on('sort_repeatable_items', '.hnmgbox-repeatable-wrap', hnmgbox.sort_repeatable_items);

    hnmgbox.$hnmgbox.on('click', '.hnmgbox-upload-file, .hnmgbox-preview-item .hnmgbox-preview-handler', hnmgbox.wp_media_upload);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-remove-preview', hnmgbox.remove_preview_item);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-get-oembed', hnmgbox.get_oembed);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-get-image', hnmgbox.get_image_from_url);
    hnmgbox.$hnmgbox.on('focusout', '.hnmgbox-type-colorpicker input', hnmgbox.on_focusout_input_colorpicker);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-type-colorpicker .hnmgbox-colorpicker-default-btn', hnmgbox.set_default_value_colorpicker);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-section.hnmgbox-toggle-1 .hnmgbox-section-header, .hnmgbox-section .hnmgbox-toggle-icon', hnmgbox.toggle_section);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-type-number .hnmgbox-unit-has-picker-1', hnmgbox.toggle_units_dropdown);
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-units-dropdown .hnmgbox-unit-item', hnmgbox.set_unit_number);
    hnmgbox.$hnmgbox.on('focus', '.hnmgbox-type-text input.hnmgbox-element', hnmgbox.on_focus_input_type_text);

    hnmgbox.refresh_active_main_tab();
    hnmgbox.$hnmgbox.on('click', '.hnmgbox-main-tab .hnmgbox-item-parent a', hnmgbox.on_cick_item_main_tab);

    $(document).on('click', hnmgbox.hide_units_dropdown);

    hnmgbox.$hnmgbox.on('focus', 'input.hnmgbox-element', function (event) {
      $(this).closest('.hnmgbox-field').removeClass('hnmgbox-error');
    });

    hnmgbox.sticky_submit_buttons();
    $(window).scroll(function () {
      hnmgbox.sticky_submit_buttons();
    });
  };

  hnmgbox.on_cick_item_main_tab = function(e){
    var activeItem = $(this).attr('href').replace(/#/, '');
    var prefix = hnmgbox.$hnmgbox.data('prefix');
    localStorage.setItem('hnmgbox-main-tab-item-active', activeItem.replace(prefix, '').replace('tab_item', 'tab-item'));
  };
  hnmgbox.refresh_active_main_tab = function(){
    var activeItem = localStorage.getItem('hnmgbox-main-tab-item-active');
    if( activeItem ){
      hnmgbox.$hnmgbox.find('.hnmgbox-main-tab .hnmgbox-item-parent.'+activeItem+' a').trigger('click');
    }
  };

  hnmgbox.sticky_submit_buttons = function () {
    var $header = $('.hnmgbox-header').first();
    var $actions = $header.find('.hnmgbox-header-actions').first();
    var $my_account = $('#wp-admin-bar-my-account');
    if (!$actions.length || !$my_account.length || !$actions.data('sticky')) {
      return;
    }
    if ($(window).scrollTop() > $header.offset().top) {
      $my_account.css('padding-right', $actions.width() + 25);
      $actions.addClass('hnmgbox-actions-sticky');
    } else {
      $my_account.css('padding-right', '');
      $actions.removeClass('hnmgbox-actions-sticky');
    }
  };

  hnmgbox.on_focus_input_type_text = function (event) {
    var $helper = $(this).next('.hnmgbox-field-helper');
    if ($helper.length) {
      $(this).css('padding-right', ($helper.outerWidth() + 6) + 'px');
    }
  };

  hnmgbox.hide_units_dropdown = function () {
    $('.hnmgbox-units-dropdown').slideUp(200);
  };
  hnmgbox.toggle_units_dropdown = function (event) {
    if ($(event.target).hasClass('hnmgbox-spinner-handler') || $(event.target).hasClass('hnmgbox-spinner-control')) {
      return;
    }
    event.stopPropagation();
    $(this).find('.hnmgbox-units-dropdown').slideToggle(200);
  };
  hnmgbox.set_unit_number = function (event) {
    var $btn = $(this);
    $btn.closest('.hnmgbox-unit').find('input.hnmgbox-unit-number').val($btn.data('value')).trigger('change');
    $btn.closest('.hnmgbox-unit').find('span').text($btn.text());
  };

  hnmgbox.load_icons_for_icon_selector = function (event) {
    var fields = [];
    $('.hnmgbox-type-icon_selector').each(function (index, el) {
      var field_id = $(el).data('field-id');
      var options = $(el).find('.hnmgbox-icons-wrap').data('options');
      if ($.inArray(field_id, fields) < 0 && options.load_with_ajax) {
        fields.push(field_id);
      }
    });

    $.each(fields, function (index, field_id) {
      hnmgbox.load_icon_selector($('.hnmgbox-field-id-' + field_id));
    });

    $(document).on('input', '.hnmgbox-search-icon', function (event) {
      event.preventDefault();
      var value = $(this).val();
      var $container = $(this).closest('.hnmgbox-field').find('.hnmgbox-icons-wrap');
      hnmgbox.filter_items(value, $container, '.hnmgbox-item-icon-selector');
    });
    $(document).on('click', '.hnmgbox-icon-actions .hnmgbox-btn', function (event) {
      var value = $(this).data('search');
      var $container = $(this).closest('.hnmgbox-field').find('.hnmgbox-icons-wrap');
      hnmgbox.filter_items(value, $container, '.hnmgbox-item-icon-selector');
    });

    $(document).on('click', '.hnmgbox-icons-wrap .hnmgbox-item-icon-selector', function (event) {
      var $field = $(this).closest('.hnmgbox-field');
      var $container = $field.find('.hnmgbox-icons-wrap');
      var options = $container.data('options');
      $(this).addClass(options.active_class).siblings().removeClass(options.active_class);
      $field.find('input.hnmgbox-element').val($(this).data('value')).trigger('change');
      $field.find('.hnmgbox-icon-active').html($(this).html());
    });
  };

  hnmgbox.filter_items = function (value, $container, selector) {
    $container.find(selector).each(function (index, item) {
      var data = $(item).data('key');
      if (is_empty(data)) {
        $(item).hide();
      } else {
        if (value == 'all' || data.indexOf(value) > -1) {
          $(item).show();
        } else {
          $(item).hide();
        }
      }
    });
  };

  hnmgbox.load_icon_selector = function ($field) {
    var options = $field.find('.hnmgbox-icons-wrap').data('options');
    $.ajax({
      type: 'post',
      dataType: 'json',
      url: HNMGBOX_JS.ajax_url,
      data: {
        action: 'hnmgbox_get_items',
        class_name: options.ajax_data.class_name,
        function_name: options.ajax_data.function_name,
        ajax_nonce: HNMGBOX_JS.ajax_nonce
      },
      beforeSend: function () {
        $field.find('.hnmgbox-icons-wrap').prepend("<i class='hnmgbox-icon hnmgbox-icon-spinner hnmgbox-icon-spin hnmgbox-loader'></i>");
      },
      success: function (response) {
        if (response) {
          if (response.success) {
            $.each(response.items, function (value, html) {
              var key = 'font ' + value;
              var type = 'icon font';
              if (key.indexOf('.svg') > -1) {
                key = key.split('/');
                key = key[key.length - 1];
                type = 'svg';
              }
              var $new_item = $('<div />', {
                'class': 'hnmgbox-item-icon-selector',
                'data-value': value,
                'data-key': key,
                'data-type': type
              });
              $new_item.html(html);
              $field.find('.hnmgbox-icons-wrap').append($new_item);
            });
            $field.find('.hnmgbox-icons-wrap .hnmgbox-item-icon-selector').css({
              'width': options.size,
              'height': options.size,
              'font-size': parseInt(options.size) - 14,
            });
            //c($field.first().find('.hnmgbox-icons-wrap .hnmgbox-item-icon-selector').length);//total icons
          }
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
      },
      complete: function (jqXHR, textStatus) {
        $field.find('.hnmgbox-icons-wrap').find('.hnmgbox-loader').remove();
      }
    });

    return '';
  };

  hnmgbox.toggle_section = function (event) {
    event.stopPropagation();
    var $btn = $(this);
    var $section = $btn.closest('.hnmgbox-section.hnmgbox-toggle-1');
    var $section_body = $section.find('.hnmgbox-section-body');
    var data_toggle = $section.data('toggle');
    var $icon = $section.find('.hnmgbox-toggle-icon').first();
    if ($btn.hasClass('hnmgbox-section-header') && data_toggle.target == 'icon') {
      return;
    }
    var object_toggle = {
      duration: parseInt(data_toggle.speed),
      complete: function () {
        if ($section_body.css('display') == 'block') {
          $icon.find('i').removeClass(data_toggle.close_icon).addClass(data_toggle.open_icon);
        } else {
          $icon.find('i').removeClass(data_toggle.open_icon).addClass(data_toggle.close_icon);
        }
      }
    };
    if (data_toggle.effect == 'slide') {
      $section_body.slideToggle(object_toggle);
    } else if (data_toggle.effect == 'fade') {
      $section_body.fadeToggle(object_toggle);
    }
    return false;
  };

  hnmgbox.toggle_import = function (event) {
    var $input = $(this);
    var $wrap_input_file = $('.hnmgbox-wrap-input-file');
    var $wrap_input_url = $('.hnmgbox-wrap-input-url');

    if ($input.next('img').length || ($input.val() != 'from_file' && $input.val() != 'from_url')) {
      $wrap_input_file.hide();
      $wrap_input_url.hide();
    }
    if ($input.val() == 'from_file') {
      $wrap_input_file.show();
      $wrap_input_url.hide();
    }
    if ($input.val() == 'from_url') {
      $wrap_input_url.show();
      $wrap_input_file.hide();
    }
  };

  hnmgbox.on_click_reset_values = function (event) {
    var $btn = $(this);
    var $hnmgbox_form = $btn.closest('.hnmgbox-form');
    $.hnmgboxConfirm({
      title: HNMGBOX_JS.text.reset_popup.title,
      content: HNMGBOX_JS.text.reset_popup.content,
      confirm_class: 'hnmgbox-btn-blue',
      confirm_text: HNMGBOX_JS.text.popup.accept_button,
      cancel_text: HNMGBOX_JS.text.popup.cancel_button,
      onConfirm: function () {
        $hnmgbox_form.prepend('<input type="hidden" name="' + $btn.attr('name') + '" value="true">');
        $hnmgbox_form.submit();
      },
      onCancel: function () {
        return false;
      }
    });
    return false;
  };

  hnmgbox.on_click_import_values = function (event) {
    var $btn = $(this);
    var gutenbergEditor = !!$('body.block-editor-page').length;
    if( gutenbergEditor ){
      $hnmgbox_form = $('.block-editor__container');//Gutenberg editor
    } else {
      var $hnmgbox_form = $btn.closest('.hnmgbox-form');//Admin pages
      if (!$hnmgbox_form.length) {
        $hnmgbox_form = $btn.closest('form#post');//Default wordpress editor
      }
    }
    var importInput = '<input type="hidden" name="' + $btn.attr('name') + '" value="true">';
    $.hnmgboxConfirm({
      title: HNMGBOX_JS.text.import_popup.title,
      content: HNMGBOX_JS.text.import_popup.content,
      confirm_class: 'hnmgbox-btn-blue',
      confirm_text: HNMGBOX_JS.text.popup.accept_button,
      cancel_text: HNMGBOX_JS.text.popup.cancel_button,
      onConfirm: function () {
        if( gutenbergEditor ){
          $('form.metabox-location-normal').prepend(importInput);
          var $temp_button = $hnmgbox_form.find('button.editor-post-publish-panel__toggle');
          var delay = 100;
          if( $temp_button.length ){
            $temp_button.trigger('click');
            delay = 900;
          }
          setTimeout(function(){
            var $publish_button = $hnmgbox_form.find('button.editor-post-publish-button');
            if( $publish_button.length ){
              $publish_button.trigger('click');
              setTimeout(function(){
                location.reload();
              }, 6000);
            }
          }, delay);
        } else {
          $hnmgbox_form.prepend(importInput);
          $hnmgbox_form.prepend('<input type="hidden" name="hnmgbox-import2" value="yes">');
          setTimeout(function(){
            if ($hnmgbox_form.find('#publish').length) {
              $hnmgbox_form.find('#publish').click();
            } else {
              $hnmgbox_form.submit();
            }
          }, 800);
        }
      },
      onCancel: function () {
        return false;
      }
    });
    return false;
  };

  hnmgbox.get_image_from_url = function (event) {
    var $btn = $(this);
    var $field = $btn.closest('.hnmgbox-field');
    var $input = $field.find('.hnmgbox-element-text');
    var $wrap_preview = $field.find('.hnmgbox-wrap-preview');
    if (is_empty($input.val())) {
      $.hnmgboxConfirm({
        title: HNMGBOX_JS.text.validation_url_popup.title,
        content: HNMGBOX_JS.text.validation_url_popup.content,
        confirm_text: HNMGBOX_JS.text.popup.accept_button,
        hide_cancel: true
      });
      return false;
    }
    var image_class = $wrap_preview.data('image-class');
    var $new_item = $('<li />', { 'class': 'hnmgbox-preview-item hnmgbox-preview-image' });
    $new_item.html(
      '<img src="' + $input.val() + '" class="' + image_class + '">' +
      '<a class="hnmgbox-btn hnmgbox-btn-iconize hnmgbox-btn-small hnmgbox-btn-red hnmgbox-remove-preview"><i class="hnmgbox-icon hnmgbox-icon-times-circle"></i></a>'
    );
    $wrap_preview.fadeOut(400, function () {
      $(this).html('').show();
    });
    $field.find('.hnmgbox-get-image i').addClass('hnmgbox-icon-spin');
    setTimeout(function () {
      $wrap_preview.html($new_item);
      $field.find('.hnmgbox-get-image i').removeClass('hnmgbox-icon-spin');
    }, 1200);
    return false;
  };

  hnmgbox.load_oembeds = function (event) {
    $('.hnmgbox-type-oembed').each(function (index, el) {
      if ($(el).find('.hnmgbox-wrap-oembed').data('preview-onload')) {
        hnmgbox.get_oembed($(el).find('.hnmgbox-get-oembed'));
      }
    });
  };

  hnmgbox.get_oembed = function (event) {
    var $btn;
    if ($(event.currentTarget).length) {
      $btn = $(event.currentTarget);
    } else {
      $btn = event;
    }
    var $field = $btn.closest('.hnmgbox-field');
    var $input = $field.find('.hnmgbox-element-text');
    var $wrap_preview = $field.find('.hnmgbox-wrap-preview');
    if (is_empty($input.val()) && $(event.currentTarget).length) {
      $.hnmgboxConfirm({
        title: HNMGBOX_JS.text.validation_url_popup.title,
        content: HNMGBOX_JS.text.validation_url_popup.content,
        confirm_text: HNMGBOX_JS.text.popup.accept_button,
        hide_cancel: true
      });
      return false;
    }
    $.ajax({
      type: 'post',
      dataType: 'json',
      url: HNMGBOX_JS.ajax_url,
      data: {
        action: 'hnmgbox_get_oembed',
        oembed_url: $input.val(),
        preview_size: $wrap_preview.data('preview-size'),
        ajax_nonce: HNMGBOX_JS.ajax_nonce
      },
      beforeSend: function () {
        $wrap_preview.fadeOut(400, function () {
          $(this).html('').show();
        });
        $field.find('.hnmgbox-get-oembed i').addClass('hnmgbox-icon-spin');
      },
      success: function (response) {
        if (response) {
          if (response.success) {
            var $new_item = $('<li />', { 'class': 'hnmgbox-preview-item hnmgbox-preview-oembed' });
            $new_item.html(
              '<div class="hnmgbox-oembed hnmgbox-oembed-provider-' + response.provider + ' hnmgbox-element-oembed ">' +
              response.oembed +
              '<a class="hnmgbox-btn hnmgbox-btn-iconize hnmgbox-btn-small hnmgbox-btn-red hnmgbox-remove-preview"><i class="hnmgbox-icon hnmgbox-icon-times-circle"></i></a>' +
              '</div>'
            );
            $wrap_preview.html($new_item);
          } else {
            $wrap_preview.html(response.message);
          }
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
      },
      complete: function (jqXHR, textStatus) {
        $field.find('.hnmgbox-get-oembed i').removeClass('hnmgbox-icon-spin');
      }
    });
    return false;
  };

  hnmgbox.wp_media_upload = function (event) {
    if (wp === undefined) {
      return;
    }
    var $btn = $(this);
    var media = hnmgbox.media;
    media.$field = $btn.closest('.hnmgbox-field');
    media.field_id = media.$field.closest('.hnmgbox-row').data('field-id');
    media.frame_id = media.$field.closest('.hnmgbox').attr('id') + '_' + media.field_id;
    media.$upload_btn = media.$field.find('.hnmgbox-upload-file');
    media.$wrap_preview = media.$field.find('.hnmgbox-wrap-preview');
    media.multiple = media.$field.hasClass('hnmgbox-has-multiple');
    media.$preview_item = undefined;
    media.attachment_id = undefined;

    if ($btn.closest('.hnmgbox-preview-item').length) {
      media.$preview_item = $btn.closest('.hnmgbox-preview-item');
    } else if (!media.multiple) {
      media.$preview_item = media.$field.find('.hnmgbox-preview-item').first();
    }
    if (media.$preview_item) {
      media.attachment_id = media.$preview_item.find('.hnmgbox-attachment-id').val();
    }

    if (media.frames[media.frame_id] !== undefined) {
      media.frames[media.frame_id].open();
      return;
    }

    media.frames[media.frame_id] = wp.media({
      title: media.$field.closest('.hnmgbox-type-file').find('.hnmgbox-element-label').first().text(),
      multiple: media.multiple ? 'add' : false,
    });
    media.frames[media.frame_id].on('open', hnmgbox.on_open_wp_media).on('select', hnmgbox.on_select_wp_media);
    media.frames[media.frame_id].open();
  };

  hnmgbox.on_open_wp_media = function (event) {
    var media = hnmgbox.media;
    var selected_files = hnmgbox.media.frames[media.frame_id].state().get('selection');
    if (is_empty(media.attachment_id)) {
      return selected_files.reset();
    }
    var wp_attachment = wp.media.attachment(media.attachment_id);
    wp_attachment.fetch();
    selected_files.set(wp_attachment ? [wp_attachment] : []);
  };

  hnmgbox.on_select_wp_media = function (event) {
    var media = hnmgbox.media;
    var selected_files = media.frames[media.frame_id].state().get('selection').toJSON();
    var preview_size = media.$wrap_preview.data('preview-size');
    var attach_name = media.$wrap_preview.data('field-name');
    var control_img_id = media.$field.closest('.hnmgbox-type-group').find('.hnmgbox-group-control').data('image-field-id');

    media.$field.trigger('hnmgbox_before_add_files', [selected_files, hnmgbox.media]);
    $(selected_files).each(function (index, obj) {
      var image = '';
      var inputs = '';
      var item_body = '';
      var $new_item = $('<li />', { 'class': 'hnmgbox-preview-item hnmgbox-preview-file' });

      if (obj.type == 'image') {
        $new_item.addClass('hnmgbox-preview-image');
        item_body = '<img src="' + obj.url + '" style="width: ' + preview_size.width + '; height: ' + preview_size.height + '" data-full-img="' + obj.url + '" class="hnmgbox-image hnmgbox-preview-handler">';
      } else if (obj.type == 'video') {
        $new_item.addClass('hnmgbox-preview-video');
        item_body = '<div class="hnmgbox-video">';
        item_body += '<video controls style="width: ' + preview_size.width + '; height: ' + preview_size.height + '"><source src="' + obj.url + '" type="' + obj.mime + '"></video>';
        item_body += '</div>';
      } else {
        item_body = '<img src="' + obj.icon + '" class="hnmgbox-preview-icon-file hnmgbox-preview-handler"><a href="' + obj.url + '" class="hnmgbox-preview-download-link">' + obj.filename + '</a><span class="hnmgbox-preview-mime hnmgbox-preview-handler">' + obj.mime + '</span>';
      }

      if (media.multiple) {
        inputs = '<input type="hidden" name="' + media.$upload_btn.data('field-name') + '" value="' + obj.url + '" class="hnmgbox-element hnmgbox-element-hidden">';
      }
      inputs += '<input type="hidden" name="' + attach_name + '" value="' + obj.id + '" class="hnmgbox-attachment-id">';

      $new_item.html(inputs + item_body + '<a class="hnmgbox-btn hnmgbox-btn-iconize hnmgbox-btn-small hnmgbox-btn-red hnmgbox-remove-preview"><i class="hnmgbox-icon hnmgbox-icon-times-circle"></i></a>');

      if (media.multiple) {
        if (media.$preview_item) {
          //Sólo agregamos los nuevos
          if (media.attachment_id != obj.id) {
            media.$preview_item.after($new_item);
          }
        } else {
          media.$wrap_preview.append($new_item);
        }
      } else {
        media.$wrap_preview.html($new_item);
        media.$field.find('.hnmgbox-element').attr('value', obj.url);
        if (obj.type == 'image') {
          //Sincronizar con la imagen de control de un grupo
          if (media.field_id == control_img_id) {
            hnmgbox.synchronize_selector_preview_image('.hnmgbox-control-image', media.$wrap_preview, 'add', obj.url);
          }
          //Sincronizar con otros elementos
          hnmgbox.synchronize_selector_preview_image('', media.$wrap_preview, 'add', obj.url);
        }
      }
    });
    media.$field.trigger('hnmgbox_after_add_files', [selected_files, media]);
  };

  hnmgbox.remove_preview_item = function (event) {
    var $btn = $(this);
    var $field = $btn.closest('.hnmgbox-field');
    var field_id = $field.closest('.hnmgbox-row').data('field-id');
    var control_data_img = $field.closest('.hnmgbox-type-group').find('.hnmgbox-group-control').data('image-field-id');
    var $wrap_preview = $field.find('.hnmgbox-wrap-preview');
    var multiple = $field.hasClass('hnmgbox-has-multiple');

    $field.trigger('hnmgbox_before_remove_preview_item', [multiple]);

    if (!multiple) {
      $field.find('.hnmgbox-element').attr('value', '');
    }
    $btn.closest('.hnmgbox-preview-item').remove();

    if (!multiple && $btn.closest('.hnmgbox-preview-item').hasClass('hnmgbox-preview-image')) {
      if (field_id == control_data_img) {
        hnmgbox.synchronize_selector_preview_image('.hnmgbox-control-image', $wrap_preview, 'remove', '');
      }
      hnmgbox.synchronize_selector_preview_image('', $wrap_preview, 'remove', '');
    }
    $field.find('.hnmgbox-element').trigger('change');
    $field.trigger('hnmgbox_after_remove_preview_item', [multiple]);
    return false;
  };

  hnmgbox.synchronize_selector_preview_image = function (selectors, $wrap_preview, action, value) {
    selectors = selectors || $wrap_preview.data('synchronize-selector');
    if (!is_empty(selectors)) {
      selectors = selectors.split(',');
      $.each(selectors, function (index, selector) {
        var $element = $(selector);
        if ($element.closest('.hnmgbox-type-group').length) {
          if ($element.closest('.hnmgbox-group-control').length) {
            $element = $element.closest('.hnmgbox-group-control-item.hnmgbox-active').find(selector);
          } else {
            $element = $element.closest('.hnmgbox-group-item.hnmgbox-active').find(selector);
          }
        }
        if ($element.is('img')) {
          $element.fadeOut(300, function () {
            if ($element.closest('.hnmgbox-group-control').length) {
              $element.attr('src', value);
            } else {
              $element.attr('src', value);
            }
          });
        } else {
          $element.fadeOut(300, function () {
            if ($element.closest('.hnmgbox-group-control').length) {
              $element.css('background-image', 'url(' + value + ')');
            } else {
              $element.css('background-image', 'url(' + value + ')');
            }
          });
        }
        if (action == 'add') {
          $element.fadeIn(300);
        }
        var $input = $element.closest('.hnmgbox-field').find('input.hnmgbox-element');
        if ($input.length) {
          $input.attr('value', value);
        }

        var $close_btn = $element.closest('.hnmgbox-preview-item').find('.hnmgbox-remove-preview');
        if ($close_btn.length) {
          if (action == 'add' && $input.is(':visible')) {
            $close_btn.show();
          }
          if (action == 'remove') {
            $close_btn.hide();
          }
        }
      });
    }
  };

  hnmgbox.reinit_js_plugins = function ($new_element) {
    //Inicializar Tabs
    $new_element.find('.hnmgbox-tab').each(function (iterator, item) {
      hnmgbox.init_tab($(item));
    });

    //Inicializar Switcher
    $new_element.find('.hnmgbox-type-switcher input.hnmgbox-element').each(function (iterator, item) {
      $(item).hnmgboxSwitcher('destroy');
      hnmgbox.init_switcher($(item));
    });

    //Inicializar Spinner
    $new_element.find('.hnmgbox-type-number .hnmgbox-field.hnmgbox-has-spinner').each(function (iterator, item) {
      hnmgbox.init_spinner($(item));
    });

    //Inicializar radio buttons y checkboxes
    $new_element.find('.hnmgbox-has-icheck .hnmgbox-radiochecks.init-icheck').each(function (iterator, item) {
      hnmgbox.destroy_icheck($(item));
      hnmgbox.init_checkbox($(item));
    });

    //Inicializar Colorpicker
    $new_element.find('.hnmgbox-colorpicker-color').each(function (iterator, item) {
      hnmgbox.init_colorpicker($(item));
    });

    //Inicializar Dropdown
    $new_element.find('.ui.selection.dropdown').each(function (iterator, item) {
      hnmgbox.init_dropdown($(item));
    });

    //Inicializar Sortables de grupos
    $new_element.find('.hnmgbox-group-control.hnmgbox-sortable').each(function (iterator, item) {
      hnmgbox.init_sortable_group_items($(item));
    });

    //Inicializar Sortable de items repetibles
    $new_element.find('.hnmgbox-repeatable-wrap.hnmgbox-sortable').each(function (iterator, item) {
      hnmgbox.init_sortable_repeatable_items($(item));
    });

    //Inicializar Sortable de preview items
    $new_element.find('.hnmgbox-wrap-preview-multiple').each(function (iterator, item) {
      hnmgbox.init_sortable_preview_items($(item));
    });

    //Inicializar Ace editor
    $new_element.find('.hnmgbox-code-editor').each(function (iterator, item) {
      hnmgbox.destroy_ace_editor($(item));
      hnmgbox.init_code_editor($(item));
    });

    //Inicializar Tooltip
    hnmgbox.init_tooltip($new_element.find('.hnmgbox-tooltip-handler'));
  };


  hnmgbox.destroy_wp_editor = function ($selector) {
    if (typeof tinyMCEPreInit === 'undefined' || typeof tinymce === 'undefined' || typeof QTags == 'undefined') {
      return;
    }

    //Destroy editor
    $selector.find('.quicktags-toolbar, .mce-tinymce.mce-container').remove();
    tinymce.execCommand('mceRemoveEditor', true, $selector.find('.wp-editor-area').attr('id'));

    //Register editor to init
    $selector.addClass('init-wp-editor');
  };

  hnmgbox.on_init_wp_editor = function (wp_editor, args) {
    $('.hnmgbox').trigger('hnmgbox_on_init_wp_editor', wp_editor, args);
  };

  hnmgbox.on_setup_wp_editor = function (wp_editor) {
    $('.hnmgbox').trigger('hnmgbox_on_setup_wp_editor', wp_editor);
    if (typeof tinymce === 'undefined') {
      return;
    }
    var $textarea = $(wp_editor.settings.selector);
    wp_editor.on('change mouseleave input', function (e) {
      if( wp_editor ){
        var value = wp_editor.getContent();
        $textarea.text(value).val(value);
      }
    });
  };

  hnmgbox.init_wp_editor = function ($selector) {
    if (typeof tinyMCEPreInit === 'undefined' || typeof tinymce === 'undefined' || typeof QTags == 'undefined') {
      return;
    }
    $selector.removeClass('init-wp-editor');
    $selector.removeClass('html-active').addClass('tmce-active');
    var $textarea = $selector.find('.wp-editor-area');
    var ed_id = $textarea.attr('id');
    var old_ed_id = $selector.closest('.hnmgbox-group-wrap').find('.hnmgbox-group-item').eq(0).find('.wp-editor-area').first().attr('id');

    $textarea.show();

    var ed_settings = jQuery.extend(tinyMCEPreInit.mceInit[old_ed_id], {
      body_class: ed_id,
      selector: '#' + ed_id,
      skin: "lightgray",
      entities: "38,amp,60,lt,62,gt",
      entity_encoding: "raw",
      preview_styles: "font-family font-size font-weight font-style text-decoration text-transform",
      relative_urls: false,
      remove_script_host: false,
      resize: "vertical",
      plugins: "charmap,colorpicker,hr,lists,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpautoresize,wpeditimage,wpemoji,wpgallery,wplink,wpdialogs,wptextpattern,wpview,directionality,image",
      tabfocus_elements: ":prev,:next",
      theme: "modern",
      fix_list_elements: true,
      mode: "tmce",//tmce,exact
      menubar : false,
      toolbar1: "formatselect,bold,italic,bullist,numlist,blockquote,alignleft,aligncenter,alignright,link,wp_more,spellchecker,fullscreen,wp_adv",
      toolbar2: "strikethrough,hr,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,rtl,ltr,wp_help",
      toolbar3: "",
      toolbar4: "",
      wpautop: true,
      setup: function(wp_editor) {
        hnmgbox.on_setup_wp_editor(wp_editor);//php class-field.php set_args();
        wp_editor.on('init', function(args) {
          hnmgbox.on_init_wp_editor(wp_editor, args);
        });
      }
    });

    tinyMCEPreInit.mceInit[ed_id] = ed_settings;

    // Initialize wp_editor tinymce instance
    tinymce.init(tinyMCEPreInit.mceInit[ed_id]);
    //tinymce.execCommand( 'mceAddEditor', true, ed_id );

    //Quick tags Settings
    var qt_settings = jQuery.extend({}, tinyMCEPreInit.qtInit[old_ed_id]);
    qt_settings.id = ed_id;
    new QTags(ed_id);
    QTags._buttonsInit();
  };

  hnmgbox.init_switcher = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-type-switcher input.hnmgbox-element') : $selector;
    $selector.hnmgboxSwitcher();
  };

  hnmgbox.init_spinner = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-type-number .hnmgbox-field.hnmgbox-has-spinner') : $selector;
    $selector.spinnerNum('delay', 300);
    $selector.spinnerNum('changing', function (e, newVal, oldVal) {
      $(this).trigger('hnmgbox_changed_value', newVal);
    });
  };

  hnmgbox.init_tab = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-tab') : $selector;
    $selector.each(function(index, el){
      var $tab = $(el);
      if( $tab.closest('.hnmgbox-source-item').length ){
        return;//continue each
      }
      $tab.find('.hnmgbox-tab-nav .hnmgbox-item').removeClass('active');
      $tab.find('.hnmgbox-accordion-title').remove();

      var type_tab = 'responsive';
      if ($tab.closest('#side-sortables').length) {
        type_tab = 'accordion';
      }
      $tab.hnmgboxTabs({
        collapsible: true,
        type: type_tab
      });
    });
  };

  hnmgbox.init_tooltip = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-tooltip-handler') : $selector;
    $selector.each(function (index, el) {
      var title_content = '';
      var title_tooltip = $(el).data('tipso-title');
      var position = $(el).data('tipso-position') ? $(el).data('tipso-position') : 'top';
      if (!is_empty(title_tooltip)) {
        title_content = '<h3>' + title_tooltip + '</h3>';
      }
      $(el).tipso({
        delay: 10,
        speed: 100,
        offsetY: 2,
        tooltipHover: true,
        position: position,
        titleContent: title_content,
        onBeforeShow: function ($element, element, e) {
          $(e.tipso_bubble).addClass($(el).closest('.hnmgbox').data('skin'));
        },
        onShow: function ($element, element, e) {
          //$(e.tipso_bubble).removeClass('top').addClass(position);
        },
        //hideDelay: 1000000
      });
    });
  };

  hnmgbox.init_checkbox = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-has-icheck .hnmgbox-radiochecks.init-icheck') : $selector;
    $selector.find('input').iCheck({
      radioClass: 'iradio_flat-blue',
      checkboxClass: 'icheckbox_flat-blue',
    });
  };

  hnmgbox.destroy_icheck = function ($selector) {
    $selector.find('input').each(function (index, input) {
      $(input).attr('style', '');
      $(input).next('ins').remove();
      $(input).unwrap();
    });
  };

  hnmgbox.init_image_selector = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-type-image_selector .init-image-selector, .hnmgbox-type-import .init-image-selector') : $selector;
    $selector.hnmgboxImageSelector({
      active_class: 'hnmgbox-active'
    });
  };

  hnmgbox.init_dropdown = function ($selector) {
    $selector = is_empty($selector) ? $('.ui.selection.dropdown') : $selector;
    $selector.each(function (index, el) {
      var max_selections = parseInt($(el).data('max-selections'));
      var value = $(el).find('input[type="hidden"]').val();
      if (max_selections > 1 && $(el).hasClass('multiple')) {
        $(el).dropdownHnmgbox({
          maxSelections: max_selections,
        });
        $(el).dropdownHnmgbox('set selected', value.split(','));
      } else {
        $(el).dropdownHnmgbox();
      }
    });
  };

  hnmgbox.on_focusout_input_colorpicker = function () {
    var $field = $(this).closest('.hnmgbox-field');
    var value = $(this).val();
    $(this).attr('value', value);
    $field.find('.hnmgbox-colorpicker-color').attr('value', value).css('background-color', value);
    return false;
  };

  hnmgbox.set_default_value_colorpicker = function () {
    var $field = $(this).closest('.hnmgbox-field');
    var value = $field.data('default');
    if (value) {
      $field.find('input.hnmgbox-element').attr('value', value);
      $field.find('.hnmgbox-colorpicker-color').attr('value', value).css('background-color', value);
    }
  };

  hnmgbox.init_colorpicker = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-colorpicker-color') : $selector;
    $selector.colorPicker({
      cssAddon: '.cp-color-picker {margin-top:6px;}',
      buildCallback: function ($elm) {
      },
      renderCallback: function ($elm, toggled) {
        var $field = $elm.closest('.hnmgbox-field');
        this.$UI.find('.cp-alpha').toggle($field.hasClass('hnmgbox-has-alpha'));
        var value = this.color.toString('rgb', true);
        if (!$field.hasClass('hnmgbox-has-alpha')) {//|| value.endsWith(', 1)')
          value = '#' + this.color.colors.HEX;
        }
        value = value.indexOf('NAN') > -1 ? '' : value;
        $field.find('input').attr('value', value);
        $field.find('.hnmgbox-colorpicker-color').attr('value', value).css('background-color', value);

        //Para la gestión de eventos
        $field.find('input').trigger('change');
      }
    });
  };

  hnmgbox.destroy_ace_editor = function ($selector) {
    var $textarea = $selector.closest('.hnmgbox-field').find('textarea.hnmgbox-element');
    $selector.text($textarea.val());
  };

  hnmgbox.init_code_editor = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-code-editor') : $selector;
    $selector.each(function (index, el) {
      var editor = ace.edit($(el).attr('id'));
      var language = $(el).data('language');
      var theme = $(el).data('theme');
      editor.setTheme("ace/theme/" + theme);
      editor.getSession().setMode("ace/mode/" + language);
      editor.setFontSize(15);
      editor.setShowPrintMargin(false);
      editor.getSession().on('change', function (e) {
        $(el).closest('.hnmgbox-field').find('textarea.hnmgbox-element').text(editor.getValue());
      });

      //Include auto complete
      ace.config.loadModule('ace/ext/language_tools', function () {
        editor.setOptions({
          enableBasicAutocompletion: true,
          enableSnippets: true
        });
      });
    });
  };

  hnmgbox.init_sortable_preview_items = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-wrap-preview-multiple') : $selector;
    $selector.sortable({
      items: '.hnmgbox-preview-item',
      placeholder: "hnmgbox-preview-item hnmgbox-sortable-placeholder",
      start: function (event, ui) {
        ui.placeholder.css({
          'width': ui.item.css('width'),
          'height': ui.item.css('height'),
        });
      },
    }).disableSelection();
  };

  hnmgbox.init_sortable_checkbox = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-has-icheck .hnmgbox-radiochecks.init-icheck.hnmgbox-sortable') : $selector;
    $selector.sortable({
      items: '>label',
      placeholder: "hnmgbox-icheck-sortable-item hnmgbox-sortable-placeholder",
      start: function (event, ui) {
        ui.placeholder.css({
          'width': ui.item.css('width'),
          'height': ui.item.css('height'),
        });
      },
    }).disableSelection();
  };

  hnmgbox.init_sortable_repeatable_items = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-repeatable-wrap.hnmgbox-sortable') : $selector;
    $selector.sortable({
      handle: '.hnmgbox-sort-item',
      items: '.hnmgbox-repeatable-item',
      placeholder: "hnmgbox-repeatable-item hnmgbox-sortable-placeholder",
      start: function (event, ui) {
        ui.placeholder.css({
          'width': ui.item.css('width'),
          'height': ui.item.css('height'),
        });
      },
      update: function (event, ui) {
        // No funciona bien con wp_editor, mejor usamos 'stop'
        // var $repeatable_wrap = $(event.target);
        // $repeatable_wrap.trigger('sort_repeatable_items');
      },
      stop: function (event, ui) {
        var $repeatable_wrap = $(event.target);
        $repeatable_wrap.trigger('sort_repeatable_items');
      }
    }).disableSelection();
  };

  hnmgbox.init_sortable_group_items = function ($selector) {
    $selector = is_empty($selector) ? $('.hnmgbox-group-control.hnmgbox-sortable') : $selector;
    $selector.sortable({
      items: '.hnmgbox-group-control-item',
      placeholder: "hnmgbox-sortable-placeholder",
      start: function (event, ui) {
        ui.placeholder.css({
          'width': ui.item.css('width'),
          'height': ui.item.css('height'),
        });
      },
      update: function (event, ui) {
        var $group_control = $(event.target);
        var $group_wrap = $group_control.next('.hnmgbox-group-wrap');

        var old_index = ui.item.attr('data-index');
        var new_index = $group_control.find('.hnmgbox-group-control-item').index(ui.item);
        var $group_item = $group_wrap.children('.hnmgbox-group-item[data-index=' + old_index + ']');
        var $group_item_reference = $group_wrap.children('.hnmgbox-group-item[data-index=' + new_index + ']');
        var start_index = 0;
        var end_index;

        if (old_index < new_index) {
          $group_item.insertAfter($group_item_reference);
          start_index = old_index;
          end_index = new_index;
        } else {
          $group_item.insertBefore($group_item_reference);
          start_index = new_index;
          end_index = old_index;
        }

        $group_wrap.trigger('hnmgbox_on_sortable_group_item', [old_index, new_index]);

        $group_control.trigger('sort_group_control_items');

        $group_wrap.trigger('sort_group_items', [start_index, end_index]);

        //Click event, to initialize some fields -> (WP Editors)
        if (ui.item.hasClass('hnmgbox-active')) {
          ui.item.trigger('click');
        }
      }
    }).disableSelection();
  };

  hnmgbox.add_repeatable_item = function (event) {
    var $btn = $(this);
    var $repeatable_wrap = $btn.closest('.hnmgbox-repeatable-wrap');
    $repeatable_wrap.trigger('hnmgbox_before_add_repeatable_item');

    var $source_item = $btn.prev('.hnmgbox-repeatable-item');
    var index = parseInt($source_item.data('index'));
    var $cloned = $source_item.clone();
    var $new_item = $('<div />', { 'class': $cloned.attr('class'), 'data-index': index + 1, 'style': 'display: none' });

    hnmgbox.set_changed_values($cloned, $repeatable_wrap.closest('.hnmgbox-row').data('field-type'));

    $new_item.html($cloned.html());
    $source_item.after($new_item);
    $new_item.slideDown(150, function () {
      //Ordenar y cambiar ids y names
      $repeatable_wrap.trigger('sort_repeatable_items');
      //Actualizar eventos
      hnmgbox.reinit_js_plugins($new_item);
    });
    $repeatable_wrap.trigger('hnmgbox_after_add_repeatable_item');
    return false;
  };

  hnmgbox.remove_repeatable_item = function (event) {
    var $repeatable_wrap = $(this).closest('.hnmgbox-repeatable-wrap');
    if ($repeatable_wrap.find('.hnmgbox-repeatable-item').length > 1) {
      $repeatable_wrap.trigger('hnmgbox_before_remove_repeatable_item');
      var $item = $(this).closest('.hnmgbox-repeatable-item');
      $item.slideUp(150, function () {
        $item.remove();
        $repeatable_wrap.trigger('sort_repeatable_items');
        $repeatable_wrap.trigger('hnmgbox_after_remove_repeatable_item');
      });
    }
    return false;
  };

  hnmgbox.sort_repeatable_items = function (event) {
    var $repeatable_wrap = $(event.target);
    var row_level = parseInt($repeatable_wrap.closest('[class*="hnmgbox-row"]').data('row-level'));

    $repeatable_wrap.find('.hnmgbox-repeatable-item').each(function (index, item) {
      hnmgbox.update_attributes($(item), index, row_level);

      //Destroy WP Editors
      $(item).find('.wp-editor-wrap').each(function (index, el) {
        hnmgbox.destroy_wp_editor($(el));
      });
      hnmgbox.update_fields_on_item_active($(item));
    });
  };

  hnmgbox.new_group_item = function (event) {
    if ($(event.currentTarget).hasClass('hnmgbox-duplicate-group-item')) {
      hnmgbox.duplicate = true;
      event.stopPropagation();
    } else {
      hnmgbox.duplicate = false;
    }
    var $group = $(this).closest('.hnmgbox-type-group');
    var $control_item = hnmgbox.add_group_control_item(event, $(this));
    var $group_item = hnmgbox.add_group_item(event, $(this));

    var args = {
      event: event,
      $btn: $(this),
      $group: $group,
      duplicate: hnmgbox.duplicate,
      $group_item: $group_item,
      $control_item: $control_item,
      index: $group_item.data('index'),
      type: $group_item.data('type')
    };

    $group.trigger('hnmgbox_after_add_group_item', [args]);

    //Active new item
    $control_item.trigger('click');

    return false;
  };

  hnmgbox.add_group_control_item = function (event, $btn) {
    var item_type = $btn.data('item-type');
    var $group = $btn.closest('.hnmgbox-type-group');
    var $group_wrap = $group.find('.hnmgbox-group-wrap').first();
    var $group_control = $btn.closest('.hnmgbox-type-group').find('.hnmgbox-group-control').first();
    var $source_item = $group_control.find('.hnmgbox-group-control-item').last();
    var index = -1;
    if ($source_item.length) {
      index = $source_item.data('index');
    }
    $source_item = $group_wrap.next('.hnmgbox-source-item').find('.hnmgbox-group-control-item');

    if (hnmgbox.duplicate) {
      index = $btn.closest('.hnmgbox-group-control-item').index();
      $source_item = $group_control.children('.hnmgbox-group-control-item').eq(index);
      item_type = $source_item.find('.hnmgbox-input-group-item-type').val();
    }
    index = parseInt(index);
    var args = {
      event: event,
      $btn: $btn,
      $group: $group,
      duplicate: hnmgbox.duplicate,
      $group_item: $group_wrap.children('.hnmgbox-group-item').eq(index),
      $control_item: $source_item,
      index: index,
      type: item_type
    };
    $group.trigger('hnmgbox_before_add_group_item', [args]);

    var row_level = parseInt($source_item.closest('.hnmgbox-row').data('row-level'));
    var $cloned = $source_item.clone();
    var $new_item = $('<li />', { 'class': $cloned.attr('class'), 'data-index': index + 1, 'data-type': item_type });

    $new_item.html($cloned.html());
    $source_item.after($new_item);

    //Add new item
    if (index == -1) {
      $group_control.append($new_item);
    } else {
      $group_control.children('.hnmgbox-group-control-item').eq(index).after($new_item);
    }
    $new_item = $group_control.children('.hnmgbox-group-control-item').eq(index + 1);

    $new_item.alterClass('control-item-type-*', 'control-item-type-' + item_type);
    $new_item.find('input.hnmgbox-input-group-item-type').val(item_type);
    $group_control.trigger('sort_group_control_items');

    if (hnmgbox.duplicate === false && $new_item.find('.hnmgbox-control-image').length) {
      $new_item.find('.hnmgbox-control-image').css('background-image', 'url()');
    }
    if (hnmgbox.duplicate === false) {
      var $input = $new_item.find('.hnmgbox-inner input');
      if ($input.length) {
        var value = $group_control.data('control-name').toString();
        $input.attr('value', value.replace(/(#\d?)/g, '#' + (index + 2)));
        if ($btn.hasClass('hnmgbox-custom-add')) {
          $input.attr('value', $btn.text());
        }
      }
    }
    return $new_item;
  };

  hnmgbox.add_group_item = function (event, $btn) {
    var item_type = $btn.data('item-type');
    var $group_wrap = $btn.closest('.hnmgbox-type-group').find('.hnmgbox-group-wrap').first();
    var $source_item = $group_wrap.children('.hnmgbox-group-item').last();
    var index = -1;
    if ($source_item.length) {
      index = $source_item.data('index');
    }
    $source_item = $group_wrap.next('.hnmgbox-source-item').find('.hnmgbox-group-item');

    if (hnmgbox.duplicate) {
      index = $btn.closest('.hnmgbox-group-control-item').index();
      $source_item = $group_wrap.children('.hnmgbox-group-item').eq(index);
      item_type = $btn.closest('.hnmgbox-group-control-item').find('.hnmgbox-input-group-item-type').val();
    }

    index = parseInt(index);
    var row_level = parseInt($source_item.closest('.hnmgbox-row').data('row-level'));
    var $cloned = $source_item.clone();
    var $cooked_item = hnmgbox.cook_group_item($cloned, row_level, index);
    var $new_item = $('<div />', { 'class': $cloned.attr('class'), 'data-index': index + 1, 'data-type': item_type });
    $new_item.html($cooked_item.html());
    //Add new item
    if (index == -1) {
      $group_wrap.append($new_item);
    } else {
      $group_wrap.children('.hnmgbox-group-item').eq(index).after($new_item);
    }
    $new_item = $group_wrap.children('.hnmgbox-group-item').eq(index + 1);
    $new_item.alterClass('group-item-type-*', 'group-item-type-' + item_type);
    $group_wrap.trigger('sort_group_items', [index + 1]);

    //Actualizar eventos
    hnmgbox.reinit_js_plugins($new_item);

    if (hnmgbox.duplicate === false) {
      //hnmgbox.set_default_values( $new_item );//Ya no es necesario por el nuevo source item
    }
    return $new_item;
  };

  hnmgbox.cook_group_item = function ($group_item, row_level, prev_index) {
    var index = prev_index + 1;

    if (hnmgbox.duplicate) {
      hnmgbox.set_changed_values($group_item);
    } else {
      //No es duplicado, restaurar todo, eliminar items de grupos internos
      $group_item.find('.hnmgbox-group-wrap').each(function (index, wrap_group) {
        $(wrap_group).find('.hnmgbox-group-item').first().addClass('hnmgbox-active').siblings().remove();
        $(wrap_group).prev('.hnmgbox-group-control').children('.hnmgbox-group-control-item').first().addClass('hnmgbox-active').siblings().remove();
      });
      $group_item.find('.hnmgbox-repeatable-wrap').each(function (index, wrap_repeat) {
        $(wrap_repeat).find('.hnmgbox-repeatable-item').not(':first').remove();
      });
    }

    hnmgbox.update_attributes($group_item, index, row_level);

    return $group_item;
  };

  hnmgbox.set_changed_values = function ($new_item, field_type) {
    var $textarea, $input;
    $new_item.find('.hnmgbox-field').each(function (iterator, item) {
      var type = field_type || $(item).closest('.hnmgbox-row').data('field-type');
      switch (type) {
        case 'text':
        case 'number':
        case 'oembed':
        case 'file':
        case 'image':
          $input = $(item).find('input.hnmgbox-element');
          $input.attr('value', $input.val());
          break;
      }
    });
  };

  hnmgbox.remove_group_item = function (event) {
    event.preventDefault();
    event.stopPropagation();
    var $btn = $(this);
    var $row = $btn.closest('.hnmgbox-type-group');
    var $group_wrap = $row.find('.hnmgbox-group-wrap').first();
    var $group_control = $btn.closest('.hnmgbox-group-control');
    var index = $btn.closest('.hnmgbox-group-control-item').data('index');

    $.hnmgboxConfirm({
      title: HNMGBOX_JS.text.remove_item_popup.title,
      content: HNMGBOX_JS.text.remove_item_popup.content,
      confirm_class: 'hnmgbox-btn-blue',
      confirm_text: HNMGBOX_JS.text.popup.accept_button,
      cancel_text: HNMGBOX_JS.text.popup.cancel_button,
      onConfirm: function () {
        setTimeout(function () {
          hnmgbox.remove_group_control_item($btn);
          hnmgbox._remove_group_item($btn);
        }, hnmgbox.delays.removeItem.confirm);

        setTimeout(function () {
          $group_wrap.trigger('sort_group_items', [index]);
          $group_control.children('.hnmgbox-group-control-item').eq(0).trigger('click');
          $group_control.trigger('sort_group_control_items');
        }, hnmgbox.delays.removeItem.events);
      }
    });
    return false;
  };

  hnmgbox.remove_group_items = function (items) {
    if( ! items.length ){
      return;
    }
    var $row, $group_wrap, $group_control;
    $.hnmgboxConfirm({
      title: HNMGBOX_JS.text.remove_item_popup.title,
      content: HNMGBOX_JS.text.remove_item_popup.content,
      confirm_class: 'hnmgbox-btn-blue',
      confirm_text: HNMGBOX_JS.text.popup.accept_button,
      cancel_text: HNMGBOX_JS.text.popup.cancel_button,
      onConfirm: function () {
        var min_index = 1000;
        var type = '';
        setTimeout(function () {
          $(items).each(function(i, $element){
            var index = $element.data('index');
            if( index < min_index ){
              min_index = index;
              type = $element.data('type');
            }
            if( i == 0){
              $row = $element.closest('.hnmgbox-type-group');
              $group_wrap = $row.find('.hnmgbox-group-wrap').first();
              $group_control = $element.closest('.hnmgbox-group-control');
            }
            hnmgbox.remove_group_control_item($element);
            hnmgbox._remove_group_item($element);
          });
        }, hnmgbox.delays.removeItem.confirm);

        setTimeout(function () {
          $group_wrap.trigger('sort_group_items', [min_index]);
          $group_control.children('.hnmgbox-group-control-item').eq(0).trigger('click');
          $group_control.trigger('sort_group_control_items');
        }, hnmgbox.delays.removeItem.events);
      }
    });
  };

  hnmgbox.remove_group_control_item = function ($btn) {
    var $item = $btn.closest('.hnmgbox-group-control-item');
    $item.fadeOut(hnmgbox.delays.removeItem.fade, function () {
      $item.remove();
    });
  };

  hnmgbox._remove_group_item = function ($btn) {
    var $row = $btn.closest('.hnmgbox-type-group');
    var $group_wrap = $row.find('.hnmgbox-group-wrap').first();
    var index = $btn.closest('.hnmgbox-group-control-item').data('index');
    $row.trigger('hnmgbox_before_remove_group_item');
    var $item = $group_wrap.children('.hnmgbox-group-item[data-index="'+index+'"]');
    var type = $item.data('type');
    $item.fadeOut(hnmgbox.delays.removeItem.fade, function () {
      $item.remove();
      // $group_wrap.trigger('sort_group_items', [index]);
      $row.trigger('hnmgbox_after_remove_group_item', [index, type]);
      // $group_control.children('.hnmgbox-group-control-item').eq(0).trigger('click');
    });
  };

  hnmgbox.on_click_group_control_item = function (event) {
    var $control_item = $(this);
    hnmgbox.active_control_item(event, $control_item);
    return false;
  };

  hnmgbox.active_control_item = function (event, $control_item) {
    var $group_control = $control_item.parent();
    var index = $control_item.index();
    var $group = $group_control.closest('.hnmgbox-type-group');
    var $group_wrap = $group.find('.hnmgbox-group-wrap').first();
    var $group_item = $group_wrap.children('.hnmgbox-group-item').eq(index);
    var $old_control_item = $group_control.children('.hnmgbox-active');

    $group_control.children('.hnmgbox-group-control-item').removeClass('hnmgbox-active');
    $control_item.addClass('hnmgbox-active');

    $group_wrap.children('.hnmgbox-group-item').removeClass('hnmgbox-active');
    $group_item.addClass('hnmgbox-active');

    var args = {
      $group_item: $group_item,
      $control_item: $control_item,
      index: $group_item.data('index'),
      type: $group_item.data('type'),
      event: event,
      old_index: $old_control_item.data('index'),
    };

    setTimeout(function(){
      $group.trigger('hnmgbox_on_active_group_item', [args]);
      hnmgbox.update_fields_on_item_active($group_item);
    }, 10);//Retardar un poco para posibles eventos on click desde otras aplicaciones
    return false;
  };

  hnmgbox.update_fields_on_item_active = function ($group_item) {
    //Init WP Editor
    $group_item.find('.wp-editor-wrap.init-wp-editor').each(function (index, el) {
      hnmgbox.init_wp_editor($(el));
    });
  };

  hnmgbox.sort_group_control_items = function (event) {
    var $group_control = $(event.target);
    var row_level = parseInt($group_control.closest('.hnmgbox-row').data('row-level'));
    $group_control.children('.hnmgbox-group-control-item').each(function (index, item) {
      hnmgbox.update_group_control_item($(item), index, row_level);
    });
  };

  hnmgbox.sort_group_items = function (event, start_index, end_index) {
    var $group_wrap = $(event.target);
    $group_wrap.trigger('hnmgbox_before_sort_group');
    var row_level = parseInt($group_wrap.closest('.hnmgbox-row').data('row-level'));
    end_index = end_index !== undefined ? parseInt(end_index) + 1 : undefined;

    var $items = $group_wrap.children('.hnmgbox-group-item');
    var $items_to_sort = $items.slice(start_index, end_index);

    $items_to_sort.each(function (i, group_item) {
      var index = $group_wrap.find($(group_item)).index();
      hnmgbox.update_attributes($(group_item), index, row_level);

      //Destroy WP Editors
      $(group_item).find('.wp-editor-wrap').each(function (index, el) {
        hnmgbox.destroy_wp_editor($(el));
      });
    });
    $group_wrap.trigger('hnmgbox_after_sort_group');
  };

  hnmgbox.update_group_control_item = function ($item, index, row_level) {
    $item.data('index', index).attr('data-index', index);
    $item.find('.hnmgbox-info-order-item').text('#' + (index + 1));
    var value;
    if ($item.find('.hnmgbox-inner input').length) {
      value = $item.find('.hnmgbox-inner input').val();
      $item.find('.hnmgbox-inner input').val(value.replace(/(#\d+)/g, '#' + (index + 1)));
    }

    //Cambiar names
    $item.find('*[name]').each(function (i, item) {
      hnmgbox.update_name_ttribute($(item), index, row_level);
    });
  };

  hnmgbox.update_attributes = function ($new_item, index, row_level) {
    $new_item.data('index', index).attr('data-index', index);

    $new_item.find('*[name]').each(function (i, item) {
      hnmgbox.update_name_ttribute($(item), index, row_level);
    });

    $new_item.find('*[id]').each(function (i, item) {
      hnmgbox.update_id_attribute($(item), index, row_level);
    });

    $new_item.find('label[for]').each(function (i, item) {
      hnmgbox.update_for_attribute($(item), index, row_level);
    });

    $new_item.find('*[data-field-name]').each(function (i, item) {
      hnmgbox.update_data_name_attribute($(item), index, row_level);
    });

    $new_item.find('*[data-editor]').each(function (i, item) {
      hnmgbox.update_data_editor_attribute($(item), index, row_level);
    });

    $new_item.find('*[data-wp-editor-id]').each(function (i, item) {
      hnmgbox.update_data_wp_editor_id_attribute($(item), index, row_level);
    });

    hnmgbox.set_checked_inputs($new_item, row_level);
  };

  hnmgbox.set_checked_inputs = function ($group_item, row_level) {
    $group_item.find('.hnmgbox-field').each(function (iterator, item) {
      if ($(item).hasClass('hnmgbox-has-icheck') || $(item).closest('.hnmgbox-type-image_selector').length) {
        var $input = $(item).find('input[type="radio"], input[type="checkbox"]');
        $input.each(function (i, input) {
          if ($(input).parent('div').hasClass('checked')) {
            $(input).attr('checked', 'checked').prop('checked', true);
          } else {
            $(input).removeAttr('checked').prop('checked', false);
          }
          if ($(input).next('img').hasClass('hnmgbox-active')) {
            $(input).attr('checked', 'checked').prop('checked', true);
          }
        });
      }
    });
  };

  hnmgbox.update_name_ttribute = function ($el, index, row_level) {
    var old_name = $el.attr('name');
    var new_name = '';
    if (typeof old_name !== 'undefined') {
      new_name = hnmgbox.nice_replace(/(\[\d+\])/g, old_name, '[' + index + ']', row_level);
      $el.attr('name', new_name);
    }
  };

  hnmgbox.update_id_attribute = function ($el, index, row_level) {
    var old_id = $el.attr('id');
    var new_id = '';
    if (typeof old_id !== 'undefined') {
      new_id = hnmgbox.nice_replace(/(__\d+__)/g, old_id, '__' + index + '__', row_level);
      $el.attr('id', new_id);
    }
  };

  hnmgbox.update_for_attribute = function ($el, index, row_level) {
    var old_for = $el.attr('for');
    var new_for = '';
    if (typeof old_for !== 'undefined') {
      new_for = hnmgbox.nice_replace(/(__\d+__)/g, old_for, '__' + index + '__', row_level);
      $el.attr('for', new_for);
    }
  };
  hnmgbox.update_data_name_attribute = function ($el, index, row_level) {
    var old_data = $el.attr('data-field-name');
    var new_data = '';
    if (typeof old_data !== 'undefined') {
      new_data = hnmgbox.nice_replace(/(\[\d+\])/g, old_data, '[' + index + ']', row_level);
      $el.attr('data-field-name', new_data);
    }
  };

  hnmgbox.update_data_editor_attribute = function ($el, index, row_level) {
    var old_data = $el.attr('data-editor');
    var new_data = '';
    if (typeof old_data !== 'undefined') {
      new_data = hnmgbox.nice_replace(/(__\d+__)/g, old_data, '__' + index + '__', row_level);
      $el.attr('data-editor', new_data);
    }
  };
  hnmgbox.update_data_wp_editor_id_attribute = function ($el, index, row_level) {
    var old_data = $el.attr('data-wp-editor-id');
    var new_data = '';
    if (typeof old_data !== 'undefined') {
      new_data = hnmgbox.nice_replace(/(__\d+__)/g, old_data, '__' + index + '__', row_level);
      $el.attr('data-wp-editor-id', new_data);
    }
  };

  hnmgbox.set_default_values = function ($group) {
    $group.find('*[data-default]').each(function (iterator, item) {
      var $field = $(item);
      var default_value = $field.data('default');
      if ($field.closest('.hnmgbox-type-number').length) {
        hnmgbox.set_field_value($field, default_value);
      } else {
        hnmgbox.set_field_value($field, default_value);
      }
    });
  };

  hnmgbox.set_field_value = function ($field, value, extra_value, update_initial_values) {
    if( !$field.length ){
      return;
    }
    var $input, array;
    var type = $field.closest('.hnmgbox-row').data('field-type');
    value = is_empty(value) ? '' : value;

    switch (type) {
      case 'number':
        var $input = $field.find('input.hnmgbox-element');
        //Ctrl + z functionality
        hnmgbox.update_prev_values($input, value, update_initial_values);

        if (value == $input.val()) {
          return;
        }

        $input.attr('value', value);
        var unit = extra_value === undefined ? $input.data('default-unit') : extra_value;
        $field.find('input.hnmgbox-unit-number').attr('value', unit).trigger('change');
        unit = unit || '#';
        $field.find('.hnmgbox-unit span').text(unit);
        break;

      case 'text':
      case 'hidden':
      case 'colorpicker':
      case 'date':
      case 'time':
        var $input = $field.find('input.hnmgbox-element');

        //Ctrl + z functionality
        hnmgbox.update_prev_values($input, value, update_initial_values);

        if (value == $input.val()) {
          return;
        }
        $input.attr('value', value).trigger('change').trigger('input');
        if (type == 'colorpicker') {
          $field.find('.hnmgbox-colorpicker-color').attr('value', value).css('background-color', value);
        }
        break;

      case 'file':
      case 'oembed':
        var $input = $field.find('input.hnmgbox-element');

        //Ctrl + z functionality
        hnmgbox.update_prev_values($input, value, update_initial_values);

        $input.attr('value', value).trigger('change').trigger('input');
        $field.find('.hnmgbox-wrap-preview').html('');
        break;

      case 'image':
        $field.find('input.hnmgbox-element').attr('value', value);
        $field.find('img.hnmgbox-element-image').attr('src', value);
        if (is_empty(value)) {
          $field.find('img.hnmgbox-element-image').hide().next('.hnmgbox-remove-preview').hide();
        }
        break;

      case 'select':
        var $input = $field.find('.hnmgbox-element input[type="hidden"]');

        //Ctrl + z functionality
        hnmgbox.update_prev_values($input, value, update_initial_values);

        var $dropdown = $field.find('.ui.selection.dropdown');
        var max_selections = parseInt($dropdown.data('max-selections'));
        $dropdown.dropdownHnmgbox('clear');
        if (max_selections > 1 && $dropdown.hasClass('multiple')) {
          $dropdown.dropdownHnmgbox('set selected', value.split(','));
        } else {
          $dropdown.dropdownHnmgbox('set selected', value);
        }
        break;

      case 'switcher':
        $input = $field.find('input');

        //Ctrl + z functionality
        hnmgbox.update_prev_values($input, value, update_initial_values);

        if ($input.val() !== value) {
          if ($input.next().hasClass('hnmgbox-sw-on')) {
            $input.hnmgboxSwitcher('set_off');
          } else {
            $input.hnmgboxSwitcher('set_on');
          }
        }
        break;

      case 'wp_editor':
        var $textarea = $field.find('textarea.wp-editor-area');
        $textarea.val(value);
        var wp_editor = tinymce.get($textarea.attr('id'));
        if (wp_editor) {
          wp_editor.setContent(value);
        }
        break;

      case 'textarea':
        $field.find('textarea').val(value).trigger('input');
        break;

      case 'code_editor':
        $field.find('textarea.hnmgbox-element').text(value);
        var editor = ace.edit($field.find('.hnmgbox-code-editor').attr('id'));
        editor.setValue(value);
        break;

      case 'icon_selector':
        $field.find('input.hnmgbox-element').attr('value', value).trigger('change');
        var html = '';
        if (value.indexOf('.svg') > -1) {
          html = '<img src="' + value + '">';
        } else {
          html = '<i class="' + value + '"></i>';
        }
        $field.find('.hnmgbox-icon-active').html(html);
        break;

      case 'image_selector':
        value = value.toString().toLowerCase();
        $input = $field.find('input');

        if (!$input.closest('.hnmgbox-image-selector').data('image-selector').like_checkbox) {
          if (is_empty($input.filter(':checked').val())) {
            return;
          }
          if ($input.filter(':checked').val().toLowerCase() != value) {
            $input.filter(function (i) {
              return $(this).val().toLowerCase() == value;
            }).trigger('click.img_selector');
          }
        } else {
          if (get_value_checkbox($input, ',').toLowerCase() != value) {
            $input.first().trigger('img_selector_disable_all');
            array = value.replace(/ /g, '').split(',');
            $.each(array, function (index) {
              $input.filter(function (i) {
                return $(this).val().toLowerCase() == array[index];
              }).trigger('click.img_selector');
            });
          }
        }
        break;

      case 'checkbox':
      case 'radio':
        value = value.toString().toLowerCase();
        if ($field.hasClass('hnmgbox-has-icheck') && $field.find('.init-icheck').length) {
          $input = $field.find('input');
          if (type == 'radio') {
            if (is_empty($input.filter(':checked').val())) {
              return;
            }
            $input.iCheck('uncheck');
            //if( $input.filter(':checked').val().toLowerCase() != value ){
            $input.filter(function (i) {
              return $(this).val().toLowerCase() == value;
            }).iCheck('check');
            //}
          } else if (type == 'checkbox') {
            if (get_value_checkbox($input, ',').toLowerCase() != value) {
              $input.iCheck('uncheck');
              array = value.replace(/ /g, '').split(',');
              $.each(array, function (index) {
                $input.filter(function (i) {
                  return $(this).val().toLowerCase() == array[index];
                }).iCheck('check');
              });
            }
          }
        }
        break;
    }
  };

  hnmgbox.update_prev_values = function ($input, value, update_initial_values) {
    if( update_initial_values ){
      $input.attr('data-prev-value', value).data('prev-value', value);
      $input.attr('data-initial-value', value).data('initial-value', value);
      $input.attr('data-temp-value', value).data('temp-value', value);
    } else {
      //Va un poco lento cuando hay múltiples cambios a la vez
      //Ctrl + z functionality
      // var tempValue = $input.data('temp-value');
      // if( tempValue != value ){
      //   $input.attr('data-prev-value', tempValue).data('prev-value', tempValue);
      //   $input.attr('data-temp-value', value).data('temp-value', value);
      // }
    }
  };

  hnmgbox.nice_replace = function (regex, string, replace_with, row_level, offset) {
    offset = offset || 0;
    //http://stackoverflow.com/questions/10584748/find-and-replace-nth-occurrence-of-bracketed-expression-in-string
    var n = 0;
    string = string.replace(regex, function (match, i, original) {
      n++;
      return (n === row_level + offset) ? replace_with : match;
    });
    return string;
  };

  hnmgbox.get_object_id = function () {
    return $('.hnmgbox').data('object-id');
  };

  hnmgbox.get_object_type = function () {
    return $('.hnmgbox').data('object-type');
  };

  hnmgbox.get_group_object_values = function ($group_item) {
    var values = $group_item.find('input[name],select[name],textarea[name]').serializeArray();
    return values;
  };

  hnmgbox.get_group_values = function ($group_item) {
    var object_values = hnmgbox.get_group_object_values($group_item);
    var values = {};
    $.each(object_values, function (index, field) {
      values[field.name] = field.value;
    });
    return values;
  };

  hnmgbox.compare_values_by_operator = function (value1, operator, value2) {
    switch (operator) {
      case '<':
        return value1 < value2;
      case '<=':
        return value1 <= value2;
      case '>':
        return value1 > value2;
      case '>=':
        return value1 >= value2;
      case '==':
      case '=':
        return value1 == value2;
      case '!=':
        return value1 != value2;
      default:
        return false;
    }
    return false;
  };

  hnmgbox.add_style_attribute = function ($element, new_style) {
    var old_style = $element.attr('style') || '';
    $element.attr('style', old_style + '; ' + new_style);
  };

  hnmgbox.is_image_file = function (value) {
    value = $.trim(value.toString());
    return (value.match(/\.(jpeg|jpg|gif|png)$/) !== null);
  };


  //Funciones privadas
  function is_empty(value) {
    return (value === undefined || value === false || $.trim(value).length === 0);
  }

  function get_class_starts_with($elment, starts_with) {
    return $.grep($elment.attr('class').split(" "), function (v, i) {
      return v.indexOf(starts_with) === 0;
    }).join();
  }

  function get_value_checkbox($elment, separator) {
    separator = separator || ',';
    if ($elment.attr('type') != 'checkbox') {
      return '';
    }
    var value = $elment.filter(':checked').map(function () {
      return this.value;
    }).get().join(separator);
    return value;
  }

  function viewport() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window)) {
      a = 'client';
      e = document.documentElement || document.body;
    }
    return { width: e[a + 'Width'], height: e[a + 'Height'] };
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
    hnmgbox.init();
  });

  return hnmgbox;

})(window, document, jQuery);


/**
 * jQuery alterClass plugin
 *
 * Remove element classes with wildcard matching. Optionally add classes:
 *   $( '#foo' ).alterClass( 'foo-* bar-*', 'foobar' )
 *
 * Copyright (c) 2011 Pete Boere (the-echoplex.net)
 * Free under terms of the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 */
(function ($) {
  $.fn.alterClass = function (removals, additions) {
    var self = this;
    if (removals.indexOf('*') === -1) {
      // Use native jQuery methods if there is no wildcard matching
      self.removeClass(removals);
      return !additions ? self : self.addClass(additions);
    }
    var patt = new RegExp('\\s' +
      removals.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') +
      '\\s', 'g');
    self.each(function (i, it) {
      var cn = ' ' + it.className + ' ';
      while (patt.test(cn)) {
        cn = cn.replace(patt, ' ');
      }
      it.className = $.trim(cn);
    });
    return !additions ? self : self.addClass(additions);
  };
})(jQuery);

;
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


