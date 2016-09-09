export function DfBuilderController() {
  // TODO: adds logic code
}

export function DfFormObjectEditableController($scope, $injector, $log) {
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
      sum = sum.concat(page.form.content.map( fo => {
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
    $scope.$watch('[label, description, placeholder, required, options, validation, display, dependentFrom]', () => {
      formObject.label         = $scope.label;
      formObject.description   = $scope.description;
      formObject.placeholder   = $scope.placeholder;
      formObject.required      = $scope.required;
      formObject.options       = $scope.options;
      formObject.validation    = $scope.validation;
      formObject.display       = $scope.display;
      formObject.dependentFrom = $scope.dependentFrom;
    }, true);

    // watch options (to selects, radios and checkboxes)
    $scope.$watch('optionsText', (text) => {
      if(!text || text == '') return;

      $scope.options = text.split('\n').reduce((sum, text, index) => {
        if(text.length <= 0) return sum;

        let currentOption = $scope.options[index] || {};
        currentOption.text = text;

        if(!currentOption.key) currentOption.key = $builder.generateKey();
        if(!currentOption.value) currentOption.value = 0;
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
    $builder.removeFormObject($scope.$parent.formName, formObject);
  }

  $scope.submit = () => {
    let v = $validator.validate($scope, 'options');
    $scope.validator = $validator
    v.success ( () => {
      // validated success
      $log.info('success');
    });
    v.error( () => {
      // validated error
      $log.error($scope.validator.broadcastChannel);
    });
    v.then( () => {
      $log.info("then");
    });
  };
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

  if ($scope.input == null) $scope.input = [];

  $scope.$watch('form', function() {
    if ($scope.input.length > $scope.form.length)
      $scope.input.splice($scope.form.length);

    $timeout(() => {
      $scope.$broadcast($builder.broadcastChannel.updateInput);
    });
  }, true);
}

export function DfFormObjectController($scope, $injector) {
  // providers
  var $builder = $injector.get('$builder');
  // it comes with the sourcecode but isn't used
  $scope.copyObjectToScope = (object) => $builder.copyObjectToScope(object, $scope);
  $scope.updateInput = (value) => {
    // Copy current scope.input[X] to $parent.input.
    // @param value: The input value.
    let input = {
      id: $scope.formObject.id,
      label: $scope.formObject.label,
      value: value != null ? value : ''
    };
    $scope.$parent.input.splice($scope.$index, 1, input);
  };

  $scope.findSelectedOption = (options, key) => {
    let selectedOption = options.filter((option)=> { return option.key == key})[0];
    return selectedOption || false;
  }
}
export function DfDragpagesController() {
  // TODO: adds logic code
}
