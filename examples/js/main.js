// SAMPLE APP ========================================
angular.module('deformExamples', [
  'angularDeforms',
  'validator',
  'validator.rules',
  'ui.router',
  'ngTagsInput',
  'ngJsonExplorer'
])
// RUN SAMPLE APP ========================================
.run(['$builder', function($builder) {
  // register new custom component on inputs section
  return $builder.registerComponent('name', {
    group: 'Default',
    label: 'User',
    icon: 'glyphicon glyphicon-user',
    required: false,
    arrayToText: true,
    showcaseTemplate: "<i class='{{icon}}'></i><span>{{label}}</span>",
    template: "<div class='form-group'><label for='{{formName+index}}' class='col-md-4 control-label' ng-class='{'fb-required':required}'>{{label}}</label><div class='col-md-8'><input type='hidden' ng-model='inputText' validator-required='{{required}}' validator-group='{{formName}}'/><div class='col-sm-6' style='padding-left: 0;'><input type='text' ng-model='inputArray[0]' class='form-control' id='{{formName+index}}-0'/><p class='help-block'>First name</p></div><div class='col-sm-6' style='padding-left: 0;'><input type='text' ng-model='inputArray[1]' class='form-control' id='{{formName+index}}-1'/><p class='help-block'>Last name</p></div></div></div>",
    popoverTemplate: "<form><div class='form-group'><label class='control-label'>Label</label><input type='text' ng-model='label' validator='[required]' class='form-control'/></div><div class='checkbox'><label><input type='checkbox' ng-model='required' />Required</label></div><hr/><div class='form-group'><a ng-click='duplicate()' class='btn btn-primary'> Duplicate </a><a ng-click='cancel()' class='btn btn-default'> Cancel </a><a ng-click='remove()' class='btn btn-danger'> Delete </a></div></form>"
  });
  }
])

// CONFIG ROUTER FOR THE SAMLE APP ========================================
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  // default router
  $urlRouterProvider.otherwise('/builder');

  $stateProvider
    .state('builder', {
      url: '/builder',
      templateUrl: '/partial-builder.html'
    })
    .state('render', {
      url: '/render',
      templateUrl: '/partial-render.html'
    });
  }
])

.config(['$validatorProvider', function($validatorProvider) {
  // adds custom validaions from point sections
  $validatorProvider.register( 'maxPointsInOption', {
    validator: function(value, scope, element, attrs, $injector) {
      values = scope.$parent.options.map(function(o){return o.value})
      max = Math.max.apply(null, values);
      return max >= 100
    },
    error: "Al menos una opción debe tener el 100% de los puntos"
  });
  // adds custom validaions from point sections
  $validatorProvider.register( 'totalPoints', {
    invoke: 'submit',
    validator: function(value, scope, element, attrs, $injector){
      values = scope.$parent.options.map(function(o){return o.value})
      total = values.reduce(function(memo, num){
        return memo+num
      });
      return total >= 100
    },
    error: "La suma de los porcentajes de las alternativas debe ser a lo menos del 100%"
  });
}])

.controller('DemoController', ['$scope', '$builder', '$q', function($scope, $builder, $q) {
    // var checkbox, textbox;
    // textbox = $builder.addFormObject('default', {
    //   id: 'textbox',
    //   component: 'textInput',
    //   label: 'Name',
    //   description: 'Your name',
    //   placeholder: 'Your name',
    //   required: true,
    //   editable: false
    // });
    // checkbox = $builder.addFormObject('default', {
    //   id: 'checkbox',
    //   component: 'checkbox',
    //   label: 'Pets',
    //   description: 'Do you have any pets?',
    //   options: ['Dog', 'Cat']
    // });
    // $builder.addFormObject('default', {
    //   component: 'sampleInput'
    // });
    // $scope.form = $builder.forms['default'];
    // $scope.input = [];
    // $scope.defaultValue = {};
    // $scope.defaultValue[textbox.id] = 'default value';
    // $scope.defaultValue[checkbox.id] = [true, true];

    // $scope.submit = function() {
    //   return $validator.validate($scope, 'default').success(function() {
    //     return console.log('success');
    //   }).error(function() {
    //     return console.log('error');
    //   });
    // };

    $scope.form = undefined;
    $scope.formDisplay = 'single';
    $scope.tags = angular.copy($builder.tags);

    $scope.$on($builder.broadcastChannel.selectInput, function() {
      $('a[data-target="#options"]').tab('show')
    });

    $scope.$on($builder.broadcastChannel.selectPage, function() {
      $('a[data-target="#page"]').tab('show')
    });

    $scope.$on($builder.broadcastChannel.changeWizardStep, function(event, stepIndex) {
    });

    $scope.changeFormBuilderDisplay = function(display) {
      if(display == 'single')
        $builder.setDisplay($builder.displayTypes.SINGLE)
      else if(display == 'wizard')
        $builder.setDisplay($builder.displayTypes.WIZARD)
    }

    $scope.addTag = function(tag) {
      var builderTag = $builder.addTag(tag);
      tag.key = builderTag.key;
    }

    $scope.removetag = function(tag) {
      $builder.removeTag(tag.key);
    }

    $scope.submitForm = function(responses, form, isLastStep) {
      debugger;
      var deferred = $q.defer();
      setTimeout(function() {
        deferred.resolve();
        //deferred.reject();
      }, 1000);

      return deferred.promise;
    }

  }
]);
