export function ComponentsBuilder($builderProvider) {
    $builderProvider.registerComponent('textInput', {
      group: 'Default',
      label: 'Text Input',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'fa fa-font',
      required: false,
      validationOptions: [
        {label: 'none',   rule: '/.*/'},
        {label: 'number', rule: '[number]'},
        {label: 'email',  rule: '[email]'},
        {label: 'url',    rule: '[url]'}
      ],
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-sm-8\">\n        <input type=\"text\" ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\" id=\"{{formName+index}}\" class=\"form-control\" placeholder=\"{{placeholder}}\"/>\n        <p class='help-block'>{{description}}</p>\n    </div>\n</div>",
      popoverTemplateUrl: 'app/components/builder/templates/editable_components/text.html'
    });
    $builderProvider.registerComponent('textArea', {
      group: 'Default',
      label: 'Text Area',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'fa fa-text-width',
      required: false,
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-sm-8\">\n        <textarea type=\"text\" ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\" id=\"{{formName+index}}\" class=\"form-control\" rows='6' placeholder=\"{{placeholder}}\"/>\n        <p class='help-block'>{{description}}</p>\n    </div>\n</div>",
      popoverTemplateUrl: 'app/components/builder/templates/editable_components/textarea.html'
    });
    $builderProvider.registerComponent('checkbox', {
      group: 'Default',
      label: 'Checkbox',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'fa fa-check-square-o',
      required: false,
      complexValues: true,
      options: [{text: 'Value one'}, {text: 'Value two'}],
      multipeChoice: true,
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-sm-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class='checkbox' ng-repeat=\"item in options track by $index\">\n            <label><input type='checkbox' ng-model=\"$parent.inputArray[$index]\" ng-true-value=\"'{{item.key}}'\" ng-false-value=\"false\" />\n                {{item.text}}\n            </label>\n        </div>\n        <p class='help-block'>{{description}}</p>\n    </div>\n</div>",
      popoverTemplateUrl: 'app/components/builder/templates/editable_components/checkbox.html'
    });
    $builderProvider.registerComponent('radio', {
      group: 'Default',
      label: 'Radio',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'fa fa-list-ul',
      required: false,
      complexValues: true,
      options: [{text: 'Value one'}, {text: 'Value two'}],
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-sm-8\">\n        <div class='radio' ng-repeat=\"item in options track by $index\">\n            <label><input name='{{formName+index}}' ng-model=\"$parent.inputText\" validator-group=\"{{formName}}\" value='{{item.key}}' type='radio'/>\n                {{item.text}}\n            </label>\n        </div>\n        <p class='help-block'>{{description}}</p>\n    </div>\n</div>",
      popoverTemplateUrl: 'app/components/builder/templates/editable_components/radio.html'
    });
    $builderProvider.registerComponent('select', {
      group: 'Default',
      label: 'Select',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'fa fa-list-alt',
      required: false,
      complexValues: true,
      options: [{text: 'Value one'}, {text: 'Value two'}],
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\">{{label}}</label>\n    <div class=\"col-sm-8\">\n        <select ng-options=\"value.key as value.text for value in options\" id=\"{{formName+index}}\" class=\"form-control\"\n ng-model=\"inputText\" ng-init=\"inputText = inputText || options[0]\"><option value=''> - <option> </select> <p class='help-block'>{{description}}</p>\n    </div>\n</div>",
      popoverTemplateUrl: 'app/components/builder/templates/editable_components/select.html'
    });
  }
