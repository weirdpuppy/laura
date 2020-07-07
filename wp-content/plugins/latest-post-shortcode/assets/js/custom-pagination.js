(function ($) {
  window.LPS_check_ajax_pagination = {
    config: {
      scroll: 0,
    },
    init: function () {
      LPS_check_ajax_pagination.initEvents();
      this.config.scroll = $(window).scrollTop();
    },

    initEvents: function () {
      LPS_check_ajax_pagination.sectionsSetup();
      LPS_check_ajax_pagination.hookupScroll();
    },

    sectionsSetup: function () {
      var $sections = $('.lps-top-section-wrap');
      $sections.each(function () {
        var $current = $(this);
        var $maybe_ajax = $current.find('.ajax_pagination').first();
        if (typeof $maybe_ajax === 'object' && $maybe_ajax.length ) {
          var $a = $current.find('ul.latest-post-selection.pages li>a');
          var $pagination = $current.find('ul.latest-post-selection').first();
          $a.unbind('click');
          $a.on('click', function (e) {
            e.preventDefault();
            LPS_check_ajax_pagination.lpsNavigate(
              $current,
              $(this).data('page'),
              $current.data('args'),
              $current.data('current'),
              $pagination
            );
          });
        }
      });
    },

    lpsNavigate: function ($parent, page, args, current, $pagination) {
      $parent.addClass('loading-spinner');
      $.ajax({
        type: "POST",
        url: LPS.ajaxurl,
        data: {
          action: 'lps_navigate_to_page',
          page: page,
          args: args,
          current: current,
          lps_ajax: 1,
        },
        cache: false,
      }).done(function (response) {
        if (response) {
          if ($pagination.length ) {
            if ($pagination.hasClass('lps-load-more-scroll') ) {
              $parent.find('.lps-load-more-scroll').remove();
            }
            if ($pagination.hasClass('lps-load-more') || $pagination.hasClass('lps-load-more-scroll') ) {
              $pagination.remove();
              $parent.append(response);
            } else {
              $parent.html(response);
            }
          } else {
            $parent.html(response);
          }
        } else {
          $parent.find('.lps-load-more,.lps-load-more-scroll').remove();
        }
        LPS_check_ajax_pagination.init();
        $parent.removeClass('loading-spinner');
        $(document.body).trigger('post-load');
      });
    },

    hookupScroll: function() {
      var $elems = $('.lps-pagination-wrap.lps-load-more-scroll');
      if (typeof $elems == 'undefined' || ! $elems.length) {
          // Fail-fast, no scroll element to monitor.
          return;
      }
      if(window.attachEvent) {
        window.attachEvent('onscroll', function() {
          LPS_check_ajax_pagination.onScroll($elems);
        });
      } else if (window.addEventListener) {
        window.addEventListener('scroll', function() {
          LPS_check_ajax_pagination.onScroll($elems);
        });
      } else {
        // The browser does not support Javascript event binding.
        console.log('The browser does not support Javascript event binding.');
      }
    },

    onScroll: function($elems) {
      if (typeof $elems == 'undefined' || ! $elems.length) {
        return;
      }
      setTimeout(function() {
        var prevscroll = LPS_check_ajax_pagination.config.scroll;
        if ( prevscroll <= $(window).scrollTop() ) {
          LPS_check_ajax_pagination.assessItemsInView($elems);
          LPS_check_ajax_pagination.config.scroll = $(window).scrollTop();
        }
      }, 500);
    },

    isItemIntoView: function($elem) {
      if (typeof $elem == 'undefined' || ! $elem.length) {
        return false;
      }
      var docViewTop = $(window).scrollTop();
      var docViewBottom = docViewTop + $(window).height();
      var elemTop = $elem.offset().top;
      var elemBottom = elemTop + $elem.height();
      return (docViewBottom >= elemBottom && docViewTop <= elemBottom);
    },

    assessItemsInView: function($elems) {
      if (typeof $elems == 'undefined' || ! $elems.length) {
        return;
      }
      $elems.each(function(index,elem) {
        var inview = false;
        if (typeof elem !== 'undefined') {
          inview = LPS_check_ajax_pagination.isItemIntoView($(this));
          if (true === inview) {
            var $section = $(this).parents('.lps-top-section-wrap').first();
            if ($section && ! $section.hasClass('loading-spinner')) {
              var $a = $section.find('ul.latest-post-selection.pages li>a');
              if ($a.length) {
                $a.trigger('click');
              }
            }
          }
        }
      });
    },
  };

  $(document).ready(function () {
    LPS_check_ajax_pagination.init();
  });

})(jQuery);
