export function DragProvider () {
  //  ----------------------------------------
  //  provider
  //  ----------------------------------------
  var $injector, $rootScope = null, $timeout = null;

  //  ----------------------------------------
  //  properties
  //  ----------------------------------------
  this.data = {
    draggables: {},
    droppables: {}
  };

  //  ----------------------------------------
  //  event hooks
  //  ----------------------------------------
  let that = this
  this.mouseMoved = false;
  this.isMouseMoved = () => { return that.mouseMoved; }

  this.hooks = { down: {}, move: {}, up: {}};

  this.eventMouseMove = () => {};
  this.eventMouseUp = () => {};
  $(() => {
    $(document).on('mousedown', (e) => {
      that.mouseMoved = false;
      angular.forEach(that.hooks.down, (funct) => funct(e))
    });
    $(document).on('mousemove', (e) => {
      that.mouseMoved = true;
      angular.forEach(that.hooks.move, (funct) => funct(e))

    });
    $(document).on('mouseup', (e) => {
      angular.forEach(that.hooks.up, (funct) => funct(e))
    });
  });

  //  ----------------------------------------
  //  private methods
  //  ----------------------------------------
  this.currentId = 0;
  this.getNewId = () => { return String(that.currentId++);}

  this.setupEasing = () => {
    jQuery.extend(jQuery.easing, {
      easeOutQuad: (x, t, b, c, d) => {
        return -c * (t /= d) * (t - 2) + b;
      }
    });
  };

  this.setupProviders = (injector) => {
    // Setup providers
    $injector = injector;
    $rootScope = $injector.get('$rootScope');
    $timeout = $injector.get('$timeout');
  };

  this.isHover = ($elementA, $elementB) => {
    // Is element A hover on element B?
    // @param $elementA: jQuery object
    // @param $elementB: jQuery object

    let offsetA = $elementA.offset();
    let offsetB = $elementB.offset();
    let sizeA   = { width: $elementA.width(), height: $elementA.height()};
    let sizeB   = { width: $elementB.width(), height: $elementB.height()};
    let isHover = { x: false, y: false };
    isHover.x   = offsetA.left > offsetB.left && offsetA.left < offsetB.left + sizeB.width;
    isHover.x   = isHover.x || offsetA.left + sizeA.width > offsetB.left && offsetA.left + sizeA.width < offsetB.left + sizeB.width;
    if (!isHover)  return false;

    isHover.y = offsetA.top > offsetB.top && offsetA.top < offsetB.top + sizeB.height;
    isHover.y = isHover.y || offsetA.top + sizeA.height > offsetB.top && offsetA.top + sizeA.height < offsetB.top + sizeB.height;
    return isHover.x && isHover.y;
  };

  var delay = (ms, func) => {
    $timeout(function() {
      return func();
    }, ms);
  };

  this.autoScroll = {
    up: false,
    down: false,
    scrolling: false,
    scroll: () => {
      that.autoScroll.scrolling = true;
      if (that.autoScroll.up) {
        $('html, body').dequeue().animate({
          scrollTop: $(window).scrollTop() - 50
        }, 100, 'easeOutQuad');
        delay(100, () => {
          that.autoScroll.scroll();
        });
      } else if (that.autoScroll.down) {
        $('html, body').dequeue().animate({
          scrollTop: $(window).scrollTop() + 50
        }, 100, 'easeOutQuad');
        delay(100, () => {
          that.autoScroll.scroll();
        });
      } else {
        that.autoScroll.scrolling = false;
      }
    },
    start: (e) => {
      if (e.clientY < 50) {
        that.autoScroll.up = true;
        that.autoScroll.down = false;
        if (!that.autoScroll.scrolling) {
          that.autoScroll.scroll();
        }
      } else if (e.clientY > $(window).innerHeight() - 50) {
        that.autoScroll.up = false;
        that.autoScroll.down = true;
        if (!that.autoScroll.scrolling) {
          that.autoScroll.scroll();
        }
      } else {
        that.autoScroll.up = false;
        that.autoScroll.down = false;
      }
    },
    stop: () => {
        that.autoScroll.up = false;
        that.autoScroll.down = false;
      }
  };
  this.dragMirrorMode = ($element, defer = true, object) => {
      let result = {
        id: that.getNewId(),
        mode: 'mirror',
        maternal: $element[0],
        element: null,
        object: object
      };
      $element.on('mousedown', (e) => {
        e.preventDefault();
        let $clone = $element.clone();
        result.element = $clone[0];
        $clone.addClass("df-draggable form-horizontal prepare-dragging");
        that.hooks.move.drag = (e, defer) => {
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
          that.autoScroll.start(e);
          let results = [];
          angular.forEach(that.data.droppables, (droppable) => {
            if (that.isHover($clone, $(droppable.element))) {
              results.push(droppable.move(e, result));
            } else {
              results.push(droppable.out(e, result));
            }
          })
          return results;
        };
        that.hooks.up.drag = (e) => {
          angular.forEach(that.data.droppables, (droppable) => {
            droppable.up(e, that.isHover($clone, $(droppable.element)), result);
          })
          delete that.hooks.move.drag;
          delete that.hooks.up.drag;
          result.element = null;
          $clone.remove();
          that.autoScroll.stop();
        };
        $('body').append($clone);
        if (!defer) that.hooks.move.drag(e, defer);
      });
      return result;
    };

  this.dragDragMode = ($element, defer = true, object) => {
      let result = {
        id: that.getNewId(),
        mode: 'drag',
        maternal: null,
        element: $element[0],
        object: object
      };
      $element.addClass('df-draggable');
      $element.on('mousedown', (e) => {
        e.preventDefault();
        if ($element.hasClass('dragging')) return;
        $element.addClass('prepare-dragging');
        that.hooks.move.drag = (e, defer) => {

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
          that.autoScroll.start(e);
          angular.forEach(that.data.droppables, (droppable) => {
            if (that.isHover($element, $(droppable.element))) {
              droppable.move(e, result);
            } else {
              droppable.out(e, result);
            }
          })
        };
        that.hooks.up.drag = (e) => {
          angular.forEach(that.data.droppables, (droppable) => {
            droppable.up(e, that.isHover($element, $(droppable.element)), result);
          })
          delete that.hooks.move.drag;
          delete that.hooks.up.drag;
          $element.css({width: '', height: '', left: '', top: ''});
          $element.removeClass('dragging defer-dragging');
          that.autoScroll.stop();
        };
        if (!defer) that.hooks.move.drag(e, defer);
      });
      return result;
    };

  this.dropMode = ($element, options) => {
    return {
      id: that.getNewId(),
      element: $element[0],
      move: (e, draggable) => {
        $rootScope.$apply(function() {
          angular.isFunction(options.move) ? options.move(e, draggable) : void 0;
        });
      },
      up: (e, isHover, draggable) => {
        $rootScope.$apply(() => {
          angular.isFunction(options.up) ? options.up(e, isHover, draggable) : void 0;
        });
      },
      out: (e, draggable) => {
        $rootScope.$apply(() => {
          angular.isFunction(options.out) ? options.out(e, draggable) : void 0;
        });
      }
    };
  };

  this.draggable = ($element, options = {}) => {
      var draggable, element, i, j, len, len1, result;
      // Make the element could be drag.
      // @param element: The jQuery element.
      // @param options: Options
      //     mode: 'drag' [default], 'mirror'
      //     defer: yes/no. defer dragging
      //     object: custom information

      result = [];
      if (options.mode == 'mirror') {
        for (i = 0, len = $element.length; i < len; i++) {
          element = $element[i];
          draggable = that.dragMirrorMode($(element), options.defer, options.object);
          result.push(draggable.id);
          that.data.draggables[draggable.id] = draggable;
        }
      } else {
        for (j = 0, len1 = $element.length; j < len1; j++) {
          element = $element[j];
          draggable = that.dragDragMode($(element), options.defer, options.object);
          result.push(draggable.id);
          that.data.draggables[draggable.id] = draggable;
        }
      }
      return result;
    };

  this.droppable = ($element, options = {}) => {
      var droppable, element, i, len, result;

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
        droppable = that.dropMode($(element), options);
        result.push(droppable);
        that.data.droppables[droppable.id] = droppable;
      }
      return result;
    };

  this.get = ($injector) => {
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
}
