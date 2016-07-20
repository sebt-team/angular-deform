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
    controller: 'fbBuilderController',
    templateUrl: 'app/components/builder/templates/df-builder.directive.html',
    link: (scope, element, attrs) => {
      // ----------------------------------------
      // valuables
      // ----------------------------------------
      var beginMove = true;

      scope.formName = attrs.fbBuilder;
      scope.formObjects = $builder.forms[scope.formName];
      scope.builder = $builder;

      scope.$watch('builder.selectedFormObject', (currentFormObject) => {
        if(currentFormObject)
          scope.updateChildAttributes(currentFormObject);
      }, true);

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
            return;
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
              if (oldIndex < newIndex)
                newIndex--;
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
  // ----------------------------------------
  // providers
  // ----------------------------------------
  var $builder = $injector.get('$builder');
  var $drag = $injector.get('$drag');
  var $compile = $injector.get('$compile');
  var $validator = $injector.get('$validator');

  // ----------------------------------------
  // directive
  // ----------------------------------------
  let directive = {
    restrict: 'A',
    controller: 'fbFormObjectEditableController',
    require:'^fbBuilder',
    scope: {
      formObject: '=fbFormObjectEditable'
    },
    link: (scope, element, attrs, ctrl) => {
      scope.inputArray = [];
      scope.builder = $builder;
      scope.$component = $builder.components[scope.formObject.component];
      scope.setupScope(scope.formObject);

      scope.$watch('$component.template', (template) => {
        let view;
        if (!template)
          return;

        view = $compile(template)(scope);
        $(element).html(view);
      });

      element.bind('click', function(){
        scope.$apply(function () {
          ctrl.selectObjectEditable(scope, scope.formObject, element);
        });
      });

      $drag.draggable($(element), {
        object: {
          formObject: scope.formObject
        }
      });

      if (!scope.formObject.editable)
        return;

      // let popover = {};
      // scope.$watch('$component.popoverTemplate', (template) => {
      //   if (!template)
      //     return;

      //   $(element).removeClass(popover.id);
      //   popover = {
      //     id: "fb-" + (Math.random().toString().substr(2)),
      //     isClickedSave: false,
      //     view: null,
      //     html: template
      //   };
      //   popover.html = $(popover.html).addClass(popover.id);
      //   popover.view = $compile(popover.html)(scope);
      //   $(element).addClass(popover.id);
      //   $(element).popover({
      //     html: true,
      //     title: scope.$component.label,
      //     content: popover.view,
      //     container: 'body',
      //     placement: $builder.config.popoverPlacement
      //   });
      // });
      // scope.popover = {
      //   save: ($event) => {
      //     // The save event of the popover.
      //     $event.preventDefault();
      //     $validator.validate(scope).success(() => {
      //       popover.isClickedSave = true;
      //       $(element).popover('hide');
      //     });
      //   },
      //   remove: ($event) => {
      //     // The delete event of the popover.
      //     $event.preventDefault();
      //     $builder.removeFormObject(scope.$parent.formName, scope.$parent.$index);
      //     $(element).popover('hide');
      //   },
      //   shown: () => {
      //     // The shown event of the popover.
      //     scope.data.backup();
      //     popover.isClickedSave = false;
      //   },
      //   cancel: ($event) => {
      //     // The cancel event of the popover.
      //     scope.data.rollback();
      //     if ($event) {
      //       $event.preventDefault();
      //       $(element).popover('hide');
      //     }
      //   }
      // };

      // // popover.show
      // $(element).on('show.bs.popover', () => {
      //   var $popover, elementOrigin, popoverTop;
      //   if ($drag.isMouseMoved()) {
      //     return false;
      //   }
      //   $("div.fb-form-object-editable:not(." + popover.id + ")").popover('hide');
      //   $popover = $("form." + popover.id).closest('.popover');
      //   if ($popover.length > 0) {
      //     elementOrigin = $(element).offset().top + $(element).height() / 2;
      //     popoverTop = elementOrigin - $popover.height() / 2;
      //     $popover.css({
      //       position: 'absolute',
      //       top: popoverTop
      //     });
      //     $popover.show();
      //     setTimeout(() => {
      //       $popover.addClass('in');
      //       $(element).triggerHandler('shown.bs.popover');
      //     }, 0);
      //     return false;
      //   }
      // });

      // // popover.shown
      // $(element).on('shown.bs.popover', () => {
      //   $(".popover ." + popover.id + " input:first").select();
      //   scope.$apply(() => {
      //     scope.popover.shown();
      //   });
      // });

      // // popover.hide
      // $(element).on('hide.bs.popover', () => {
      //   // do not remove the DOM
      //   var $popover;
      //   $popover = $("form." + popover.id).closest('.popover');
      //   if (!popover.isClickedSave) {
      //     // eval the cancel event
      //     if (scope.$$phase || scope.$root.$$phase) {
      //       scope.popover.cancel();
      //     } else {
      //       scope.$apply(() => {
      //         scope.popover.cancel();
      //       });
      //     }
      //   }
      //   $popover.removeClass('in');
      //   setTimeout(function() {
      //     $popover.hide();
      //   }, 300);
      //   return false;
      // });
    }
  };

  return directive;
}

export function FbObjectEditable($injector) {
  // ----------------------------------------
  // providers
  // ----------------------------------------
  var $builder = $injector.get('$builder');
  var $compile = $injector.get('$compile');

  // ----------------------------------------
  // directive
  // ----------------------------------------

  let directive = {
    restrict: 'A',
    controller: 'fbFormObjectEditableController',
    templateUrl: 'app/components/builder/templates/df-object-editable.directive.html',
    link: (scope, element, attrs) => {
      scope.builder = $builder;
      scope.formName = attrs.fbObjectEditable;
      scope.$watch('builder.selectedFormObject', (currentFormObject) => {
        if(currentFormObject) {
          scope.setupScope(currentFormObject);
          // scope.data.backup();
          let component = $builder.components[currentFormObject.component];
          let view = $compile(component.popoverTemplate)(scope);
          $(element).html(view);
        }
      });
    }
  };

  return directive;
}


export function FbComponents() {
  // ----------------------------------------
  // directive
  // ----------------------------------------

  let directive = {
    restrict: 'A',
    templateUrl: 'app/components/builder/templates/df-components.directive.html',
    controller: 'fbComponentsController'
  };

  return directive;
}

export function FbComponent($injector) {
  // ----------------------------------------
  // providers
  // ----------------------------------------
  var $drag = $injector.get('$drag');
  var $compile = $injector.get('$compile');

  // ----------------------------------------
  // directive
  // ----------------------------------------
  let directive = {
    restrict: 'A',
    scope: {
      component: '=fbComponent'
    },
    controller: 'fbComponentController',
    link: (scope, element) => {
      scope.copyObjectToScope(scope.component);
      $drag.draggable($(element), {
        mode: 'mirror',
        defer: false,
        object: {
          componentName: scope.component.name
        }
      });
      scope.$watch('component.showcaseTemplate', (showcaseTemplate) => {
        if (!showcaseTemplate)
          return;

        let view = $compile(showcaseTemplate)(scope);
        $(element).html(view);
      });
    }
  };

  return directive;
}

export function FbForm($injector) {
  // ----------------------------------------
  // providers
  // ----------------------------------------
  var $builder = $injector.get('$builder');

  // ----------------------------------------
  // directive
  // ----------------------------------------
  let directive = {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      formName: '@fbForm',
      input: '=ngModel',
      "default": '=fbDefault'
    },
    template: '<div class="fb-form-object" ng-repeat="object in form" fb-form-object="object"></div>',
    controller: 'fbFormController',
    link: (scope, element, attrs) => {
      $builder = $injector.get('$builder');
      $builder.forms[scope.formName] = $builder.forms[scope.formName] || []
      scope.form = $builder.forms[scope.formName]
    }
  };

  return directive;
}

export function FbFormObject($injector) {
  // ----------------------------------------
  // providers
  // ----------------------------------------
  var $builder = $injector.get('$builder');
  var $compile = $injector.get('$compile');
  var $parse = $injector.get('$parse');

  // ----------------------------------------
  // directive
  // ----------------------------------------
  let directive = {
    restrict: 'A',
    controller: 'fbFormObjectController',
    link: (scope, element, attrs) => {
      scope.formObject = $parse(attrs.fbFormObject)(scope);
      scope.$component = $builder.components[scope.formObject.component];
      // listen (formObject updated)
      scope.$on($builder.broadcastChannel.updateInput, () => {
        console.log(scope.inputText);
        scope.updateInput(scope.inputText);
      });
      if (scope.$component.arrayToText) {
        scope.inputArray = [];
        scope.$watch('inputArray', (newValue, oldValue) => {

          if (newValue === oldValue)
            return;

          let checked = [];
          let ref;
          for (var i in scope.inputArray) {
            if (scope.inputArray[i]) {
              checked.push((ref = scope.options[i]) != null ? ref : scope.inputArray[i]);
            }
          }
          scope.inputText = checked.join(', ');
        }, true);
      }
      scope.$watch('inputText', () => {
        scope.updateInput(scope.inputText);
      });
      // watch (management updated form objects)
      scope.$watch(attrs.fbFormObject, () => {
        scope.copyObjectToScope(scope.formObject);
      }, true);
      scope.$watch('$component.template', (template) => {

        if (!template) {
          return;
        }

        let $template = $(template);
        let view = $compile($template)(scope);
        let $input = $template.find("[ng-model='inputText']");
        $input.attr({ validator: '{{validation}}'});
        return $(element).html(view);
      });

      if (!scope.$component.arrayToText && scope.formObject.options.length > 0)
        scope.inputText = scope.formObject.options[0];

      return scope.$watch("default['" + scope.formObject.id + "']", (value) => {
        if (!value)
          return;

        if (scope.$component.arrayToText)
          scope.inputArray = value;
        else
          scope.inputText = value;
      });
    }
  };

  return directive;
}
