export function ConfigBuilder($logProvider, $builderProvider) {
    'ngInject';
    // Enable log
    $logProvider.debugEnabled(true);

    $builderProvider.registerComponent('textInput', {
      group: 'Default',
      label: 'Text Input',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'glyphicon glyphicon-font',
      required: false,
      validationOptions: [
        {label: 'none',   rule: '/.*/'},
        {label: 'number', rule: '[number]'},
        {label: 'email',  rule: '[email]'},
        {label: 'url',    rule: '[url]'}
      ],
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      templateUrl: "app/components/builder/templates/form_objects/textInput.html",
      popoverTemplateUrl: "app/components/builder/templates/editable_components/textInput.html"
    });
    $builderProvider.registerComponent('textArea', {
      group: 'Default',
      label: 'Text Area',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'glyphicon glyphicon-text-width',
      required: false,
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      templateUrl: "app/components/builder/templates/form_objects/textArea.html",
      popoverTemplateUrl: "app/components/builder/templates/editable_components/textArea.html"
    });
    $builderProvider.registerComponent('checkbox', {
      group: 'Default',
      label: 'Checkbox',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'glyphicon glyphicon-ok',
      required: false,
      randomize: false,
      complexValues: true,
      options: [{text: 'Set option 1 text'}, {text: 'Set option 2 text'}],
      multipeChoice: true,
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      templateUrl: "app/components/builder/templates/form_objects/checkbox.html",
      popoverTemplateUrl: 'app/components/builder/templates/editable_components/checkbox.html'
    });
    $builderProvider.registerComponent('radio', {
      group: 'Default',
      label: 'Radio',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'glyphicon glyphicon-list',
      required: false,
      complexValues: true,
      options: [{text: 'Set option 1 text'}, {text: 'Set option 2 text'}],
      handleDependencies: true,
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      templateUrl: "app/components/builder/templates/form_objects/radio.html",
      popoverTemplateUrl: 'app/components/builder/templates/editable_components/radio.html'
    });
    $builderProvider.registerComponent('select', {
      group: 'Default',
      label: 'Select',
      description: 'description',
      placeholder: 'placeholder',
      icon: 'glyphicon glyphicon-th-list',
      required: false,
      complexValues: true,
      options: [{text: 'Set option 1 text'}, {text: 'Set option 2 text'}],
      handleDependencies: true,
      showcaseTemplate: "<i class='{{icon}}'></i> <span>{{label}}</span>",
      templateUrl: "app/components/builder/templates/form_objects/select.html",
      popoverTemplateUrl: 'app/components/builder/templates/editable_components/select.html'
    });
  }
