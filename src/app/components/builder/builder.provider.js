var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  // -----------------------
  // BuilderProvider
  // -----------------------
export function BuilderProvider() {
  var $injector = null, $http = null, $log = null, $templateCache = null;
  this.components = {};
  this.groups = [];
  this.forms = { 'default': [] }; // replace for map
  this.pages = [];
  this.dependencies = [];
  this.broadcastChannel = {
    selectInput: '$selectInput',
    updateInput: '$updateInput',
    saveInput: '$saveInput'
  };

  let current = {
    formObject: null,
    formObjectScope: null,
    formObjectElement: null,
    formName: null,
    page: null,
    form: this.forms['default']
  }
  let currentForm = this.forms['default'];
  let secretKey = '_' + Math.random().toString(36).substr(2, 9);
  let randomNumber = Math.floor((Math.random() * 100000));

  this.generateKey = ()=> {
    randomNumber++;
    return `${secretKey}${Date.now()}${randomNumber}`;
  }

  this.convertComponent = (name, component) => {
    let ref;
    let result = {
      name: name,
      group: (ref = component.group) != null ? ref : 'Default',
      label: (ref = component.label) != null ? ref : '',
      description: (ref = component.description) != null ? ref : '',
      placeholder: (ref = component.placeholder) != null ? ref : '',
      editable: (ref = component.editable) != null ? ref : true,
      required: (ref = component.required) != null ? ref : false,
      validation: (ref = component.validation) != null ? ref : '/.*/',
      validationOptions: (ref = component.validationOptions) != null ? ref : [],
      complexValues: (ref = component.complexValues) != null ? ref : [],
      options: (ref = component.options) != null ? ref : [],
      multipeChoice: (ref = component.multipeChoice) != null ? ref : false,
      dependentFrom: (ref = component.dependentFrom) != null ? ref : {},
      template: component.template,
      templateUrl: component.templateUrl,
      showcaseTemplate: component.showcaseTemplate,
      icon: component.icon,
      popoverTemplate: component.popoverTemplate,
      popoverTemplateUrl: component.popoverTemplateUrl
    };
    if (!result.template && !result.templateUrl)
      $log.error("The template is empty.");

    if (!result.popoverTemplate && !result.popoverTemplateUrl)
      $log.error("The popoverTemplate is empty.");

    return result;
  };

  this.convertFormObject = (name, formObject) => {
    formObject = formObject || {};
    let ref;
    let component = this.components[formObject.component];
    if (component == null) {
      throw "The component " + formObject.component + " was not registered.";
    }

    let result = {
      id: formObject.id,
      key: (ref = formObject.key) != null ? ref : this.generateKey(),
      component: formObject.component,
      editable: (ref = formObject.editable) != null ? ref : component.editable,
      label: (ref = formObject.label) != null ? ref : component.label,
      description: (ref = formObject.description) != null ? ref : component.description,
      placeholder: (ref = formObject.placeholder) != null ? ref : component.placeholder,
      options: (ref = formObject.options) != null ? ref : component.options,
      required: (ref = formObject.required) != null ? ref : component.required,
      validation: (ref = formObject.validation) != null ? ref : component.validation,
      dependentFrom: (ref = formObject.dependentFrom) != null ? ref : component.dependentFrom,
      complexValues: (ref = formObject.complexValues) != null ? ref : component.complexValues
    };
    return result;
  };

  this.reindexFormObject = (name) => {
    var formObjects, i, index, ref;
    formObjects = this.forms[name];
    for (index = i = 0, ref = formObjects.length; i < ref; index = i += 1) {
      formObjects[index].index = index;
    }
  };

  this.setupProviders = (injector) => {
    $injector = injector;
    $http = $injector.get('$http');
    $templateCache = $injector.get('$templateCache');
    $log = $injector.get('$log');
  };

  this.loadTemplate = (component) => {
    if (component.template == null) {
      $http.get(component.templateUrl, {
        cache: $templateCache
      }).success((template) => {
        component.template = template;
      });
    }
    if (component.popoverTemplate == null) {
      $http.get(component.popoverTemplateUrl, {
        cache: $templateCache
      }).success((template) => {
        component.popoverTemplate = template;
      });
    }
  };

  this.copyObjectToScope = (object, scope) => {
    // Copy object (ng-repeat="object in objects") to scope without `hashKey`.
    var key, value;
    for (key in object) {
      value = object[key];
      if (key !== '$$hashKey') {
        scope[key] = value;
      }
    }
  }

  this.registerComponent = (name, component) => {
    if (component == null)
      component = {};

    /*
    Register the component for form-builder.
    @param name: The component name.
    @param component: The component object.
        group: {string} The component group.
        label: {string} The label of the input.
        description: {string} The description of the input.
        placeholder: {string} The placeholder of the input.
        editable: {bool} Is the form object editable?
        required: {bool} Is the form object required?
        validation: {string} angular-validator. "/regex/" or "[rule1, rule2]". (default is RegExp(.*))
        validationOptions: {array} [{rule: angular-validator, label: 'option label'}] the options for the validation. (default is [])
        options: {array} The input options.
        multipeChoice: {bool} checkbox could use this to convert input (default is no)
        template: {string} html template
        templateUrl: {string} The url of the template.
        popoverTemplate: {string} html template
        popoverTemplateUrl: {string} The url of the popover template.
     */
    if (this.components[name] == null) {
      let newComponent = this.convertComponent(name, component);
      this.components[name] = newComponent;

      if ($injector != null)
        this.loadTemplate(newComponent);
      if (newComponent.group, indexOf.call(this.groups, newComponent.group) < 0)
        this.groups.push(newComponent.group);

    } else {
      $log.info("The component " + name + " was registered.");
    }
  };

  this.addFormObject = (name, formObject) => {
    if (formObject == null)
        formObject = {};
    // insert the form object into the form at last.
    let base;
    if ((base = this.forms)[name] == null)
      base[name] = [];

    return this.insertFormObject(name, this.forms[name].length, formObject);
  };

  this.getCurrentFormObject = () => {
    return current.formObject;
  }

  this.selectCurrentFormObject = (formName, formObject, element, objectScope) => {
    current.formName = formName;
    current.form = this.forms[formName];
    current.formObject = angular.copy(formObject);
    current.formObjectScope = objectScope;

    if(current.formObjectElement)
      current.formObjectElement.removeClass('active');

    current.formObjectElement = element
    current.formObjectElement.addClass('active');
  }

  this.updateFormObjectScope = (formObject, objectScope) => {
    objectScope = objectScope || current.formObjectScope;
    this.copyObjectToScope(formObject, objectScope);
  }

  this.addForm = (name) => {
    if(!this.forms[name])
      this.forms[name] = [];
    return this.forms[name];
  }

  this.getCurrentPage = () => {
    return current.page;
  }

  this.selectCurrentPage = (index) => {
    return current.page = this.pages[index];
  }

  this.addPage = () => {
    let pageNumber = this.pages.length;
    let page = {
      title: `Page ${pageNumber + 1}`,
      description: `Description number ${pageNumber + 1}`,
      index: pageNumber,
      formName: `form${pageNumber}`,
      form: {
        name: `form${pageNumber}`,
        content: this.addForm(`form${pageNumber}`)
      }
    };
    this.pages.push(page);
    this.selectCurrentPage(pageNumber);
    return page;
  }

  this.insertFormObject = (name, index, formObject) => {

    if (formObject == null)
      formObject = {};

    /*
    Insert the form object into the form at {index}.
    @param name: The form name.
    @param index: The form object index.
    @param form: The form object.
        id: The form object id.
        component: {string} The component name
        editable: {bool} Is the form object editable? (default is yes)
        label: {string} The form object label.
        description: {string} The form object description.
        placeholder: {string} The form object placeholder.
        options: {array} The form object options.
        required: {bool} Is the form object required? (default is no)
        validation: {string} angular-validator. "/regex/" or "[rule1, rule2]".
        [index]: {int} The form object index. It will be updated by $builder.
    @return: The form object.
     */
    let base;
    if ((base = this.forms)[name] == null)
      base[name] = [];

    if (index > this.forms[name].length) {
      index = this.forms[name].length;
    } else if (index < 0) {
      index = 0;
    }

    this.forms[name].splice(index, 0, this.convertFormObject(name, formObject));
    this.reindexFormObject(name);
    // this.addAnswerDependency(formObject, answer);
    return this.forms[name][index];
  };

  this.removeFormObject = (name, index) => {
    /*
    Remove the form object by the index.
    @param name: The form name.
    @param index: The form object index.
     */
    name = name || current.formName
    index = index || current.formObject.index;
    let formObjects = this.forms[name];
    formObjects.splice(index, 1);

    if(!formObjects.length)
      if(current.page)
        if(current.page.form.name == current.formName)
          current.formObject = undefined;

    return this.reindexFormObject(name);
  };

  this.duplicateFormObject = (name, formObject) => {
    name = name || current.formName
    formObject = formObject || current.formObject

    let index = formObject.index
    let formObjects = this.forms[name];
    formObjects.splice(index, 0, angular.copy(formObject));

    return this.reindexFormObject(name);
  }

  this.updateFormObjectIndex = (name, oldIndex, newIndex) => {
    /*
    Update the index of the form object.
    @param name: The form name.
    @param oldIndex: The old index.
    @param newIndex: The new index.
     */
    if (oldIndex == newIndex)
      return;

    let formObjects = this.forms[name];
    let formObject = formObjects.splice(oldIndex, 1)[0];
    formObjects.splice(newIndex, 0, formObject);
    return this.reindexFormObject(name);
  };

  this.addAnswerDependency = (formObject, formObjectHandler, formAnswer) => {
    this.removeAnswerDependency(formObject);
    this.dependencies.push({
      formObjectTargetKey: formObject.key,
      formObjectKey: formObjectHandler,
      formAnswerKey: formAnswer
    });
  };

  this.removeAnswerDependency = (formObject) => {
    this.dependencies.forEach((d, index) => {
      if(d.formObject.key == formObjectTargetKey) {
        formObject.dependentFrom = {};
        this.dependencies.splice(index, 1);
      }
    });
  }

  this.findDependencyTargets = (formObjectKey) => {
    return this.dependencies.filter( d => {
      return d.formObjectKey == formObjectKey;
    }).map( d => {
      return this.findFormObjectByKey(d.formObjectTargetKey)
    });
  }

  this.findFormObjectByKey = (key) => {
    let selectedFormObject = Object.keys(this.forms).reduce((sum, key) => {
      sum = sum.concat(this.forms[key]);
      return sum;
    }, []).filter(fo => { return fo.key == key; })[0];
    return selectedFormObject || false
  }

  this.$get = [
    '$injector', function($injector) {
      this.setupProviders($injector);
      let components = this.components;
      for (let name in components) {
        let component = components[name];
        this.loadTemplate(component);
      }
      return {
        config: this.config,
        components: this.components,
        groups: this.groups,
        forms: this.forms,
        pages: this.pages,
        dependencies: this.dependencies,
        addPage: this.addPage,
        getCurrentPage: this.getCurrentPage,
        selectCurrentPage: this.selectCurrentPage,
        addForm: this.addForm,
        getCurrentFormObject: this.getCurrentFormObject,
        selectCurrentFormObject: this.selectCurrentFormObject,
        updateFormObjectScope: this.updateFormObjectScope,
        addFormObject: this.addFormObject,
        insertFormObject: this.insertFormObject,
        removeFormObject: this.removeFormObject,
        duplicateFormObject: this.duplicateFormObject,
        updateFormObjectIndex: this.updateFormObjectIndex,
        addAnswerDependency: this.addAnswerDependency,
        removeAnswerDependency: this.removeAnswerDependency,
        findDependencyTargets: this.findDependencyTargets,
        findFormObjectByKey: this.findFormObjectByKey,
        broadcastChannel: this.broadcastChannel,
        registerComponent: this.registerComponent,
        copyObjectToScope: this.copyObjectToScope,
        generateKey: this.generateKey
      };
    }
  ];
}
