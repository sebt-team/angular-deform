/*
    component:
        It is like a class.
        The base components are textInput, textArea, select, check, radio.
        User can custom the form with components.
    formObject:
        It is like an object (an instance of the component).
        User can custom the label, description, required and validation of the input.
    form:
        This is for end-user. There are form groups int the form.
        They can input the value to the form.
 */
var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  // -----------------------
  // BuilderProvider
  // -----------------------
export function BuilderProvider() {
  var $http, $injector, $templateCache;
  $injector = null;
  $http = null;
  $templateCache = null;
  this.config = {
    popoverPlacement: 'right'
  };
  this.components = {};
  this.groups = [];
  this.broadcastChannel = {
    updateInput: '$updateInput'
  };
  this.forms = {
    "default": []
  };
  this.convertComponent = function(name, component) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, result;
    result = {
      name: name,
      group: (ref = component.group) != null ? ref : 'Default',
      label: (ref1 = component.label) != null ? ref1 : '',
      description: (ref2 = component.description) != null ? ref2 : '',
      placeholder: (ref3 = component.placeholder) != null ? ref3 : '',
      editable: (ref4 = component.editable) != null ? ref4 : true,
      required: (ref5 = component.required) != null ? ref5 : false,
      validation: (ref6 = component.validation) != null ? ref6 : '/.*/',
      validationOptions: (ref7 = component.validationOptions) != null ? ref7 : [],
      options: (ref8 = component.options) != null ? ref8 : [],
      arrayToText: (ref9 = component.arrayToText) != null ? ref9 : false,
      template: component.template,
      templateUrl: component.templateUrl,
      popoverTemplate: component.popoverTemplate,
      popoverTemplateUrl: component.popoverTemplateUrl
    };
    if (!result.template && !result.templateUrl) {
      console.error("The template is empty.");
    }
    if (!result.popoverTemplate && !result.popoverTemplateUrl) {
      console.error("The popoverTemplate is empty.");
    }
    return result;
  };
  this.convertFormObject = function(name, formObject) {
    var component, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, result;
    if (formObject === null) {
      formObject = {};
    }
    component = this.components[formObject.component];
    if (component === null) {
      throw "The component " + formObject.component + " was not registered.";
    }
    result = {
      id: formObject.id,
      component: formObject.component,
      editable: (ref = formObject.editable) != null ? ref : component.editable,
      index: (ref1 = formObject.index) != null ? ref1 : 0,
      label: (ref2 = formObject.label) != null ? ref2 : component.label,
      description: (ref3 = formObject.description) != null ? ref3 : component.description,
      placeholder: (ref4 = formObject.placeholder) != null ? ref4 : component.placeholder,
      options: (ref5 = formObject.options) != null ? ref5 : component.options,
      required: (ref6 = formObject.required) != null ? ref6 : component.required,
      validation: (ref7 = formObject.validation) != null ? ref7 : component.validation
    };
    return result;
  };
  this.reindexFormObject = (function(_this) {
    return function(name) {
      var formObjects, i, index, ref;
      formObjects = _this.forms[name];
      for (index = i = 0, ref = formObjects.length; i < ref; index = i += 1) {
        formObjects[index].index = index;
      }
    };
  })(this);
  // this.setupProviders = (function(_this) {
  this.setupProviders = (function() {
    return function(injector) {
      $injector = injector;
      $http = $injector.get('$http');
      $templateCache = $injector.get('$templateCache');
    };
  })(this);
  this.loadTemplate = function(component) {

    /*
    Load template for components.
    @param component: {object} The component of $builder.
     */
    if (component.template == null) {
      $http.get(component.templateUrl, {
        cache: $templateCache
      }).success(function(template) {
        component.template = template;
      });
    }
    if (component.popoverTemplate == null) {
      $http.get(component.popoverTemplateUrl, {
        cache: $templateCache
      }).success(function(template) {
        component.popoverTemplate = template;
      });
    }
  };
  this.registerComponent = (function(_this) {
    return function(name, component) {
      var newComponent, ref;
      if (component == null) {
        component = {};
      }

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
          arrayToText: {bool} checkbox could use this to convert input (default is no)
          template: {string} html template
          templateUrl: {string} The url of the template.
          popoverTemplate: {string} html template
          popoverTemplateUrl: {string} The url of the popover template.
       */
      if (_this.components[name] == null) {
        newComponent = _this.convertComponent(name, component);
        _this.components[name] = newComponent;
        if ($injector != null) {
          _this.loadTemplate(newComponent);
        }
        if (ref = newComponent.group, indexOf.call(_this.groups, ref) < 0) {
          _this.groups.push(newComponent.group);
        }
      } else {
        console.info("The component " + name + " was registered.");
      }
    };
  })(this);
  this.addFormObject = (function(_this) {
    return function(name, formObject) {
      var base;
      if (formObject == null) {
        formObject = {};
      }

      /*
      Insert the form object into the form at last.
       */
      if ((base = _this.forms)[name] === null) {
        base[name] = [];
      }
      return _this.insertFormObject(name, _this.forms[name].length, formObject);
    };
  })(this);
  this.insertFormObject = (function(_this) {
    return function(name, index, formObject) {
      var base;
      if (formObject === null) {
        formObject = {};
      }

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
      if ((base = _this.forms)[name] === null) {
        base[name] = [];
      }
      if (index > _this.forms[name].length) {
        index = _this.forms[name].length;
      } else if (index < 0) {
        index = 0;
      }
      _this.forms[name].splice(index, 0, _this.convertFormObject(name, formObject));
      _this.reindexFormObject(name);
      return _this.forms[name][index];
    };
  })(this);
  this.removeFormObject = (function(_this) {
    return function(name, index) {

      /*
      Remove the form object by the index.
      @param name: The form name.
      @param index: The form object index.
       */
      var formObjects;
      formObjects = _this.forms[name];
      formObjects.splice(index, 1);
      return _this.reindexFormObject(name);
    };
  })(this);
  this.updateFormObjectIndex = (function(_this) {
    return function(name, oldIndex, newIndex) {

      /*
      Update the index of the form object.
      @param name: The form name.
      @param oldIndex: The old index.
      @param newIndex: The new index.
       */
      var formObject, formObjects;
      if (oldIndex === newIndex) {
        return;
      }
      formObjects = _this.forms[name];
      formObject = formObjects.splice(oldIndex, 1)[0];
      formObjects.splice(newIndex, 0, formObject);
      return _this.reindexFormObject(name);
    };
  })(this);
  this.$get = [
    '$injector', (function(_this) {
      return function($injector) {
        var component, name, ref;
        _this.setupProviders($injector);
        ref = _this.components;
        for (name in ref) {
          component = ref[name];
          _this.loadTemplate(component);
        }
        return {
          config: _this.config,
          components: _this.components,
          groups: _this.groups,
          forms: _this.forms,
          broadcastChannel: _this.broadcastChannel,
          registerComponent: _this.registerComponent,
          addFormObject: _this.addFormObject,
          insertFormObject: _this.insertFormObject,
          removeFormObject: _this.removeFormObject,
          updateFormObjectIndex: _this.updateFormObjectIndex
        };
      };
    })(this)
  ];
}
