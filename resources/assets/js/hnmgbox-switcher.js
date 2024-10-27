/*!
 * HNMGBOX Switcher
 * Version: 1.0
 * Author: Max López
 * Copyright © 2018 Max Arthur López Pérez - All Rights Reserved.
 */

;(function ($, window, document, undefined) {

    function Plugin(element, options) {
        var _ = this;
        _.el = element;
        _.$el = $(element);
        _.defaults = {
            on_text: '',
            off_text: '',
            on_value: 'on',
            off_value: 'off',
            readonly: false,
        };
        _.metadata = _.$el.data('switcher') || {};
        _.options = $.extend({}, _.defaults, options, _.metadata);
        _.$el.data('switcher', _.options);
        _.init();
    }

    Plugin.prototype = {
        init: function () {
            var _ = this;
            if (_.$el.parent().hasClass('hnmgbox-sw-wrap')) {
                return;
            }
            if (_.$el.attr('type') == 'hidden' || _.$el.attr('type') == 'checkbox') {
                _.build();
            }

        },

        build: function () {
            var _ = this;
            var $input = _.$el;
            var has_icons = false;
            var html_toggle_on = '<div class="hnmgbox-sw-toggle hnmgbox-sw-toggle-on">';
            var html_toggle_off = '<div class="hnmgbox-sw-toggle hnmgbox-sw-toggle-off">';
            if (_.options.on_text !== '' && _.options.off_text !== '') {
                html_toggle_on = html_toggle_on + _.options.on_text + '</div>';
                html_toggle_off = html_toggle_off + _.options.off_text + '</div>';
            } else {
                has_icons = true;
                html_toggle_on = html_toggle_on + '<i class="icon-sw-on"></i></div>';
                html_toggle_off = html_toggle_off + '<i class="icon-sw-off"></i></div>';
            }

            var is_disabled = $input.is(':disabled') ? true : false;

            var status_classes = '';
            status_classes += _.is_on() ? 'hnmgbox-sw-on' : 'hnmgbox-sw-off';
            status_classes += is_disabled ? ' hnmgbox-sw-disabled' : '';
            status_classes += has_icons ? ' hnmgbox-sw-has-icons' : '';

            var switcher_body =
                '<div class="hnmgbox-sw-inner ' + status_classes + '">' +
                '<div class="hnmgbox-sw-blob"></div>' +
                html_toggle_on + html_toggle_off +
                '</div>';

            $input.wrap('<div class="hnmgbox-sw-wrap"></div>');
            $input.parent().append(switcher_body);
            $input.parent().find('.hnmgbox-sw-inner').addClass('hnmgbox-sw-type-' + $input.attr('type'));
        },

        is_on: function () {
            if (this.$el.next('.hnmgbox-sw-inner').hasClass('hnmgbox-sw-on')) {
                return true;
            }
            if (this.$el.attr('type') == 'checkbox') {
                return this.$el.is(':checked');
            } else {
                if (this.$el.val() == this.options.on_value) {
                    return true;
                }
            }
            return false;
        },

        set_on: function () {
            var $input = $(this);
            if (!$input.parent().hasClass('hnmgbox-sw-wrap')) {
                return;
            }
            var options = $input.data('switcher');

            if ($input.attr('type') == 'checkbox') {
                $input.prop('checked', true).attr('checked', 'checked');
            } else {
                $input.val(options.on_value);
            }

            $input.parent().find('.hnmgbox-sw-inner').removeClass('hnmgbox-sw-off').addClass('hnmgbox-sw-on');

            //Eventos
            $input.trigger('changeOn');
            $input.trigger('statusChange');

            return true;
        },

        set_off: function () {
            var $input = $(this);
            if (!$input.parent().hasClass('hnmgbox-sw-wrap')) {
                return;
            }
            var options = $input.data('switcher');

            if ($input.attr('type') == 'checkbox') {
                $input.prop('checked', false).removeAttr('checked');
            } else {
                $input.val(options.off_value);
            }

            $input.parent().find('.hnmgbox-sw-inner').removeClass('hnmgbox-sw-on').addClass('hnmgbox-sw-off');

            //Eventos
            $input.trigger('changeOff');
            $input.trigger('statusChange');

            return true;
        },

        destroy: function () {
            $(this).each(function () {
                $(this).parents('.hnmgbox-sw-wrap').children().not('input').remove();
                $(this).unwrap();
            });
            return true;
        }
    };

    //Eventos
    $(document).ready(function () {
        $(document).on('click tap', '.hnmgbox .hnmgbox-sw-inner:not(.hnmgbox-sw-disabled)', function (e) {
            var $input = $(this).parent().find('input');
            if ($(this).hasClass('hnmgbox-sw-on')) {
                $input.hnmgboxSwitcher('set_off');
            } else {
                $input.hnmgboxSwitcher('set_on');
            }
        });

        $(document).on('change', '.hnmgbox .hnmgbox-sw-wrap input', function (e) {
            if ($(this).next('.hnmgbox-sw-inner').hasClass('hnmgbox-sw-on')) {
                $(this).hnmgboxSwitcher('set_off');
            } else {
                $(this).hnmgboxSwitcher('set_on');
            }
        });
    });

    $.fn.hnmgboxSwitcher = function (options) {
        if (Plugin.prototype[options] && options != 'init' && options != 'build' && options != 'is_on') {
            return Plugin.prototype[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) {
            return this.each(function () {
                new Plugin(this, options);
            });
        } else {
            //nothing
        }
    };

    function c(msg) {
        console.log(msg);
    }

    function cc(msg, msg2) {
        console.log(msg, msg2);
    }

})(jQuery, window, document);
