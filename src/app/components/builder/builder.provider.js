// TODO LIST:
// 1. Replace main js object from ES Class
// 2. Replace forms and arrays for ES Map

var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
// -----------------------
// BuilderProvider
// -----------------------

import { Utils }         from './builder.classes';
import { Component }     from './builder.classes';
import { FormObject }    from './builder.classes';
import { Page }          from './builder.classes';
import { Tag }           from './builder.classes';

export function BuilderProvider() {

  // Constants
  const displayTypes = Object.freeze({
    SINGLE: 'SINGLE',
    WIZARD: 'WIZARD'
  });

  var $injector = null, $http = null, $log = null, $templateCache = null;
  this.components = {};
  this.forms = { 'default': [] }; // replace for map
  this.pages = [];
  this.tags = [];
  this.groups = [];
  this.dependencies = [];
  this.broadcastChannel = {
    selectPage: '$selectPage',
    selectInput: '$selectInput',
    updateInput: '$updateInput',
    saveInput: '$saveInput',
    changeWizardStep: '$changeWizardStep',
    changeFormInputEvent: '$changeFormInputEvent'
  };

  let display = displayTypes.SINGLE;
  let current = {
    formObject: null,
    formObjectScope: null,
    formObjectElement: null,
    formName: null,
    page: null,
    form: this.forms['default']
  }

  this.convertComponent = (name, component) => {
    let result = new Component(name, component);

    if (!result.template && !result.templateUrl)
      $log.error("The template is empty.");

    if (!result.popoverTemplate && !result.popoverTemplateUrl)
      $log.error("The popoverTemplate is empty.");

    return result;
  };

  this.convertFormObject = (name, formObject) => {
    formObject = formObject || {};
    let component = this.components[formObject.component];
    if (component == null) {
      throw "The component " + formObject.component + " was not registered.";
    }

    let result = new FormObject(name, formObject, component)
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
      // $log.info("The component " + name + " was registered.");
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

  this.addPage = (page) => {
    let pageNumber = this.pages.length;

    page = page || {};
    page.index = page.index || pageNumber;
    page.formReference = page.formReference || ('form' + pageNumber);
    page.components = this.addForm('form' + pageNumber);

    this.insertPage(page, pageNumber);
  }

  this.removePage = function(pageKey) {
    var index = this.pages.findIndex(function (page) {
      return page.key == pageKey;
    });
    if(this.pages.length > 1) {
      this.pages.splice(index, 1);
      if(index > this.getCurrentPage().index)
        this.selectCurrentPage(index-1);
      else
        this.selectCurrentPage(index+1);
    } else {
      $log.error("Cant delete the first page.");
    }
  };

  this.insertPage = (page, pageNumber) => {
    page = new Page(page);
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

  this.addTag = (tag) => {
    tag = new Tag(tag);
    this.tags.push(new Tag(tag));
    return tag;
  }

  this.removeTag = (tagKey) => {
    let index = this.tags.findIndex(tag => tag.key == tagKey)
    this.tags.splice(index, 1);
  }

  this.addAnswerDependency = (formObject, formObjectHandler, formAnswer) => {
    this.removeAnswerDependency(formObject);
    formObject.display = false;
    this.dependencies.push({
      formObjectTargetKey: formObject.key,
      formObjectKey: formObjectHandler,
      formAnswerKey: formAnswer
    });
  };

  this.removeAnswerDependency = (formObject, deepDestroy = false) => {
    formObject.display = true;
    this.dependencies.forEach((d, index) => {
      if(d.formObjectTargetKey == formObject.key) {
        this.dependencies.splice(index, 1);
        if(deepDestroy) formObject.dependentFrom = {};
      }
    });
  }

  this.removeAnswerDependencybyTarget = (formObject) => {
    let dependentTargets = this.findDependencyTargets(formObject.key)
    if(!dependentTargets.length) return false;

    dependentTargets.forEach( dependentFormObject => {
      this.removeAnswerDependency(dependentFormObject, true);
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

  this.findPageByFormObjectKey = (key) => {
    let selectedPage = this.pages.find((page) => {
      let selectedComponent = page.components.find((component) => {
        return component.key == key;
      });
      return selectedComponent;
    });
    return selectedPage || false;
  }

  this.setDisplay = (displayType) => {
    if(displayType == displayTypes.SINGLE || displayType == displayTypes.WIZARD) {
      display = displayType
      if(display == displayTypes.SINGLE)
        this.selectCurrentPage(0);
    }
    else
      $log.error("The display type is not permited");
  }

  this.getDisplay = () => {
    return display;
  }

  this.setupDefaults = (defaultValues) => {
    this.pages.length = 0;
    this.dependencies.length = 0;
    this.forms = {};

    display = defaultValues.display || display;
    this.tags = defaultValues.tags || this.tags;

    if(defaultValues.components) {
      if(display == displayTypes.WIZARD) {
        defaultValues.components.forEach((page) => {
          let formObjects = angular.copy(page.components);
          this.addPage(page);
          formObjects.forEach((formObject) => {
            this.addFormObject(page.formReference, formObject);
          });
        });
      }
      if(display == displayTypes.SINGLE) {
        this.addPage();
        defaultValues.components.forEach((formObject) => {
          this.addFormObject(this.pages[0].formReference, formObject);
        });
      }
    }

    if (defaultValues.dependencies.length)
      defaultValues.dependencies.forEach(function (d) {
        let formObject = _this.findFormObjectByKey(d.formObjectTargetKey);
        _this.addAnswerDependency(formObject, d.formObjectKey, d.formAnswerKey);
      });
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
        // Objects & Arrays
        forms: this.forms,
        pages: this.pages,
        groups: this.groups,
        tags: this.tags,
        dependencies: this.dependencies,
        components: this.components,
        // Pages handlers
        addPage: this.addPage,
        removePage: this.removePage,
        getCurrentPage: this.getCurrentPage,
        selectCurrentPage: this.selectCurrentPage,
        findPageByFormObjectKey: this.findPageByFormObjectKey,
        // Form Objects handlers
        addForm: this.addForm,
        getCurrentFormObject: this.getCurrentFormObject,
        selectCurrentFormObject: this.selectCurrentFormObject,
        updateFormObjectScope: this.updateFormObjectScope,
        addFormObject: this.addFormObject,
        insertFormObject: this.insertFormObject,
        removeFormObject: this.removeFormObject,
        duplicateFormObject: this.duplicateFormObject,
        updateFormObjectIndex: this.updateFormObjectIndex,
        findFormObjectByKey: this.findFormObjectByKey,
        // Tags handlers
        addTag: this.addTag,
        removeTag: this.removeTag,
        // Dependencies hadlers
        addAnswerDependency: this.addAnswerDependency,
        removeAnswerDependency: this.removeAnswerDependency,
        removeAnswerDependencybyTarget: this.removeAnswerDependencybyTarget,
        findDependencyTargets: this.findDependencyTargets,
        // Display handlers
        setDisplay: this.setDisplay,
        getDisplay: this.getDisplay,
        displayTypes: displayTypes,
        // Components HANDLERS
        registerComponent: this.registerComponent,
        // Other utils functions
        broadcastChannel: this.broadcastChannel,
        copyObjectToScope: this.copyObjectToScope,
        generateKey: new Utils().generateKey(),
        setupDefaults: this.setupDefaults
      };
    }
  ];
}
