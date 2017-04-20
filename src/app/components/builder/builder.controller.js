import { Utils } from './builder.classes';

export function DfBuilderController() {
  // TODO: adds logic code
}

export function DfFormObjectEditableController($scope, $injector) {
  var $builder    = $injector.get('$builder');
  var $validator  = $injector.get('$validator');

  $scope.setupScope = (formObject) => {
    // 1. Copy origin formObject (ng-repeat="object in formObjects") to scope.
    // 2. Setup optionsText with formObject.options.
    // 3. Watch scope.label, .description, .placeholder, .required, .options then copy to origin formObject.
    // 4. Watch scope.optionsText then convert to scope.options.
    // 5. setup validationOptions

    $builder.copyObjectToScope(formObject, $scope);

    // separate string to render options on text textarea
    $scope.optionsText = "";

    angular.forEach(formObject.options, function(value) {
      $scope.optionsText += value.text + '\n';
    });

    // list all instanced objects pages
    $scope.activatorsFormObjects = $builder.pages.reduce((sum, page) => {
      sum = sum.concat(page.components.map( fo => {
        // not show objects with a lower index
        if($builder.getCurrentPage().index < page.index)
          return;
        else if($builder.getCurrentPage().index == page.index && $scope.index <= fo.index )
          return;
        // adds title to display in the grouped selector
        fo.page = `${page.title} (page ${page.index + 1})`;
        return fo;
      }));
      return sum;
    }, []).filter( (fo) => {
      if(fo)
        return fo.component == 'radio' || fo.component == 'select';
    });

    // wtach normal attibutes
    $scope.$watch('[label, description, placeholder, required, options, validation, weight, display, tag, dependentFrom, customAttributes]', () => {
      formObject.label            = $scope.label;
      formObject.description      = $scope.description;
      formObject.placeholder      = $scope.placeholder;
      formObject.required         = $scope.required;
      formObject.options          = $scope.options;
      formObject.validation       = $scope.validation;
      formObject.weight           = $scope.weight;
      formObject.display          = $scope.display;
      formObject.tag              = $scope.tag;
      formObject.dependentFrom    = $scope.dependentFrom;
      formObject.customAttributes = $scope.customAttributes;
    }, true);

    // watch options (to selects, radios and checkboxes)
    $scope.$watch('optionsText', (text) => {
      if(!text || text == '') return;

      $scope.options = text.split('\n').reduce((sum, text, index) => {
        if(text.length <= 0) return sum;

        let currentOption = $scope.options[index] || {};
        currentOption.text = text;

        if(!currentOption.key) currentOption.key = new Utils().generateKey();
        if(!currentOption.value) currentOption.value = 0;
        if(currentOption.hidden == undefined) currentOption.hidden = false;
        currentOption
        sum.push(currentOption);
        return sum;
      }, []);
    });

    $scope.$watch('dependentFrom["active"]', (active) => {
      if(active == false)
        $builder.removeAnswerDependency($scope, true);
    });

    $scope.$watch('dependentFrom["formObjectKey"]', (formObjectKey) => {
      // 1. get array with all formObjects (in all pages)
      // 2. find object with equal key
      if(!formObjectKey || formObjectKey == '') return;

      let selectedFormObject = $builder.findFormObjectByKey(formObjectKey)
      if(selectedFormObject) $scope.dependencyOptions = selectedFormObject.options;
      else $scope.dependencyOptions = [];
    });

    $scope.$watch('dependentFrom["formAnswerKey"]', (optionKey) => {
      if(optionKey && optionKey != '') {
        let dependentFormObjectKey = $scope.dependentFrom.formObjectKey
        $builder.addAnswerDependency($scope, dependentFormObjectKey, optionKey);
      } else {
         $builder.removeAnswerDependency($scope);
      }
    });

    $scope.validationOptions = $builder.components[formObject.component].validationOptions;
    $scope.colapseDependency = $scope.dependentFrom.active;
  };

  $scope.duplicate = formObject => {
    $builder.duplicateFormObject($scope.$parent.formName, formObject);
  }

  $scope.remove = (formObject, event) => {
    if(event)
      event.stopPropagation();

    formObject = formObject || $builder.getCurrentFormObject();
    let dependentTargets = $builder.findDependencyTargets(formObject.key)
    if(dependentTargets.length) {
      let response = confirm("This change will break one or more dependencies\nDo you want to continue?");
      if (response == true) {
        $builder.removeAnswerDependencybyTarget(formObject);
        $builder.removeFormObject($scope.$parent.formName, formObject.index);
      }
    } else {
      $builder.removeFormObject($scope.$parent.formName, formObject.index);
    }
  }

  $scope.addOption = (index) => {
    let options = getOptionsTextArray()
    options.splice(index + 1, 0, `Set option text`);
    refreshOptionsText(options)
  }

  $scope.editOption = (index) => {
    if($scope.options[index].text == '')
      $scope.options[index].text = `Set option text`;
    refreshOptionsText(getOptionsTextArray())
  }

  $scope.removeOption = (index) => {
    let options = $scope.options.splice(index, 1);
    refreshOptionsText(getOptionsTextArray())
  }

  $scope.submitPoints = () => {
    $validator.validate($scope, 'options');
    $scope.validator = $validator
  };

  function getOptionsTextArray() {
    return $scope.options.map( o => {
      return o.text;
    });
  }

  function refreshOptionsText(options) {
    $scope.optionsText = options.reduce((sum, text, index) => {
      sum += text;
      sum += '\n';
      return sum;
    }, '');
  }
}

export function DfComponentsController($scope, $injector) {
  // providers
  var $builder = $injector.get('$builder');
  $scope.groupedComponents = {};
  angular.forEach($builder.components, (component) => {
    if (angular.isUndefined($scope.groupedComponents[component.group])) {
      $scope.groupedComponents[component.group] = [];
    }
    $scope.groupedComponents[component.group].push(component);
  });
}

export function DfComponentController($scope, $injector) {
  var $builder = $injector.get('$builder');
  $scope.copyObjectToScope = (object) => $builder.copyObjectToScope(object, $scope);
}

export function DfFormController($scope, $injector) {

  var $builder = $injector.get('$builder');
  var $timeout = $injector.get('$timeout');
  var $validator = $injector.get('$validator');
  var $rootScope = $injector.get('$rootScope');
  var WizardHandler = $injector.get('WizardHandler');

  $scope.disableInputs = false;
  if ($scope.input == null) $scope.input = [];

  $scope.$watch('form', function() {
    // if ($scope.input.length > $scope.form.length)
    //   $scope.input.splice($scope.form.length);
    $timeout(() => {
      $scope.$broadcast($builder.broadcastChannel.updateInput);
    });
  }, true);

  $scope.$watch('builder.pages', (pages) => {
    if(pages)
      initializeInput(pages);
  });

  $scope.$watch('builder.getDisplay()', (display) => {
    if(!display) return;

    $scope.input = [];
    if(display == $builder.displayTypes.WIZARD)
      initializeInput($builder.pages);
  });

  $scope.previousStep = (index=0) => {
    let isFirstStep = index == 0;

    if (!isFirstStep) WizardHandler.wizard().previous();
    $scope.disableInputs = false;
    $rootScope.$broadcast($builder.broadcastChannel.changeWizardStep, index-1);
  }

  $scope.nextStep = (page, index=0) => {
    // validate current form
    $scope.disableInputs = true;
    let isLastStep = index == ($scope.pages.length - 1);
    let validatorPromise = $validator.validate($scope, page.formReference);
    // success validation
    validatorPromise.success(function() {
      // if callback function exist
      if($scope.onSubmitSuccessFn()) {
        let responses = $scope.input;
        // if display is WIZARD send current responses
        if($builder.getDisplay() == $builder.displayTypes.WIZARD) {
          responses = $scope.input.find((responses) => {
            return responses.key == page.key
          }).responses;
        }
        $scope.onSubmitSuccessFn()(responses, page, isLastStep).then(() => {
          goToNextWizardStep(index, isLastStep);
        }, () => {
          $scope.disableInputs = false;
        });
      } else {
        goToNextWizardStep(index, isLastStep);
      }
    }).error(function() {
      if($scope.onSubmitErrorFn())
        $scope.onSubmitErrorFn()();
      $scope.disableInputs = false;
    });
  }

  function goToNextWizardStep(index, isLastStep) {
    if(!isLastStep) WizardHandler.wizard().next();
    $scope.disableInputs = false;
    $rootScope.$broadcast($builder.broadcastChannel.changeWizardStep, index+1);
  }

  function setDefaultWizardStep() {
    $timeout(function () {
      if ($scope.currentWizardStep &&
          $scope.pages.length > 1 &&
          $builder.getDisplay() == $builder.displayTypes.WIZARD
      )
        WizardHandler.wizard().goTo($scope.currentWizardStep);
    });
  }

  function initializeInput(pages) {
    angular.forEach(pages, function(form) {
      if(!$scope.input[form.index])
        $scope.input[form.index] = {
          id: form.id,
          key: form.key,
          index: form.index,
          responses: []
        }
    });
  }

  initializeInput($builder.pages);
  setDefaultWizardStep();
}

export function DfFormObjectController($scope, $injector) {
  // providers
  var $builder = $injector.get('$builder');
  var $log     = $injector.get('$log');
  // it comes with the sourcecode but isn't used
  $scope.copyObjectToScope = (object) => $builder.copyObjectToScope(object, $scope);

  $scope.findSelectedOption = (options, key) => {
    let selectedOption = options.filter((option)=> { return option.key == key})[0];
    return selectedOption || false;
  }

  $scope.updateInput = (value) => {
    // copy current scope.input[X] to $parent.input.
    let input = {
      id: $scope.formObject.id,
      label: $scope.formObject.label,
      value: value != null ? value : ''
    };
    // changes the output format depending on the display
    if($builder.getDisplay() == $builder.displayTypes.WIZARD) {
      let page = $builder.findPageByFormObjectKey($scope.formObject.key);
      $scope.$parent.input[page.index].responses.splice($scope.$index, 1, input);
    } else {
      $scope.$parent.input.splice($scope.$index, 1, input);
    }
  };

  $scope.resolveDependency = (value) => {
    $scope.builder.dependencies.filter( d => {
      return d.formObjectKey == $scope.formObject.key;
    }).map( d => {
      let display = d.formAnswerKey == value;
      let formObject = $scope.builder.findFormObjectByKey(d.formObjectTargetKey);
      formObject.display = display;
    });
  }

  // function to run custom action defined in the templates
  $scope.callCustomAction = (customActionName, customValues) => {
    if($scope.customActions) {
      if($scope.customActions[customActionName])
        $scope.customActions[customActionName]($scope, customValues);
      else
        $log.error("This custom action does not exist.");
    }
  }
}

export function DfFormBuilderController($scope, $injector) {
  // providers
  var $builder = $injector.get('$builder');

  $scope.changePage = (index)=> {
    $builder.selectCurrentPage(index);
  }

  $scope.$watch('builder.getDisplay()', () => {
    setOutputFormat();
  });

  function setOutputFormat() {
    if($builder.getDisplay() == $builder.displayTypes.WIZARD)
      $scope.output = $builder.pages;
    else
      $scope.output = $builder.pages[0].components;
  }

  // create the first page
  if(!$builder.pages.length)
    $builder.addPage();
  // define output format
  setOutputFormat();
}
