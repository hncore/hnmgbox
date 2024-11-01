/*!
 * HNMGBOX Confirm
 * Version: 1.0
 * Author: Max López
 */

;(function ( $, window, document, undefined ) {

  function Plugin( options ) {
    var _ = this;
    _.el = '';
    _.$el = undefined;
    _.$overlay = undefined;
    _.visible = false;
    _.defaults = {
      wrap_class: '',
      title: '',
      content: '',
      hide_cancel: false,
      hide_confirm: false,
      hide_close: false,
      cancel_text: '',
      confirm_text: '',
      cancel_class: '',
      confirm_class: 'hnmgbox-btn-blue',
      cancel_bg: '',
      confirm_bg: '',
      cancel_color: '',
      confirm_color: '',
      close_delay: -1,
      close_overlay: true,
      onOpen : null,
      onClose : null,
      onConfirm : null,
      onCancel : null,
    };
    _.options = $.extend( {}, _.defaults, options);

    _.init();

    $(window).on("resize", function () {
      if( _.visible ){
        _.center(true);
      }
    });
  }

  Plugin.prototype = {
    init : function () {
      var _ = this;
      _.build();
      _.ajax_content();
      _.open();
      _.events();
    },

    build: function(){
      var _ = this;
      var header = _.options.title === '' ? '' : '<div class="hnmgbox-confirm-header"><h3>' + _.options.title + '</h3></div>';
      var cancel_text = _.options.cancel_text || 'Cancel';
      var confirm_text = _.options.confirm_text || 'Accept';
      var confirm_btn = _.options.hide_confirm ? '' : '<button class="hnmgbox-confirm-btn hnmgbox-btn" type="button"><i class="hnmgbox-icon hnmgbox-icon-check"></i>' + confirm_text +'</button>';
      var cancel_btn = _.options.hide_cancel ? '' : '<button class="hnmgbox-cancel-btn hnmgbox-btn" type="button"><i class="hnmgbox-icon hnmgbox-icon-close"></i>' + cancel_text +'</button>';
      var close_btn = '<span class="hnmgbox-confirm-close-btn hnmgbox-icon hnmgbox-icon-times"></span>';
      var content = typeof _.options.content == 'object' ? '' : _.options.content;

      _.el =
        '<div class="hnmgbox hnmgbox-confirm ' + _.options.wrap_class +' ">' +
          '<div class="hnmgbox-confirm-inner">' +
            close_btn + header +
            '<div class="hnmgbox-confirm-content">' + content + '</div>' +
            '<div class="hnmgbox-confirm-footer">' +
              cancel_btn + confirm_btn +
            '</div>' +
          '</div>' +
        '</div>';

      $('body').append(_.el);
      $('body').append('<div class="hnmgbox-confirm-overlay"></div>');
      _.$el = $('body').find('.hnmgbox-confirm');
      _.$overlay = $('body').find('.hnmgbox-confirm-overlay');

      //Customization
      _.$el.find('.hnmgbox-cancel-btn').addClass(_.options.cancel_class);
      _.$el.find('.hnmgbox-confirm-btn').addClass(_.options.confirm_class);
      var cancel_css = {};
      var confirm_css = {};

      if( _.options.hide_close ){
        _.$el.find('.hnmgbox-confirm-close-btn').hide();
      }
      if( _.options.cancel_bg ){
        cancel_css.background = _.options.cancel_bg;
      }
      if( _.options.cancel_color ){
        cancel_css.color = _.options.cancel_color;
      }
      _.$el.find('.hnmgbox-cancel-btn').css(cancel_css);

      if( _.options.confirm_bg ){
        confirm_css.background = _.options.confirm_bg;
      }
      if( _.options.confirm_color ){
        confirm_css.color = _.options.confirm_color;
      }
      _.$el.find('.hnmgbox-confirm-btn').css(confirm_css);
    },

    ajax_content: function(){
      var _ = this;
      if( typeof _.options.content != 'object' ){
        return;
      }
      $.ajax({
        type: 'post',
        dataType: _.options.content.dataType,
        url: _.options.content.url,
        data: _.options.content.data,
        beforeSend: function(){
          _.$el.find('.hnmgbox-confirm-content').html("<i class='hnmgbox-icon hnmgbox-icon-spinner hnmgbox-icon-spin hnmgbox-confirm-loader'></i>");
        },
        success: function( response ) {
          if( typeof response != 'object' && _.options.content.dataType == 'html' ){
            _.$el.find('.hnmgbox-confirm-content').append(response);
            setTimeout(function(){ _.center(true); }, 800);
          }
          if ( $.isFunction( _.options.content.onSuccess ) ) {
            _.options.content.onSuccess.call(this, response);
          }
        },
        error: function( jqXHR, textStatus, errorThrown ){
          c('#### AJAX ERROR ####');
          c('jqXHR');c(jqXHR);c('errorThrown');c(errorThrown);
        },
        complete: function( jqXHR, textStatus ){
          setTimeout(function(){ _.center(true); }, 1200);
          _.$el.find('.hnmgbox-confirm-content > .hnmgbox-confirm-loader').remove();
        }
      });
    },

    open : function(){
      var _ = this;
      _.$overlay.fadeIn(400);
      _.$el.addClass('hnmgbox-confirm-open');
      _.visible = true;
      _.center();
      if ( $.isFunction( _.options.onOpen ) ) {
        _.options.onOpen.call(this);
      }
    },

    events : function(){
      var _ = this;
      if( _.options.close_overlay ){
        _.$overlay.on('click', function(event) {
          _.close(event, false);
          return false;
        });
      }
      _.$el.find('.hnmgbox-confirm-close-btn, .hnmgbox-cancel-btn, .hnmgbox-confirm-btn').on('click', function(event) {
        if( $(this).hasClass('hnmgbox-confirm-btn') ){
          _.close(event, true);
        } else {
          _.close(event, false);
        }
        return false;
      });
      if( _.options.close_delay > -1 ){
        setTimeout( function(){ _.close(event, false); }, _.options.close_delay );
      }
    },

    close : function(event, confirm){
      var _ = this;
      _.$el.addClass('hnmgbox-confirm-close');
      _.$el.one("webkitAnimationEnd oanimationend msAnimationEnd animationend", function(event) {
        if ( $.isFunction( _.options.onCancel ) && confirm === false ) {
          _.options.onCancel.call(this);
        }
        if ( $.isFunction( _.options.onConfirm ) && confirm ) {
          _.options.onConfirm.call(this);
        }
        if ( $.isFunction( _.options.onClose ) ) {
          _.options.onClose.call(this);
        }
        _.destroy();
      });
    },

    destroy : function(){
      var _ = this;
      _.$el.remove();
      _.$overlay.fadeOut(500).remove();
      _.visible = false;
    },

    center : function( animate ){
      animate = animate || false;
      var _ = this;
      var left = ( $(window).width() - _.$el.width() ) / 2;
      var top = ( $(window).height() - _.$el.height() ) / 2;
      var margin_top = 10;
      if( animate ){
        _.$el.stop().animate({
          'top' : (top - margin_top) + 'px',
          'margin-left' : -1*( _.$el.width() / 2 ),
        }, 300);
      } else {
        _.$el.css({
        'top' : (top - margin_top) + 'px',
        'margin-left' : -1*( _.$el.width() / 2 ),
        });
      }
    }
  };

  //Debug
  function c(msg){
    console.log(msg);
  }

  $.hnmgboxConfirm = function ( options ) {
    new Plugin( options );
  };

})( jQuery, window, document );