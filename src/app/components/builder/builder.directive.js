export function FbBuilder ($injector) {
  // ----------------------------------------
  // providers
  // ----------------------------------------
  var $builder = $injector.get('$builder');
  var $drag = $injector.get('$drag');

  // ----------------------------------------
  // directive
  // ----------------------------------------
  let directive = {
    restrict: 'A',
    scope: {
      fbBuilder: '='
    },
    template: "<div class='form-horizontal'>\
              | <div class='fb-form-object-editable' \
              |   ng-repeat='object in formObjects' \
              |   fb-form-object-editable='object'>\
              | </div>\
              |</div>",

    link: (scope, element, attrs) => {
      // ----------------------------------------
      // valuables
      // ----------------------------------------
      scope.formName = attrs.fbBuilder;
      scope.formObjects = $builder.forms[scope.formName];

      var beginMove = true;

      $(element).addClass('fb-builder');
      $drag.droppable($(element), {
        move: (e) => {

          if(beginMove) {
            $("div.fb-form-object-editable").popover('hide');
            beginMove = false;
          }

          let $formObjects = $(element).find('.fb-form-object-editable:not(.empty,.dragging)');
          if ($formObjects.length === 0) {
            if ($(element).find('.fb-form-object-editable.empty').length === 0) {
              $(element).find('>div:first').append($("<div class='fb-form-object-editable empty'></div>"));
            }
            return;
          }

          let positions = [];
          positions.push(-1000);

          Array.from($formObjects).forEach(formObject => {
            let $formObject = $(formObject);
            let offset = $formObject.offset();
            let height = $formObject.height();
            positions.push(offset.top + height / 2);
          });

          positions.push(positions[positions.length - 1] + 1000);

          for (var i = 0; i < positions.length; i++) {
            if (e.pageY > positions[i] && e.pageY <= positions[i + 1]) {
              $(element).find('.empty').remove();
              let $empty = $("<div class='fb-form-object-editable empty'></div>");
              if (i < $formObjects.length) {
                $empty.insertBefore($($formObjects[i]));
              } else {
                $empty.insertAfter($($formObjects[i - 1]));
              }
              break;
            }
          }
        },
        out: () => {
          if (beginMove) {
            $("div.fb-form-object-editable").popover('hide');
            beginMove = false;
          }
          $(element).find('.empty').remove();
        },
        up: (e, isHover, draggable) => {
          beginMove = true;

          if (!$drag.isMouseMoved()) {
            $(element).find('.empty').remove();
          }

          if (!isHover && draggable.mode === 'drag') {
            let formObject = draggable.object.formObject;
            if (formObject.editable)
              $builder.removeFormObject(attrs.fbBuilder, formObject.index);
          } else if (isHover) {
            if (draggable.mode === 'mirror') {
              $builder.insertFormObject(scope.formName, $(element).find('.empty').index('.fb-form-object-editable'), {
                component: draggable.object.componentName
              });
            }
            if (draggable.mode === 'drag') {
              let oldIndex = draggable.object.formObject.index;
              let newIndex = $(element).find('.empty').index('.fb-form-object-editable');
              if (oldIndex < newIndex) {
                newIndex--;
              }
              $builder.updateFormObjectIndex(scope.formName, oldIndex, newIndex);
            }
          }
          $(element).find('.empty').remove();
        }
      });
    }
  };

  return directive;
}

export function FbFormObjectEditable($injector) {
  var $builder, $compile, $drag, $validator;
  $builder = $injector.get('$builder');
  $drag = $injector.get('$drag');
  $compile = $injector.get('$compile');
  $validator = $injector.get('$validator');
  return {
    restrict: 'A',
    controller: 'fbFormObjectEditableController',
    scope: {
      formObject: '=fbFormObjectEditable'
    },
    link: function(scope, element) {
      var popover;
      scope.inputArray = [];
      scope.$component = $builder.components[scope.formObject.component];
      // debugger
      scope.setupScope(scope.formObject);
      scope.$watch('$component.template', function(template) {
        var view;
        if (!template) {
          return;
        }
        view = $compile(template)(scope);
        return $(element).html(view);
      });
      $(element).on('click', function() {
        return false;
      });
      $drag.draggable($(element), {
        object: {
          formObject: scope.formObject
        }
      });
      if (!scope.formObject.editable) {
        return;
      }
      popover = {};
      scope.$watch('$component.popoverTemplate', function(template) {
        if (!template) {
          return;
        }
        $(element).removeClass(popover.id);
        popover = {
          id: "fb-" + (Math.random().toString().substr(2)),
          isClickedSave: false,
          view: null,
          html: template
        };
        popover.html = $(popover.html).addClass(popover.id);
        popover.view = $compile(popover.html)(scope);
        $(element).addClass(popover.id);
        $(element).popover({
          html: true,
          title: scope.$component.label,
          content: popover.view,
          container: 'body',
          placement: $builder.config.popoverPlacement
        });
      });
      scope.popover = {
        save: function($event) {

          /*
          The save event of the popover.
          */
          $event.preventDefault();
          $validator.validate(scope).success(function() {
            popover.isClickedSave = true;
            $(element).popover('hide');
          });
        },
        remove: function($event) {

          /*
          The delete event of the popover.
          */
          $event.preventDefault();
          $builder.removeFormObject(scope.$parent.formName, scope.$parent.$index);
          $(element).popover('hide');
        },
        shown: function() {

          /*
          The shown event of the popover.
          */
          scope.data.backup();
          popover.isClickedSave = false;
        },
        cancel: function($event) {

          /*
          The cancel event of the popover.
          */
          scope.data.rollback();
          if ($event) {
            $event.preventDefault();
            $(element).popover('hide');
          }
        }
      };
      $(element).on('show.bs.popover', function() {
        var $popover, elementOrigin, popoverTop;
        if ($drag.isMouseMoved()) {
          return false;
        }
        $("div.fb-form-object-editable:not(." + popover.id + ")").popover('hide');
        $popover = $("form." + popover.id).closest('.popover');
        if ($popover.length > 0) {
          elementOrigin = $(element).offset().top + $(element).height() / 2;
          popoverTop = elementOrigin - $popover.height() / 2;
          $popover.css({
            position: 'absolute',
            top: popoverTop
          });
          $popover.show();
          setTimeout(function() {
            $popover.addClass('in');
            $(element).triggerHandler('shown.bs.popover');
          }, 0);
          return false;
        }
      });
      $(element).on('shown.bs.popover', function() {
        $(".popover ." + popover.id + " input:first").select();
        scope.$apply(function() {
          scope.popover.shown();
        });
      });
      $(element).on('hide.bs.popover', function() {
        var $popover;
        $popover = $("form." + popover.id).closest('.popover');
        if (!popover.isClickedSave) {
          if (scope.$$phase || scope.$root.$$phase) {
            scope.popover.cancel();
          } else {
            scope.$apply(function() {
              scope.popover.cancel();
            });
          }
        }
        $popover.removeClass('in');
        setTimeout(function() {
          $popover.hide();
        }, 300);
        return false;
      });
    }
  };
}


export function FbComponents() {
  return {
    restrict: 'A',
    template: "<ul ng-if=\"groups.length > 1\" class=\"nav nav-tabs nav-justified\">\n    <li ng-repeat=\"group in groups\" ng-class=\"{active:activeGroup==group}\">\n        <a href='#' ng-click=\"selectGroup($event, group)\">{{group}}</a>\n    </li>\n</ul>\n<div class='form-horizontal'>\n    <div class='fb-component' ng-repeat=\"component in components\"\n        fb-component=\"component\"></div>\n</div>",
    controller: 'fbComponentsController'
  };
}

export function FbComponent($injector) {
  var $drag = $injector.get('$drag');
  var $compile = $injector.get('$compile');
  return {
    restrict: 'A',
    scope: {
      component: '=fbComponent'
    },
    controller: 'fbComponentController',
    link: function(scope, element) {
      scope.copyObjectToScope(scope.component);
      $drag.draggable($(element), {
        mode: 'mirror',
        defer: false,
        object: {
          componentName: scope.component.name
        }
      });
      scope.$watch('component.template', function(template) {
        var view;
        if (!template) {
          return;
        }
        view = $compile(template)(scope);
        $(element).html(view);
      });
    }
  };
}

export function FbForm($injector) {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      formName: '@fbForm',
      input: '=ngModel',
      "default": '=fbDefault'
    },
    template: "<div class='fb-form-object' ng-repeat=\"object in form\" fb-form-object=\"object\"></div>",
    controller: 'fbFormController',
    link: function(scope, element, attrs) {
      var $builder, base, name;
      $builder = $injector.get('$builder');
      if ((base = $builder.forms)[name = scope.formName] == null) {
        base[name] = [];
      }
      scope.form = $builder.forms[scope.formName];
    }
  };
}

export function FbFormObject($injector) {
  var $builder = $injector.get('$builder');
  var $compile = $injector.get('$compile');
  var $parse = $injector.get('$parse');
  return {
    restrict: 'A',
    controller: 'fbFormObjectController',
    link: function(scope, element, attrs) {
      scope.formObject = $parse(attrs.fbFormObject)(scope);
      scope.$component = $builder.components[scope.formObject.component];
      scope.$on($builder.broadcastChannel.updateInput, function() {
        scope.updateInput(scope.inputText);
      });
      if (scope.$component.arrayToText) {
        scope.inputArray = [];
        scope.$watch('inputArray', function(newValue, oldValue) {
          var checked, index, ref;
          if (newValue === oldValue) {
            return;
          }
          checked = [];
          for (index in scope.inputArray) {
            if (scope.inputArray[index]) {
              checked.push((ref = scope.options[index]) != null ? ref : scope.inputArray[index]);
            }
          }
          scope.inputText = checked.join(', ');
        }, true);
      }
      scope.$watch('inputText', function() {
        scope.updateInput(scope.inputText);
      });
      scope.$watch(attrs.fbFormObject, function() {
        scope.copyObjectToScope(scope.formObject);
      }, true);
      scope.$watch('$component.template', function(template) {
        var $input, $template, view;
        if (!template) {
          return;
        }
        $template = $(template);
        $input = $template.find("[ng-model='inputText']");
        $input.attr({
          validator: '{{validation}}'
        });
        view = $compile($template)(scope);
        return $(element).html(view);
      });
      if (!scope.$component.arrayToText && scope.formObject.options.length > 0) {
        scope.inputText = scope.formObject.options[0];
      }
      return scope.$watch("default['" + scope.formObject.id + "']", function(value) {
        if (!value) {
          return;
        }
        if (scope.$component.arrayToText) {
          scope.inputArray = value;
        } else {
          scope.inputText = value;
        }
      });
    }
  };
}
