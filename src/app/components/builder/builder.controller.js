var copyObjectToScope = (object, scope) => {
  // Copy object (ng-repeat="object in objects") to scope without `hashKey`.

  var key, value;
  for (key in object) {
    value = object[key];
    if (key !== '$$hashKey') {
      scope[key] = value;
    }
  }
};

export function FbFormObjectEditableController($scope, $injector) {
  var $builder = $injector.get('$builder');
  $scope.setupScope = (formObject) => {

    // 1. Copy origin formObject (ng-repeat="object in formObjects") to scope.
    // 2. Setup optionsText with formObject.options.
    // 3. Watch scope.label, .description, .placeholder, .required, .options then copy to origin formObject.
    // 4. Watch scope.optionsText then convert to scope.options.
    // 5. setup validationOptions

    copyObjectToScope(formObject, $scope);
    $scope.optionsText = formObject.options.join('\n');

    $scope.$watch('[label, description, placeholder, required, options, validation]', () => {
      formObject.label        = $scope.label;
      formObject.description  = $scope.description;
      formObject.placeholder  = $scope.placeholder;
      formObject.required     = $scope.required;
      formObject.options      = $scope.options;
      formObject.validation   = $scope.validation;
    }, true);

    $scope.$watch('optionsText', function(text) {
      $scope.options = () => {
        text.split('\n').map(opt => {
          if(opt.length > 0) return opt;
        });
      }
      $scope.inputText = $scope.options[0];
    });
    let component = $builder.components[formObject.component];
    $scope.validationOptions = component.validationOptions;
  };
  $scope.data = {
    model: null,
    backup: () => {
      // Backup input value.

      this.model = {
        label: $scope.label,
        description: $scope.description,
        placeholder: $scope.placeholder,
        required: $scope.required,
        optionsText: $scope.optionsText,
        validation: $scope.validation
      };
    },
    rollback: () => {
      // Rollback input value.

      if (!this.model) return;

      $scope.label = this.model.label;
      $scope.description = this.model.description;
      $scope.placeholder = this.model.placeholder;
      $scope.required = this.model.required;
      $scope.optionsText = this.model.optionsText;
      $scope.validation = this.model.validation;
    }
  };
}

export function FbComponentsController($scope, $injector) {

   // providers
  var $builder = $injector.get('$builder');

  // actions
  $scope.selectGroup = ($event, group) => {
    $scope.activeGroup = group;
    $scope.components = [];

    if($event)
      $event.preventDefault();

    angular.forEach($builder.components, (component) => {
      if(component.group == group) $scope.components.push(component)
    });

  }

  $scope.groups = $builder.groups;
  $scope.activeGroup = $scope.groups[0];
  $scope.allComponents = $builder.components;

  $scope.$watch('allComponents', () => {
    $scope.selectGroup(null, $scope.activeGroup);
  });
}

export function FbComponentController($scope) {
  $scope.copyObjectToScope = (object) => copyObjectToScope(object, $scope);
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

export function FbFormObjectController($scope) {
  // it comes with the sourcecode but isn't used
  $scope.copyObjectToScope = (object) => copyObjectToScope(object, $scope);

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
