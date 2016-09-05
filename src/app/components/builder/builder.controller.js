export function FbBuilderController($scope, $injector) {
  // TODO: adds logic code
}

export function FbFormObjectEditableController($scope, $injector) {
  var $builder    = $injector.get('$builder');
  var $timeout    = $injector.get('$timeout');
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
    angular.forEach(formObject.options, function(value, key) {
      $scope.optionsText += value.text + '\n';
    });

    // list all instanced objects pages
    $scope.allFormObjects = $builder.pages.reduce((sum, page) => {
      sum = sum.concat(page.form.content.map( fo => {
        fo.page = `${page.title} (page ${page.index + 1})`;
        return fo;
      }));
      return sum;
    }, []);

    // wtach normal attibutes
    $scope.$watch('[label, description, placeholder, required, options, validation]', () => {
      formObject.label        = $scope.label;
      formObject.description  = $scope.description;
      formObject.placeholder  = $scope.placeholder;
      formObject.required     = $scope.required;
      formObject.options      = $scope.options;
      formObject.validation   = $scope.validation;
    }, true);

    // watch options (to selects, radios and checkboxes)
    $scope.$watch('optionsText', (text) => {
      if(!text || text == '')
        return;

      $scope.options = text.split('\n').reduce((sum, opt) => {
        if(opt.length > 0) sum.push({text: opt, value: 0});
        return sum;
      }, []);
      // $scope.inputText  = $scope.options[0];
    });

    $scope.validationOptions = $builder.components[formObject.component].validationOptions;
  };

  $scope.duplicate = (formObject) => {
    $builder.duplicateFormObject($scope.$parent.formName, formObject);
  }

  $scope.remove = (formObject, event) => {
    if(event)
      event.stopPropagation();
    $builder.removeFormObject($scope.$parent.formName, formObject);
  }

  $scope.submit = () => {
    $validator.validate($scope, 'options');
  };
}

export function FbComponentsController($scope, $injector) {
  // providers
  var $builder = $injector.get('$builder');

  $scope.groupedComponents = {};
  angular.forEach($builder.components, (component) => {
    if (!angular.isDefined($scope.groupedComponents[component.group])) {
      $scope.groupedComponents[component.group] = [];
    }
    $scope.groupedComponents[component.group].push(component);
  });
}

export function FbComponentController($scope, $injector) {
  var $builder = $injector.get('$builder');
  $scope.copyObjectToScope = (object) => $builder.copyObjectToScope(object, $scope);
}

export function FbFormController($scope, $injector) {
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

export function FbFormObjectController($scope, $injector) {
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
}
export function DfDragpagesController($scope) {
  // TODO: adds logic code
}
