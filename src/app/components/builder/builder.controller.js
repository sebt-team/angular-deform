// Copy object (ng-repeat="object in objects") to scope without `hashKey`.
var copyObjectToScope = (object, scope) => {
  var key, value;
  for (key in object) {
    value = object[key];
    if (key !== '$$hashKey') {
      scope[key] = value;
    }
  }
};


export function FbBuilderController($scope, $injector) {
  var $builder = $injector.get('$builder');
  var selectedElement = undefined;
  var selectedObjectEditableScope = undefined;

  this.selectObjectEditable = (childScope, formObject, element) => {
    // 1. Configure current scope from child directive
    // 2. Set current formobject to share between directives
    if(selectedElement)
      selectedElement.removeClass('active');

    selectedElement = element
    selectedElement.addClass('active');
    selectedObjectEditableScope = childScope;
    // replace for setter method
    $builder.selectedFormObject = angular.copy(formObject);
  }

  $scope.updateChildAttributes = (currentFormObject) => {
    copyObjectToScope(currentFormObject, selectedObjectEditableScope);
  }
}

export function FbFormObjectEditableController($scope, $injector) {
  var $builder = $injector.get('$builder');
  var $timeout = $injector.get('$timeout');

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

    $scope.$watch('optionsText', (text) => {
      $scope.options    = text.split('\n').map(opt => { if(opt.length > 0) return opt; });
      $scope.inputText  = $scope.options[0];
    });
    $scope.validationOptions = $builder.components[formObject.component].validationOptions;
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

  $scope.duplicate = () => {
    let formObject = $builder.selectedFormObject;
    let formName = $scope.formName;
    $builder.forms[formName].splice(formObject.index, 0, angular.copy(formObject));
    $timeout(() => {
      $scope.$broadcast($builder.broadcastChannel.saveInput);
    });
  }

  $scope.remove = () => {
    let formObject = $builder.selectedFormObject;
    $builder.removeFormObject($scope.formName, formObject.index);
  }
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
export function DfDragpagesController($scope) {
  // TODO: adds logic code
}
