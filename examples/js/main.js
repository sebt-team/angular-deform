angular.module('deformExamples', ['angularDeforms', 'angular-sweetnotifier', 'ngAnimate'])

.run([
  '$builder', function($builder) {
    $builder.registerComponent('sampleInput', {
      group: 'from html',
      label: 'File',
      description: 'Select a file',
      icon: 'fa fa-file-archive-o',
      required: false,
      validationOptions: [
        {label: 'none', rule: '/.*/'},
        {label: 'number', rule: '[number]'},
        {label: 'email', rule: '[email]'},
        {label: 'url', rule: '[url]'}
      ],
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      templateUrl: '../views/basic-template.html',
      popoverTemplateUrl: '../views/basic-popover-template.html'
    });
    return $builder.registerComponent('name', {
      group: 'Default',
      label: 'User',
      icon: 'fa fa-user',
      required: false,
      arrayToText: true,
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-md-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-md-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[0]\"\n                class=\"form-control\" id=\"{{formName+index}}-0\"/>\n            <p class='help-block'>First name</p>\n        </div>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[1]\"\n                class=\"form-control\" id=\"{{formName+index}}-1\"/>\n            <p class='help-block'>Last name</p>\n        </div>\n    </div>\n</div>",
      popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n        </label>\n    </div>\n\n    <hr/>\n    <div class='form-group'>\n        <input type='submit' ng-click=\"duplicate()\" class='btn btn-primary' value='Save'/>\n        <input type='button' ng-click=\"cancel()\" class='btn btn-default' value='Cancel'/>\n        <input type='button' ng-click=\"remove()\" class='btn btn-danger' value='Delete'/>\n    </div>\n</form>"
    });
  }
])

.config(['notifierProvider', function(notifierProvider) {
  //set position of notification
  //following placement value can be used
  //vertical:   top middle bottom
  //horizontal: left center right
  //top center by default
  notifierProvider.setPlacement('bottom', 'right');

  //use native notification while user leave this page for better UX
  //true by default
  notifierProvider.setUseNativeWhileBlur(false);

  //set icons for native notification
  //a key/value object is required
  //only info, error, warning, success as be used as key
  //no icon for native notification by default
  notifierProvider.setNativeIcons({
    info: 'http://findicons.com/files/icons/2166/oxygen/48/document_properties.png',
    error: 'http://findicons.com/files/icons/989/ivista_2/128/error.png',
    warning: 'http://findicons.com/files/icons/744/juicy_fruit/128/warning.png',
    success: 'http://findicons.com/files/icons/719/crystal_clear_actions/64/agt_action_success.png'
  });

  // DOC:
  // notification example:
  // notifier.emit({
  //   type: 'success',
  //   title: 'Success',
  //   content: 'User have been saved!'
  // });
}])

.controller('DemoController', [
  '$scope', '$builder', '$validator', 'notifier', function($scope, $builder, $validator, notifier) {
    var checkbox, textbox;
    textbox = $builder.addFormObject('default', {
      id: 'textbox',
      component: 'textInput',
      label: 'Name',
      description: 'Your name',
      placeholder: 'Your name',
      required: true,
      editable: false
    });
    checkbox = $builder.addFormObject('default', {
      id: 'checkbox',
      component: 'checkbox',
      label: 'Pets',
      description: 'Do you have any pets?',
      options: ['Dog', 'Cat']
    });
    $builder.addFormObject('default', {
      component: 'sampleInput'
    });
    $scope.form = $builder.forms['default'];
    $scope.input = [];
    $scope.defaultValue = {};
    $scope.defaultValue[textbox.id] = 'default value';
    $scope.defaultValue[checkbox.id] = [true, true];

    $scope.submit = function() {
      return $validator.validate($scope, 'default').success(function() {
        return console.log('success');
      }).error(function() {
        return console.log('error');
      });
    };

    $scope.$on($builder.broadcastChannel.selectInput, () => {
      $('a[data-target="#options"]').tab('show')
    });

  }
]);
