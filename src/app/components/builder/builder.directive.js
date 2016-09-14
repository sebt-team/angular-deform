export function DfBuilder ($injector) {
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
    controller: 'dfBuilderController',
    templateUrl: 'app/components/builder/templates/df-builder.directive.html',
    link: (scope, element, attrs) => {
      // ----------------------------------------
      // valuables
      // ----------------------------------------
      var beginMove = true;
      scope.formName = attrs.dfBuilder;
      scope.formObjects = $builder.addForm(scope.formName);
      scope.builder = $builder;

      $(element).addClass('df-builder');

      $drag.droppable($(element), {
        move: (e) => {
          if(beginMove) {
            $("div.df-form-object-editable").popover('hide');
            beginMove = false;
          }

          let $formObjects = $(element).find('.df-form-object-editable:not(.empty,.dragging)');
          if ($formObjects.length === 0) {
            if ($(element).find('.df-form-object-editable.empty').length === 0) {
              $(element).find('>div:first').append($("<div class='df-form-object-editable empty'></div>"));
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
              let $empty = $("<div class='df-form-object-editable empty'></div>");
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
            $("div.df-form-object-editable").popover('hide');
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
              $builder.removeFormObject(attrs.dfBuilder, formObject.index);
          } else if (isHover) {
            if (draggable.mode === 'mirror') {
              $builder.insertFormObject(scope.formName, $(element).find('.empty').index('.df-form-object-editable'), {
                component: draggable.object.componentName
              });
            }
            if (draggable.mode === 'drag') {
              let oldIndex = draggable.object.formObject.index;
              let newIndex = $(element).find('.empty').index('.df-form-object-editable');
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

export function DfFormObjectEditable($injector) {
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
    controller: 'dfFormObjectEditableController',
    require:'^dfBuilder',
    scope: {
      formObject: '=dfFormObjectEditable'
    },
    link: (scope, element) => {
      scope.inputArray = [];
      scope.builder = $builder;
      scope.$component = $builder.components[scope.formObject.component];
      scope.setupScope(scope.formObject);

      scope.$watch('$component.template', (template) => {
        if (!template)
          return;

        template = `<div><div class="df-remove-btn" ng-click='remove(formObject, $event)'>
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

export function DfObjectEditable($injector) {
  // ----------------------------------------
  // providers
  // ----------------------------------------
  var $builder = $injector.get('$builder');
  var $compile = $injector.get('$compile');
  var $animate = $injector.get('$animate');

  // ----------------------------------------
  // directive
  // ----------------------------------------

  let directive = {
    restrict: 'A',
    controller: 'dfFormObjectEditableController',
    templateUrl: 'app/components/builder/templates/df-object-editable.directive.html',
    link: (scope, element, attrs) => {
      scope.builder = $builder;
      scope.formName = attrs.dfObjectEditable;
      scope.showForm = true;
      scope.$watch('builder.getCurrentFormObject()', (currentFormObject) => {
        if(currentFormObject) {
          scope.setupScope(currentFormObject);
          // scope.data.backup();
          let component = $builder.components[currentFormObject.component];
          let view = $compile(component.popoverTemplate)(scope);
          let renderElement = element.children().children('.df-o-editable').children();
          renderElement.html(view);
          // animate
          renderElement.addClass('df-o-editable-out')
          $animate.addClass(renderElement, 'df-o-editable-in').then(() => {
            $animate.removeClass(renderElement,'df-o-editable-out');
            $animate.removeClass(renderElement,'df-o-editable-in');
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


export function DfComponents() {
  // ----------------------------------------
  // directive
  // ----------------------------------------

  let directive = {
    restrict: 'A',
    templateUrl: 'app/components/builder/templates/df-components.directive.html',
    controller: 'dfComponentsController'
  };

  return directive;
}

export function DfComponent($injector) {
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
      component: '=dfComponent'
    },
    controller: 'dfComponentController',
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

export function DfForm($injector) {
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
      formName: '@dfForm',
      input: '=ngModel',
      "default": '=dfDefault'
    },
    template: '<div class="df-form-object" ng-repeat="object in form" df-form-object="object"></div>',
    controller: 'dfFormController',
    link: (scope) => {
      $builder = $injector.get('$builder');
      $builder.forms[scope.formName] = $builder.forms[scope.formName] || []
      scope.form = $builder.forms[scope.formName]
    }
  };

  return directive;
}

export function DfFormObject($injector) {
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
    controller: 'dfFormObjectController',
    link: (scope, element, attrs) => {
      scope.formObject = $parse(attrs.dfFormObject)(scope);
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
      scope.$watch(attrs.dfFormObject, () => {
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

  // ----------------------------------------
  // directive
  // ----------------------------------------
  let directive = {
    restrict: 'A',
    templateUrl: 'app/components/builder/templates/df-page-editable.directive.html',
    link: (scope) => {

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


export function DfFormBuilder($injector) {
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
    scope: {
      output: '=dfFormBuilder'
    },
    link: (scope) => {
      scope.forms = $builder.forms
      scope.pages = $builder.pages;
      scope.builder = $builder;
      scope.output = scope.pages;

      scope.changePage = (index)=> {
        $builder.selectCurrentPage(index);
      }

      // create the first page
      if(!$builder.pages.length)
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
    link: (scope, element, attrs, ctrl) => {
      // view to model
      element.on('keyup', () => {
        scope.$apply(() => {
            ctrl.$setViewValue(element.html());
        });
      });

      // model to view
      ctrl.$render = () => {
        element.html(ctrl.$viewValue);
      };

      // load init value from DOM
      $timeout(() => {
        ctrl.$setViewValue(element.html());
      });
    }
  };
}
