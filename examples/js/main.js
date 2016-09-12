angular.module('deformExamples', ['angularDeforms', 'validator', 'validator.rules'])

.run([
  '$builder', function($builder) {
    // $builder.registerComponent('sampleInput', {
    //   group: 'from html',
    //   label: 'File',
    //   description: 'Select a file',
    //   icon: 'fa fa-file-archive-o',
    //   required: false,
    //   validationOptions: [
    //     {label: 'none', rule: '/.*/'},
    //     {label: 'number', rule: '[number]'},
    //     {label: 'email', rule: '[email]'},
    //     {label: 'url', rule: '[url]'}
    //   ],
    //   showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
    //   templateUrl: '../views/basic-template.html',
    //   popoverTemplateUrl: '../views/basic-popover-template.html'
    // });
    // return $builder.registerComponent('name', {
    //   group: 'Default',
    //   label: 'User',
    //   icon: 'fa fa-user',
    //   required: false,
    //   arrayToText: true,
    //   showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
    //   template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-md-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-md-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[0]\"\n                class=\"form-control\" id=\"{{formName+index}}-0\"/>\n            <p class='help-block'>First name</p>\n        </div>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[1]\"\n                class=\"form-control\" id=\"{{formName+index}}-1\"/>\n            <p class='help-block'>Last name</p>\n        </div>\n    </div>\n</div>",
    //   popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n        </label>\n    </div>\n\n    <hr/>\n    <div class='form-group'>\n        <input type='submit' ng-click=\"duplicate()\" class='btn btn-primary' value='Save'/>\n        <input type='button' ng-click=\"cancel()\" class='btn btn-default' value='Cancel'/>\n        <input type='button' ng-click=\"remove()\" class='btn btn-danger' value='Delete'/>\n    </div>\n</form>"
    // });
  }
])

.config(function($validatorProvider) {
  $validatorProvider.register( 'maxPointsInOption', {
    validator: (value, scope, element, attrs, $injector) => {
      values = scope.$parent.options.map(function(o){return o.value})
      max = Math.max(...values)
      return max >= 100
    },
    error: "Al menos una opción debe tener el 100% de los puntos"
  });

  $validatorProvider.register( 'totalPoints', {
    invoke: 'submit',
    validator: (value, scope, element, attrs, $injector) => {
      values = scope.$parent.options.map(function(o){return o.value})
      total = values.reduce(function(memo, num){
        return memo+num
      });
      return total >= 100
    },
    error: "La suma de los porcentajes de las alternativas debe ser a lo menos del 100%"
  });

})

.controller('DemoController', [
  '$scope', '$builder', function($scope, $builder) {
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

    $scope.$on($builder.broadcastChannel.selectInput, function() {
      $('a[data-target="#options"]').tab('show')
    });

    // $('[data-toggle="tooltip"]').tooltip();

  }
]);
