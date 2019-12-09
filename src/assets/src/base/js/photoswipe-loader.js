initPhotoSwipeFromDOM = function(gallerySelector, param) {
  if (document.ps === undefined) document.ps = {};

  var parseThumbnailElements = function(el) {
    var thumbElements = el.parentNode.getElementsByTagName('figure'),
      numNodes = thumbElements.length,
      items = [],
      figureEl,
      linkEl,
      size,
      item;

    for (var i = 0; i < numNodes; i++) {
      figureEl = thumbElements[i];

      if (figureEl.nodeType !== 1) {
        continue;
      }

      linkEl = figureEl.children[0]; // <a> element
      size = linkEl.getAttribute('data-size').split('x');
      //video change
      /*item = {
          src: linkEl.getAttribute('href'),
          w: parseInt(size[0], 10),
          h: parseInt(size[1], 10)
      };*/
      if ($(linkEl).data('type') == 'video') {
        item = {
          html: $(linkEl).data('video')
        };
      } else {
        item = {
          src: linkEl.getAttribute('href'),
          w: parseInt(size[0], 10),
          h: parseInt(size[1], 10)
        };
      }
      //end video change

      if (figureEl.children.length > 1) {
        item.title = figureEl.children[1].innerHTML;
      }

      if (linkEl.children.length > 0) {
        item.msrc = linkEl.children[0].getAttribute('src');
      }

      item.el = figureEl; // save link to element for getThumbBoundsFn
      items.push(item);
    }
    return items;
  };
  //END parseThumbnailElements

  var closest = function closest(el, fn) {
    return el && (fn(el) ? el : closest(el.parentNode, fn));
  };

  var onThumbnailsClick = function(e) {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    var eTarget = e.target || e.srcElement;
    var clickedListItem = closest(eTarget, function(el) {
      return el.tagName && el.tagName.toUpperCase() === 'FIGURE';
    });
    if (!clickedListItem) {
      return;
    }
    var clickedGallery = clickedListItem.parentNode;

    index = parseInt(clickedListItem.getAttribute('data-index')) - 1;
    if (index >= 0) {
      // open PhotoSwipe if valid index found
      openPhotoSwipe(index, clickedGallery);
    }
    return false;
  };
  // END onThumbnailsClick

  var photoswipeParseHash = function() {
    var hash = window.location.hash.substring(1),
      params = {};

    if (hash.length < 5) {
      return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue;
      }
      var pair = vars[i].split('=');
      if (pair.length < 2) {
        continue;
      }
      params[pair[0]] = pair[1];
    }
    if (params.gid) {
      params.gid = parseInt(params.gid, 10);
    }
    return params;
  };
  //end photoswipeParseHash
  var openPhotoSwipe = function(
    index,
    galleryElement,
    disableAnimation,
    fromURL
  ) {
    var pswpElement = document.querySelectorAll('.pswp')[0],
      gallery,
      options,
      items;

    items = parseThumbnailElements(galleryElement);
    options = {
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),

      getThumbBoundsFn: function(index) {
        // See Options -> getThumbBoundsFn section of documentation for more info
        var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
          pageYScroll =
            window.pageYOffset || document.documentElement.scrollTop,
          rect = thumbnail.getBoundingClientRect();

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
      }
    };

    // PhotoSwipe opened from URL
    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (var j = 0; j < items.length; j++) {
          if (items[j].pid == index) {
            options.index = j;
            break;
          }
        }
      } else {
        options.index = parseInt(index, 10) - 1;
      }
    } else {
      options.index = parseInt(index, 10);
    }
    if (isNaN(options.index)) {
      return;
    }
    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }
    gallery = new PhotoSwipe(
      pswpElement,
      PhotoSwipeUI_Default,
      items,
      Object.assign({}, options, (param && param.options) || {})
    );
    if (param && param.id) document.ps[param.id] = gallery;

    gallery.init();
    //video edit
    gallery.listen('beforeChange', function() {
      var currItem = $(gallery.currItem.container);
      $('.pswp__video').removeClass('active');
      var currItemIframe = currItem.find('.pswp__video').addClass('active');
      $('.pswp__video').each(function() {
        if (!$(this).hasClass('active')) {
          VPlayer.__stop();
        }
      });
    });

    gallery.listen('close', function() {
      $('.pswp__video').each(function() {
        console.log(VPlayer.__stop);
        VPlayer.__stop();
      });
    });
    try {
      manageVideos(gallery);
    } catch (err) {
      console.error(err);
    }
  };
  //END openPhotoSwipe

  var galleryElements = document.querySelectorAll(gallerySelector);
  for (var i = 0, l = galleryElements.length; i < l; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i + 1);
    galleryElements[i].onclick = onThumbnailsClick;
  }
  var hashData = photoswipeParseHash();
  if (hashData.pid && hashData.gid) {
    openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
  }
};

function manageVideos(gallery) {
  //posteriormente colocar em promises
  VPlayer = new Object();
  VPlayer.__getCurrent = function() {};
  VPlayer.__play = function() {};
  VPlayer.__pause = function() {};
  VPlayer.__stop = function() {};

  let obj = $(gallery.currItem.html)
    .find('.pswp__video')
    .first();
  if (obj.length) {
    let vsource = obj.attr('data-source');
    if (vsource == 'youtube') {
      console.log(obj.attr('id'));
      let _ytp = new YT.Player(obj.attr('id'), {
        events: {
          onReady: function(_t) {
            console.log('dentro do ready');
            VPlayer = _t.target;
            VPlayer.__getCurrent = _t.target.getCurrentTime;
            VPlayer.__play = _t.target.playVideo;
            VPlayer.__pause = _t.target.pauseVideo;
            VPlayer.__stop = _t.target.stopVideo;
            let goto = parseInt(
              moment.duration(obj.attr('data-start-at')).asSeconds()
            );
            _t.target.seekTo(goto);
            //_t.target.playVideo();
          },
          onStateChange: function(_t) {
            console.log('dentro do change');
          }
        }
      });
    }
    if (vsource == 'facebook') {
      try {
        FB.api(
          '/' +
            obj.attr('id') +
            '?fields=thumbnails,description,length,embed_html,format,title&access_token=' +
            IntranetOne.conf.social_media.facebook.long_token,
          function(ret) {
            FB.XFBML.parse(document.getElementById(obj.attr('id')).parentNode);
            FB.Event.subscribe('xfbml.ready', function(msg) {
              if (msg.type === 'video') {
                VPlayer = msg.instance;
                VPlayer.__getCurrent = msg.instance.getCurrentPosition;
                VPlayer.__play = msg.instance.play;
                VPlayer.__pause = msg.instance.pause;
                VPlayer.__stop = msg.instance.pause; //não tem stop
                msg.instance.play();
                let goto = parseInt(
                  moment.duration(obj.attr('data-start-at')).asSeconds()
                );
                msg.instance.subscribe('startedPlaying', function(e) {
                  msg.instance.seek(goto);
                });
              }
            });
          }
        );
      } catch (err) {
        console.error('API do facebook não encontrada!');
        throw 'Não foi possível inicializar o VPlayer';
      }
    }
  }
}

function onYouTubePlayerAPIReady() {}
