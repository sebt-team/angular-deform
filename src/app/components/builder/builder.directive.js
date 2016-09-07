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
    controller: 'fbBuilderController',
    templateUrl: 'app/components/builder/templates/df-builder.directive.html',
    link: (scope, element, attrs) => {
      // ----------------------------------------
      // valuables
      // ----------------------------------------
      var beginMove = true;
      scope.formName = attrs.fbBuilder;
      scope.formObjects = $builder.addForm(scope.formName);
      scope.builder = $builder;

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

              let dependentsTrouble = false;
              let formObject = draggable.object.formObject;
              let formObjectKey = formObject.key;
              let dependentTargets = $builder.findDependencyTargets(formObjectKey);
              let affectedDependentTargets = dependentTargets.filter(dt => {
                return dt.index <= newIndex;
              });
              if(affectedDependentTargets.length)
                dependentsTrouble = true;

              let dependencyTrouble = false;
              if(formObject.dependentFrom.active) {
                let dependencyFormObjectKey = formObject.dependentFrom.formObjectKey;
                let dependencyFormObject = $builder.findFormObjectByKey(dependencyFormObjectKey);
                if(dependencyFormObject.index >= newIndex)
                  dependencyTrouble = true;
              }

              let skipReindex = false;
              if(dependentsTrouble || dependencyTrouble) {
                var response = confirm("This change will break one or more dependencies\nDo you want to continue?");
                if (response == true) {
                  if(dependencyTrouble)
                    dependentTargets = dependentTargets.concat([formObject]);
                  dependentTargets.forEach( dependentFormObject => {
                    $builder.removeAnswerDependency(dependentFormObject);
                  });
                } else {
                  skipReindex = true;
                }
              }

              if(!skipReindex)
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
  // var $validator = $injector.get('$validator');
  // var $rootScope = $injector.get('$rootScope');
  var $timeout = $injector.get('$timeout');

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
        if (!template)
          return;

        template = `<div><div class="fb-remove-btn" ng-click='remove(formObject, $event)'>
                      <i class='glyphicon glyphicon-remove'></i></div>${template}
                    </div>`;
        let view = $compile(template)(scope);
        element.html(view);
      });

      element.bind('click', function(e){
        e.preventDefault();
        scope.$apply(function () {
          $timeout(() => {
            scope.$emit($builder.broadcastChannel.selectInput);
            let formName = scope.$parent.formName;
            let formObject = scope.formObject;
            $builder.selectCurrentFormObject(formName, formObject, element, scope);
          });
        });
      });

      $drag.draggable($(element), {
        object: {
          formObject: scope.formObject
        }
      });

      if (!scope.formObject.editable)
        return;

    }
  };

  return directive;
}

export function FbObjectEditable($injector, $animate, $timeout) {
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
      scope.showForm = true;
      scope.$watch('builder.getCurrentFormObject()', (currentFormObject) => {
        if(currentFormObject) {
          scope.setupScope(currentFormObject);
          // scope.data.backup();
          let component = $builder.components[currentFormObject.component];
          let view = $compile(component.popoverTemplate)(scope);
          let renderElement = element.children('.fb-o-editable').children();
          renderElement.html(view);
          // animate
          renderElement.addClass('fb-o-editable-out')
          $animate.addClass(renderElement, 'fb-o-editable-in').then(() => {
            $animate.removeClass(renderElement,'fb-o-editable-out');
            $animate.removeClass(renderElement,'fb-o-editable-in');
          });
        }
      });

      scope.$watch('builder.getCurrentFormObject()', (currentFormObject) => {
        if(currentFormObject)
          $builder.updateFormObjectScope(currentFormObject);
      }, true);
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
        element.html(view);
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
        if (scope.$component.multipeChoice)
          updateInputArray();
        else
          updateInputText();
      });

      // watch multiples values
      if (scope.$component.multipeChoice) {
        scope.inputArray = [];
        scope.$watch('inputArray', (newValue, oldValue) => {
          if (newValue === oldValue) return;
          updateInputArray();
        }, true);
      }

      // watch single value
      scope.$watch('inputText', () => {
        updateInputText();
      });

      // watch (management updated form objects)
      scope.$watch(attrs.fbFormObject, () => {
        scope.copyObjectToScope(scope.formObject);
      }, true);

      // set component template on ui
      scope.$watch('$component.template', (template) => {
        if (!template) return;

        let $template = $(template);
        let view = $compile($template)(scope);
        let $input = $template.find("[ng-model='inputText']");
        $input.attr({ validator: '{{validation}}'});
        return $(element).html(view);
      });

      function updateInputArray() {
        let value = [];
        scope.inputArray.forEach((input) => {
          let selectedOption = scope.findSelectedOption(scope.options, input)
          if(selectedOption) value.push(selectedOption);
        });
        scope.updateInput(value);
      }

      function updateInputText() {
        let options = scope.formObject.options;
        if(options.length > 0) {
          let selectedOption = scope.findSelectedOption(options, scope.inputText)
          scope.updateInput(selectedOption);
        } else
          scope.updateInput(scope.inputText);
      }

      // set initial value from component
      if (!scope.$component.multipeChoice && scope.formObject.options.length > 0)
        scope.inputText = scope.formObject.options[0].key;
    }
  };

  return directive;
}

export function DfPageEditable($injector) {
  // ----------------------------------------
  // providers
  // ----------------------------------------
  var $builder = $injector.get('$builder');
  var $timeout = $injector.get('$timeout');

  // ----------------------------------------
  // directive
  // ----------------------------------------
  let directive = {
    restrict: 'A',
    templateUrl: 'app/components/builder/templates/df-page-editable.directive.html',
    link: (scope, element, attrs) => {

      scope.builer = $builder;
      scope.pages = $builder.pages;
      scope.currentPage = $builder.getCurrentPage();

      scope.$watch('builer.getCurrentPage()', function(currentPage) {
        if(currentPage)
          scope.currentPage = $builder.getCurrentPage();
      });

      scope.addNewPage = ()=> {
        $builder.addPage();
      }

      scope.removePage = ()=> {
        alert(1);
      }
    }
  }

  return directive;
}


export function DfDragpages($injector) {
  // ----------------------------------------
  // providers
  // ----------------------------------------
  var $builder = $injector.get('$builder');

  // ----------------------------------------
  // directive
  // ----------------------------------------
  let directive = {
    restrict: 'A',
    templateUrl: 'app/components/builder/templates/df-dragpages.directive.html',
    controller: 'dfDragpagesController',
    link: (scope, element, attrs) => {
      scope.forms = $builder.forms
      scope.pages = $builder.pages;
      scope.builder = $builder;

      scope.changePage = (index)=> {
        $builder.selectCurrentPage(index);
      }

      // create the first page
      $builder.addPage();
    }
  }

  return directive;
}

export function Contenteditable($injector) {
  var $timeout = $injector.get('$timeout');

  return {
    require: '^?ngModel',
    replace: true,
    link: (scope, elm, attrs, ctrl) => {
      // view to model
      elm.on('keyup', () => {
        scope.$apply(() => {
            ctrl.$setViewValue(elm.html());
        });
      });

      // model to view
      ctrl.$render = () => {
        elm.html(ctrl.$viewValue);
      };

      // load init value from DOM
      $timeout(() => {
        ctrl.$setViewValue(elm.html());
      });
    }
  };
}
