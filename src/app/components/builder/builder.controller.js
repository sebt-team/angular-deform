var copyObjectToScope;

copyObjectToScope = function(object, scope) {
  /*
  Copy object (ng-repeat="object in objects") to scope without `hashKey`.
  */
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
  $scope.setupScope = function(formObject) {

    /*
    1. Copy origin formObject (ng-repeat="object in formObjects") to scope.
    2. Setup optionsText with formObject.options.
    3. Watch scope.label, .description, .placeholder, .required, .options then copy to origin formObject.
    4. Watch scope.optionsText then convert to scope.options.
    5. setup validationOptions
    */
    var component;
    copyObjectToScope(formObject, $scope);
    $scope.optionsText = formObject.options.join('\n');
    $scope.$watch('[label, description, placeholder, required, options, validation]', function() {
      formObject.label = $scope.label;
      formObject.description = $scope.description;
      formObject.placeholder = $scope.placeholder;
      formObject.required = $scope.required;
      formObject.options = $scope.options;
      formObject.validation = $scope.validation;
    }, true);
    $scope.$watch('optionsText', function(text) {
      var x;
      $scope.options = (function() {
        var i, len, ref, results;
        ref = text.split('\n');
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          x = ref[i];
          if (x.length > 0) {
            results.push(x);
          }
        }
        return results;
      })();
      $scope.inputText = $scope.options[0];
    });
    component = $builder.components[formObject.component];
    $scope.validationOptions = component.validationOptions;
  };
  $scope.data = {
    model: null,
    backup: function() {

      /*
      Backup input value.
      */
      this.model = {
        label: $scope.label,
        description: $scope.description,
        placeholder: $scope.placeholder,
        required: $scope.required,
        optionsText: $scope.optionsText,
        validation: $scope.validation
      };
    },
    rollback: function() {

      /*
      Rollback input value.
      */
      if (!this.model) {
        return;
      }
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
  var $builder = $injector.get('$builder');
  $scope.selectGroup = function($event, group) {
    var component, name, ref, results;
    if ($event != null) {
      $event.preventDefault();
    }
    $scope.activeGroup = group;
    $scope.components = [];
    ref = $builder.components;
    results = [];
    for (name in ref) {
      component = ref[name];
      if (component.group === group) {
        results.push($scope.components.push(component));
      }
    }
    return results;
  };
  $scope.groups = $builder.groups;
  $scope.activeGroup = $scope.groups[0];
  $scope.allComponents = $builder.components;
  $scope.$watch('allComponents', function() {
    $scope.selectGroup(null, $scope.activeGroup);
  });
}

export function FbComponentController($scope) {
  $scope.copyObjectToScope = function(object) {
    copyObjectToScope(object, $scope);
  };
}

export function FbFormController($scope, $injector) {
  var $builder, $timeout;
  $builder = $injector.get('$builder');
  $timeout = $injector.get('$timeout');
  if ($scope.input == null) {
    $scope.input = [];
  }
  $scope.$watch('form', function() {
    if ($scope.input.length > $scope.form.length) {
      $scope.input.splice($scope.form.length);
    }
    $timeout(function() {
      $scope.$broadcast($builder.broadcastChannel.updateInput);
    });
  }, true);
}

// export function FbFormObjectControllerg($scope, $injector) {
export function FbFormObjectController($scope) {
  // var $builder = $injector.get('$builder');
  // it comes with the sourcecode but isn't used
  $scope.copyObjectToScope = function(object) {
    copyObjectToScope(object, $scope);
  };
  $scope.updateInput = function(value) {

    /*
    Copy current scope.input[X] to $parent.input.
    @param value: The input value.
    */
    var input;
    input = {
      id: $scope.formObject.id,
      label: $scope.formObject.label,
      value: value !== null ? value : ''
    };
    $scope.$parent.input.splice($scope.$index, 1, input);
  };
}
