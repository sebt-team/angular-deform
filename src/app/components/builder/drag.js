angular.module('angularDeforms.drag', []).provider('$drag', function() {
  var $injector, $rootScope, delay;
  $injector = null;
  $rootScope = null;
  this.data = {
    draggables: {},
    droppables: {}
  };
  this.mouseMoved = false;
  this.isMouseMoved = (function(_this) {
    return function() {
      return _this.mouseMoved;
    };
  })(this);
  this.hooks = {
    down: {},
    move: {},
    up: {}
  };
  this.eventMouseMove = function() {};
  this.eventMouseUp = function() {};
  $((function(_this) {
    return function() {
      $(document).on('mousedown', function(e) {
        var func, key, ref;
        _this.mouseMoved = false;
        ref = _this.hooks.down;
        for (key in ref) {
          func = ref[key];
          func(e);
        }
      });
      $(document).on('mousemove', function(e) {
        var func, key, ref;
        _this.mouseMoved = true;
        ref = _this.hooks.move;
        for (key in ref) {
          func = ref[key];
          func(e);
        }
      });
      return $(document).on('mouseup', function(e) {
        var func, key, ref;
        ref = _this.hooks.up;
        for (key in ref) {
          func = ref[key];
          func(e);
        }
      });
    };
  })(this));
  this.currentId = 0;
  this.getNewId = (function(_this) {
    return function() {
      return "" + (_this.currentId++);
    };
  })(this);
  this.setupEasing = function() {
    return jQuery.extend(jQuery.easing, {
      easeOutQuad: function(x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
      }
    });
  };
  this.setupProviders = function(injector) {

    /*
    Setup providers.
     */
    $injector = injector;
    return $rootScope = $injector.get('$rootScope');
  };
  this.isHover = (function(_this) {
    return function($elementA, $elementB) {

      /*
      Is element A hover on element B?
      @param $elementA: jQuery object
      @param $elementB: jQuery object
       */
      var isHover, offsetA, offsetB, sizeA, sizeB;
      offsetA = $elementA.offset();
      offsetB = $elementB.offset();
      sizeA = {
        width: $elementA.width(),
        height: $elementA.height()
      };
      sizeB = {
        width: $elementB.width(),
        height: $elementB.height()
      };
      isHover = {
        x: false,
        y: false
      };
      isHover.x = offsetA.left > offsetB.left && offsetA.left < offsetB.left + sizeB.width;
      isHover.x = isHover.x || offsetA.left + sizeA.width > offsetB.left && offsetA.left + sizeA.width < offsetB.left + sizeB.width;
      if (!isHover) {
        return false;
      }
      isHover.y = offsetA.top > offsetB.top && offsetA.top < offsetB.top + sizeB.height;
      isHover.y = isHover.y || offsetA.top + sizeA.height > offsetB.top && offsetA.top + sizeA.height < offsetB.top + sizeB.height;
      return isHover.x && isHover.y;
    };
  })(this);
  delay = function(ms, func) {
    return setTimeout(function() {
      return func();
    }, ms);
  };
  this.autoScroll = {
    up: false,
    down: false,
    scrolling: false,
    scroll: (function(_this) {
      return function() {
        _this.autoScroll.scrolling = true;
        if (_this.autoScroll.up) {
          $('html, body').dequeue().animate({
            scrollTop: $(window).scrollTop() - 50
          }, 100, 'easeOutQuad');
          return delay(100, function() {
            return _this.autoScroll.scroll();
          });
        } else if (_this.autoScroll.down) {
          $('html, body').dequeue().animate({
            scrollTop: $(window).scrollTop() + 50
          }, 100, 'easeOutQuad');
          return delay(100, function() {
            return _this.autoScroll.scroll();
          });
        } else {
          return _this.autoScroll.scrolling = false;
        }
      };
    })(this),
    start: (function(_this) {
      return function(e) {
        if (e.clientY < 50) {
          _this.autoScroll.up = true;
          _this.autoScroll.down = false;
          if (!_this.autoScroll.scrolling) {
            return _this.autoScroll.scroll();
          }
        } else if (e.clientY > $(window).innerHeight() - 50) {
          _this.autoScroll.up = false;
          _this.autoScroll.down = true;
          if (!_this.autoScroll.scrolling) {
            return _this.autoScroll.scroll();
          }
        } else {
          _this.autoScroll.up = false;
          return _this.autoScroll.down = false;
        }
      };
    })(this),
    stop: (function(_this) {
      return function() {
        _this.autoScroll.up = false;
        return _this.autoScroll.down = false;
      };
    })(this)
  };
  this.dragMirrorMode = (function(_this) {
    return function($element, defer, object) {
      var result;
      if (defer == null) {
        defer = true;
      }
      result = {
        id: _this.getNewId(),
        mode: 'mirror',
        maternal: $element[0],
        element: null,
        object: object
      };
      $element.on('mousedown', function(e) {
        var $clone;
        e.preventDefault();
        $clone = $element.clone();
        result.element = $clone[0];
        $clone.addClass("fb-draggable form-horizontal prepare-dragging");
        _this.hooks.move.drag = function(e, defer) {
          var droppable, id, ref, results;
          if ($clone.hasClass('prepare-dragging')) {
            $clone.css({
              width: $element.width(),
              height: $element.height()
            });
            $clone.removeClass('prepare-dragging');
            $clone.addClass('dragging');
            if (defer) {
              return;
            }
          }
          $clone.offset({
            left: e.pageX - $clone.width() / 2,
            top: e.pageY - $clone.height() / 2
          });
          _this.autoScroll.start(e);
          ref = _this.data.droppables;
          results = [];
          for (id in ref) {
            droppable = ref[id];
            if (_this.isHover($clone, $(droppable.element))) {
              results.push(droppable.move(e, result));
            } else {
              results.push(droppable.out(e, result));
            }
          }
          return results;
        };
        _this.hooks.up.drag = function(e) {
          var droppable, id, isHover, ref;
          ref = _this.data.droppables;
          for (id in ref) {
            droppable = ref[id];
            isHover = _this.isHover($clone, $(droppable.element));
            droppable.up(e, isHover, result);
          }
          delete _this.hooks.move.drag;
          delete _this.hooks.up.drag;
          result.element = null;
          $clone.remove();
          return _this.autoScroll.stop();
        };
        $('body').append($clone);
        if (!defer) {
          return _this.hooks.move.drag(e, defer);
        }
      });
      return result;
    };
  })(this);
  this.dragDragMode = (function(_this) {
    return function($element, defer, object) {
      var result;
      if (defer == null) {
        defer = true;
      }
      result = {
        id: _this.getNewId(),
        mode: 'drag',
        maternal: null,
        element: $element[0],
        object: object
      };
      $element.addClass('fb-draggable');
      $element.on('mousedown', function(e) {
        e.preventDefault();
        if ($element.hasClass('dragging')) {
          return;
        }
        $element.addClass('prepare-dragging');
        _this.hooks.move.drag = function(e, defer) {
          var droppable, id, ref;
          if ($element.hasClass('prepare-dragging')) {
            $element.css({
              width: $element.width(),
              height: $element.height()
            });
            $element.removeClass('prepare-dragging');
            $element.addClass('dragging');
            if (defer) {
              return;
            }
          }
          $element.offset({
            left: e.pageX - $element.width() / 2,
            top: e.pageY - $element.height() / 2
          });
          _this.autoScroll.start(e);
          ref = _this.data.droppables;
          for (id in ref) {
            droppable = ref[id];
            if (_this.isHover($element, $(droppable.element))) {
              droppable.move(e, result);
            } else {
              droppable.out(e, result);
            }
          }
        };
        _this.hooks.up.drag = function(e) {
          var droppable, id, isHover, ref;
          ref = _this.data.droppables;
          for (id in ref) {
            droppable = ref[id];
            isHover = _this.isHover($element, $(droppable.element));
            droppable.up(e, isHover, result);
          }
          delete _this.hooks.move.drag;
          delete _this.hooks.up.drag;
          $element.css({
            width: '',
            height: '',
            left: '',
            top: ''
          });
          $element.removeClass('dragging defer-dragging');
          return _this.autoScroll.stop();
        };
        if (!defer) {
          return _this.hooks.move.drag(e, defer);
        }
      });
      return result;
    };
  })(this);
  this.dropMode = (function(_this) {
    return function($element, options) {
      var result;
      result = {
        id: _this.getNewId(),
        element: $element[0],
        move: function(e, draggable) {
          return $rootScope.$apply(function() {
            return typeof options.move === "function" ? options.move(e, draggable) : void 0;
          });
        },
        up: function(e, isHover, draggable) {
          return $rootScope.$apply(function() {
            return typeof options.up === "function" ? options.up(e, isHover, draggable) : void 0;
          });
        },
        out: function(e, draggable) {
          return $rootScope.$apply(function() {
            return typeof options.out === "function" ? options.out(e, draggable) : void 0;
          });
        }
      };
      return result;
    };
  })(this);
  this.draggable = (function(_this) {
    return function($element, options) {
      var draggable, element, i, j, len, len1, result;
      if (options == null) {
        options = {};
      }

      /*
      Make the element could be drag.
      @param element: The jQuery element.
      @param options: Options
          mode: 'drag' [default], 'mirror'
          defer: yes/no. defer dragging
          object: custom information
       */
      result = [];
      if (options.mode === 'mirror') {
        for (i = 0, len = $element.length; i < len; i++) {
          element = $element[i];
          draggable = _this.dragMirrorMode($(element), options.defer, options.object);
          result.push(draggable.id);
          _this.data.draggables[draggable.id] = draggable;
        }
      } else {
        for (j = 0, len1 = $element.length; j < len1; j++) {
          element = $element[j];
          draggable = _this.dragDragMode($(element), options.defer, options.object);
          result.push(draggable.id);
          _this.data.draggables[draggable.id] = draggable;
        }
      }
      return result;
    };
  })(this);
  this.droppable = (function(_this) {
    return function($element, options) {
      var droppable, element, i, len, result;
      if (options == null) {
        options = {};
      }

      /*
      Make the element coulde be drop.
      @param $element: The jQuery element.
      @param options: The droppable options.
          move: The custom mouse move callback. (e, draggable)->
          up: The custom mouse up callback. (e, isHover, draggable)->
          out: The custom mouse out callback. (e, draggable)->
       */
      result = [];
      for (i = 0, len = $element.length; i < len; i++) {
        element = $element[i];
        droppable = _this.dropMode($(element), options);
        result.push(droppable);
        _this.data.droppables[droppable.id] = droppable;
      }
      return result;
    };
  })(this);
  this.get = function($injector) {
    this.setupEasing();
    this.setupProviders($injector);
    return {
      isMouseMoved: this.isMouseMoved,
      data: this.data,
      draggable: this.draggable,
      droppable: this.droppable
    };
  };
  this.get.$inject = ['$injector'];
  this.$get = this.get;
});

// ---
// generated by coffee-script 1.9.2