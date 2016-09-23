let secretKey = '_' + Math.random().toString(36).substr(2, 9);
let randomNumber = Math.floor((Math.random() * 100000));

export class Utils {
  constructor() {}

  generateKey() {
    randomNumber++;
    return `${secretKey}${Date.now()}${randomNumber}`;
  }
}

export class Component {
  constructor(name, attributes) {
    let ref;

    this.name = name;
    this.group = (ref = attributes.group) != null ? ref : 'Default';
    this.label = (ref = attributes.label) != null ? ref : '';
    this.description = (ref = attributes.description) != null ? ref : '';
    this.placeholder = (ref = attributes.placeholder) != null ? ref : '';
    this.editable = (ref = attributes.editable) != null ? ref : true;
    this.required = (ref = attributes.required) != null ? ref : false;
    this.validation = (ref = attributes.validation) != null ? ref : '/.*/';
    this.validationOptions = (ref = attributes.validationOptions) != null ? ref : [];
    this.complexValues = (ref = attributes.complexValues) != null ? ref : [];
    this.options = (ref = attributes.options) != null ? ref : [];
    this.multipeChoice = (ref = attributes.multipeChoice) != null ? ref : false;
    this.display = (ref = attributes.display) != null ? ref : true;
    this.dependentFrom = (ref = attributes.dependentFrom) != null ? ref : {};
    this.template = attributes.template;
    this.templateUrl = attributes.templateUrl;
    this.showcaseTemplate = attributes.showcaseTemplate;
    this.icon = attributes.icon;
    this.popoverTemplate = attributes.popoverTemplate;
    this.popoverTemplateUrl = attributes.popoverTemplateUrl;
  }
}

export class FormObject {
  constructor(name, attributes, component) {
    let ref;

    this.id = attributes.id;
    this.key = (ref = attributes.key) != null ? ref : new Utils().generateKey();
    this.component = attributes.component;
    this.editable = (ref = attributes.editable) != null ? ref : component.editable;
    this.label = (ref = attributes.label) != null ? ref : component.label;
    this.description = (ref = attributes.description) != null ? ref : component.description;
    this.placeholder = (ref = attributes.placeholder) != null ? ref : component.placeholder;
    this.options = (ref = attributes.options) != null ? ref : component.options;
    this.required = (ref = attributes.required) != null ? ref : component.required;
    this.validation = (ref = attributes.validation) != null ? ref : component.validation;
    this.display = (ref = attributes.display) != null ? ref : component.display;
    this.dependentFrom = (ref = attributes.dependentFrom) != null ? ref : component.dependentFrom;
    this.complexValues = (ref = attributes.complexValues) != null ? ref : component.complexValues;
  }
}

export class Page {
  constructor() {
  }
}

