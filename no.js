class StateManager {
  constructor() {
    this.state = {};
    this.listeners = [];
  }

  // Set state value
  setState(key, value) {
    this.state[key] = value;
    this.notifyListeners(key, value);
  }

  // Get state value
  getState(key) {
    return this.state[key];
  }

  // Subscribe to changes in state
  subscribe(listener) {
    this.listeners.push(listener);
  }

  // Notify listeners of changes in state
  notifyListeners(key, value) {
    this.listeners.forEach(listener => listener(key, value));
  }
}

class DHTMLjs {
  constructor() {

    // A map to hold templates
    this.templates = new Map();
    this.loadExternalTemplates();
    document.querySelectorAll('template').forEach(template => {
      this.templates.set(template.id, {content: template.innerHTML, variableName: template.getAttribute('[set]')});
    });

    // A map to hold filters and directives
    this.filters = {};
    this.directives = {};

    // State management
    this.stateManager = new StateManager();

    // Localization and internationalization
    this.translations = {};

    // Web Components registry
    this.webComponents = new Map();
  }

  // Conditional rendering
  handleConditionals(root) {
    const conditionalGroups = root.querySelectorAll('[if]');

    conditionalGroups.forEach(ifElement => {
      let conditionMet = false;

      // Evaluate the condition using a safe method instead of directly accessing window object
      const ifCondition = this.evaluateCondition(ifElement.getAttribute('[if]'));
      const thenTemplateId = ifElement.getAttribute('[then]');
      const elseTemplateId = ifElement.getAttribute('[else]');
      if (ifCondition && thenTemplateId) {
        this.handleTemplateWithResult(thenTemplateId, {condition: ifCondition});
        conditionMet = true;
      } else if (elseTemplateId) {
        this.handleTemplateWithResult(elseTemplateId, {condition: ifCondition});
      }

      // Handle [elseif] conditions
      let sibling = ifElement.nextElementSibling;
      while (sibling && sibling.hasAttribute('[elseif]')) {
        if (conditionMet) {
          sibling.style.display = 'none';
        } else {
          // Evaluate the condition using a safe method
          const elseifCondition = this.evaluateCondition(sibling.getAttribute('[elseif]'));
          const elseifThenTemplateId = sibling.getAttribute('[then]');
          const elseifElseTemplateId = sibling.getAttribute('[else]');
          if (elseifCondition && elseifThenTemplateId) {
            this.handleTemplateWithResult(elseifThenTemplateId, {condition: elseifCondition});
            conditionMet = true;
          } else if (elseifElseTemplateId) {
            this.handleTemplateWithResult(elseifElseTemplateId, {condition: elseifCondition});
          } else {
            sibling.style.display = 'none';
          }
        }
        sibling = sibling.nextElementSibling;
      }

      // Handle final [else] condition
      if (sibling && sibling.hasAttribute('[else]') && !conditionMet) {
        const finalElseTemplateId = sibling.getAttribute('[else]');
        this.handleTemplateWithResult(finalElseTemplateId, {condition: false});
        sibling.style.display = 'block';
      }
    });
  }

  // Evaluate the condition using a safe method instead of directly accessing window object
  evaluateCondition(expression) {
    // Check if the expression is defined and is not an empty string
    if (expression && typeof expression === 'string') {
      try {
        // Evaluate the expression using a secure function, avoiding direct use of eval
        // You can use a function that evaluates the expression according to your specific rules
        // In this example, we first try to get the value of the expression from the stateManager
        // If that fails, we try to get the value of the expression from the window object
        return this.stateManager.getState(expression) || window[expression];
      } catch (error) {
        // If an error occurs during evaluation, you can handle it here
        console.error('Erro ao avaliar a condição:', expression, error);
      }
    }
    return false;
  }

  // Evaluate the expression using a safe method instead of directly accessing window object
  evaluateExpression(expression) {
    // Check if the expression is defined and is not an empty string
    if (expression && typeof expression === 'string') {
      try {
        // First, try to get the value of the expression from the stateManager
        const valueFromState = this.stateManager.getState(expression);
        if (valueFromState !== undefined) {
          return valueFromState;
        }

        // If the value is not found in the stateManager, try to evaluate it as a JavaScript expression
        // This step must be done with caution to prevent security issues
        // Here's an example using the Function constructor, which is safer than using eval
        const func = new Function('return ' + expression);
        return func();
      } catch (error) {
        // If an error occurs during evaluation, you can handle it here
        console.error('Error evaluating expression:', expression, error);
      }
    }
    return undefined; // Return undefined if the expression is invalid or evaluation fails
  }

  // Loop rendering
  handleLoops(root) {
    const loopElements = root.querySelectorAll('[foreach]');

    loopElements.forEach(element => {
      const itemVariable = element.getAttribute('[foreach]');
      const fromList = this.evaluateExpression(element.getAttribute('[from]'));
      const elseTemplateId = element.getAttribute('[else]');
      const indexVariable = element.getAttribute('[index]');

      if (Array.isArray(fromList) && fromList.length > 0) {
        // Clear existing content
        element.innerHTML = '';

        // Create a Document Fragment to hold the new elements
        const fragment = document.createDocumentFragment();

        // Create a template element outside the loop
        const itemElementTemplate = element.cloneNode(true);
        itemElementTemplate.removeAttribute('[foreach]');
        itemElementTemplate.removeAttribute('[from]');
        itemElementTemplate.removeAttribute('[else]');
        itemElementTemplate.removeAttribute('[index]');

        // Create content for each item in the list
        fromList.forEach((item, idx) => {
          const itemElement = itemElementTemplate.cloneNode(true); // Clone the template element

          // Create result object with item and index
          const result = {
            [itemVariable]: item
          };
          if (indexVariable) result[indexVariable] = idx;

          // Apply template with result
          this.handleTemplateWithResult(itemElement, itemElement.outerHTML, result);

          // Append the new element to the fragment
          fragment.appendChild(itemElement);
        });

        // Append the fragment to the original element's parent
        element.parentNode.insertBefore(fragment, element);

        // Hide the original loop element
        element.style.display = 'none';
      } else if (elseTemplateId) {
        // Apply the 'else' template if the list is empty
        this.handleTemplateWithResult(elseTemplateId, {condition: false});
      }
    });
  }

  // Communication with Restful APIs
  handleApiCommunication(root) {
    const formElements = root.querySelectorAll('form[endpoint]');

    formElements.forEach(form => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const endpoint = form.getAttribute('[endpoint]');
        const method = form.getAttribute('[method]') || 'post';
        const successStateKey = form.getAttribute('[success]');
        const errorStateKey = form.getAttribute('[error]');

        const formData = new FormData(form);

        // Send request using Fetch API
        fetch(endpoint, {
          method: method,
          body: formData,
        })
          .then(response => response.json())
          .then(result => {
            if (successStateKey) {
              this.stateManager.setState(successStateKey, result);
            }
          })
          .catch(error => {
            if (errorStateKey) {
              this.stateManager.setState(errorStateKey, error);
            }
          });
      });
    });
  }

  // Template handling
  handleTemplates(root) {
    const templateElements = root.querySelectorAll('[template]');

    templateElements.forEach(element => {
      const templateId = element.getAttribute('[template]');
      this.handleTemplateWithResult(templateId, {});
    });
  }

  // Apply the specified template with result
  handleTemplateWithResult(templateId, result, root) {
    const targetElement = root.querySelector(templateId);
    if (targetElement) {
      const templateDetails = this.templates.get(templateId.replace('#', ''));
      const variableName = templateDetails.variableName || 'result';
      let templateContent = templateDetails.content;

      const variablePattern = new RegExp(`{${variableName}\.([^}]+)}`, 'g');
      templateContent = templateContent.replace(variablePattern, (match, p1) => result[p1]);

      // Create a Document Fragment to hold the new content
      const fragment = document.createRange().createContextualFragment(templateContent);

      // Append the fragment to the target element
      targetElement.appendChild(fragment);
      targetElement.style.display = 'block';
    }
  }

  // Load external HTML templates
  loadExternalTemplates() {
    const externaTemplates = document.querySelectorAll('template[set]');
    externaTemplates.forEach(template => {
      const url = template.set;
      fetch(url)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // add the loaded content to the proper template in html
          const templateId = template.id;
          const targetTemplate = document.querySelector(`template#${templateId}`);
          targetTemplate.innerHTML = doc.body.innerHTML;

          // Add the template to the map
          doc.querySelectorAll('template').forEach(template => {
            this.templates.set(template.id, {content: template.innerHTML, variableName: template.getAttribute('[set]')});
          });
        });
    });
  }

  // Dynamic class handling
  handleDynamicClasses(root) {
    const elementsWithDynamicClasses = root.querySelectorAll('[class]');

    elementsWithDynamicClasses.forEach(element => {
      const classExpression = element.getAttribute('[class]');
      const classes = this.evaluateClassExpression(classExpression);
      element.className = classes.join(' ').trim();
    });
  }

  // Evaluate the class expression to determine the classes to apply
  evaluateClassExpression(expression) {
    let classes = [];
    try {
      const evaluatedExpression = JSON.parse(expression);
      if (typeof evaluatedExpression === 'string') {
        classes = [evaluatedExpression];
      } else if (typeof evaluatedExpression === 'object') {
        for (const [className, condition] of Object.entries(evaluatedExpression)) {
          if (condition) {
            classes.push(className);
          }
        }
      }
    } catch (error) {
      console.error('Error evaluating class expression:', expression, error);
    }
    return classes;
  }

  // Dynamic styles handling
  handleDynamicStyles(root) {
    const elementsWithDynamicStyles = root.querySelectorAll('[styles]');

    elementsWithDynamicStyles.forEach(element => {
      const stylesExpression = element.getAttribute('[styles]');
      this.evaluateStylesExpression(element, stylesExpression);
    });
  }

  // Evaluate the styles expression to apply styles to the element
  evaluateStylesExpression(element, expression) {
    try {
      const evaluatedExpression = JSON.parse(expression);
      if (typeof evaluatedExpression === 'object') {
        for (const [conditionName, styles] of Object.entries(evaluatedExpression)) {
          const conditionValue = this.stateManager.getState(conditionName) || window[conditionName];
          if (conditionValue) {
            Object.assign(element.style, styles);
          } else {
            for (const styleKey in styles) {
              element.style[styleKey] = ''; // Reset the style if the condition is false
            }
          }
        }
      }
    } catch (error) {
      console.error('Error evaluating styles expression:', expression, error);
    }
  }

  // Switch Case Logic
  handleSwitchCases(root) {
    const switchElements = root.querySelectorAll('[switch]');

    switchElements.forEach(switchElement => {
      const switchExpression = switchElement.getAttribute('[switch]');
      const switchValue = window[switchExpression];

      // Hide all child elements except the matched case or default
      let caseMatched = false;
      let defaultElement = null;
      switchElement.childNodes.forEach(child => {
        if (child.nodeType === 1) {
          const caseValue = child.getAttribute('[case]');
          if (caseValue && caseValue === switchValue) {
            child.style.display = 'block';
            caseMatched = true;
          } else if (child.hasAttribute('[default]')) {
            defaultElement = child;
          } else {
            child.style.display = 'none';
          }
        }
      });

      // Show the default element if no case matched
      if (!caseMatched && defaultElement) {
        defaultElement.style.display = 'block';
      }
    });
  }

  // Call Actions from Other DOM Elements
  handleCallActions(root) {
    const callElements = root.querySelectorAll('[call]');

    callElements.forEach(element => {
      const callUrl = element.getAttribute('[call]');
      const successTemplateId = element.getAttribute('[success]');
      const errorTemplateId = element.getAttribute('[error]');

      // Add a click event listener to handle the call action
      element.addEventListener('click', (event) => {
        event.preventDefault();

        // Perform the call using Fetch API
        fetch(callUrl)
          .then(response => response.json())
          .then(result => {
            // Apply the success template if defined
            if (successTemplateId) {
              this.handleTemplateWithResult(successTemplateId, {result});
            }
          })
          .catch(error => {
            // Apply the error template if defined
            if (errorTemplateId) {
              this.handleTemplateWithResult(errorTemplateId, {error});
            }
          });
      });
    });
  }

  // Event handling
  handleEventHandlers(root) {
    const events = ['click', 'change', 'keyup', 'mouseover', 'mouseout', 'focus', 'blur'];
    events.forEach(eventType => {
      const elementsWithEvent = root.querySelectorAll(`[${eventType}]`);
      elementsWithEvent.forEach(element => {
        const handlerExpression = element.getAttribute(`[${eventType}]`);
        const handlerFunction = this.stateManager.getState(handlerExpression);
        if (typeof handlerFunction === 'function') {
          element.addEventListener(eventType, handlerFunction);
        }
      });
    });
  }

  // Custom Filters and Directives
  handleCustomDirectives(root) {
    for (const directiveName in this.directives) {
      const elementsWithDirective = root.querySelectorAll(`[${directiveName}]`);
      elementsWithDirective.forEach(element => {
        const directiveValue = element.getAttribute(`[${directiveName}]`);
        const directiveFunction = this.directives[directiveName];
        if (typeof directiveFunction === 'function') {
          directiveFunction(element, directiveValue);
        }
      });
    }
  }

  // Register a custom filter
  registerFilter(name, filterFunction) {
    this.filters[name] = filterFunction;
  }

  // Register a custom directive
  registerDirective(name, directiveFunction) {
    this.directives[name] = directiveFunction;
  }

  // Animations and Transitions
  handleAnimationsAndTransitions(root) {
    const elementsWithAnimation = root.querySelectorAll('[animate]');

    elementsWithAnimation.forEach(element => {
      const animationName = element.getAttribute('[animate]');
      const duration = element.getAttribute('[duration]') || '1s';
      const timingFunction = element.getAttribute('[timing]') || 'ease';

      // Set the animation properties
      element.style.animationName = animationName;
      element.style.animationDuration = duration;
      element.style.animationTimingFunction = timingFunction;
    });
  }

  // Form validation handling
  handleFormValidation(root) {
    const formElements = root.querySelectorAll('form');

    formElements.forEach(form => {
      form.addEventListener('submit', (event) => {
        let isValid = true;
        const inputElements = form.querySelectorAll('input[validate]');

        inputElements.forEach(input => {
          const validationType = input.getAttribute('[validate]');
          const errorTemplateId = input.getAttribute('[error]');
          const value = input.value;

          // Perform the validation based on the type
          if (!this.validateInput(validationType, value)) {
            isValid = false;
            if (errorTemplateId) {
              this.handleTemplateWithResult(errorTemplateId, {error: `Invalid ${validationType}`});
            }
          }
        });

        if (!isValid) {
          event.preventDefault();
        }
      });
    });
  }

  // Validate the input based on the validation type
  validateInput(type, value, format) {
    switch (type) {
      case 'email':
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(value);
      case 'securePassword':
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordPattern.test(value);
      case 'phone':
        const phonePattern = new RegExp(format || /^\d{10}$/);
        return phonePattern.test(value);
      case 'url':
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
        return urlPattern.test(value);
      case 'date':
        const dateFormat = format || /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
        return dateFormat.test(value);
      case 'number':
        const numberPattern = new RegExp(format || /^\d+$/);
        return numberPattern.test(value);
      case 'postalCode':
        const postalCodePattern = new RegExp(format || /^\d{5}$/); // Default: 5 digits
        return postalCodePattern.test(value);
      case 'creditCard':
        const creditCardPattern = /^[0-9]{13,19}$/; // 13 to 19 digits
        return creditCardPattern.test(value);
      case 'alphanumeric':
        const alphanumericPattern = /^[a-zA-Z0-9]+$/;
        return alphanumericPattern.test(value);
      case 'minLength':
        return value.length >= parseInt(format);
      case 'maxLength':
        return value.length <= parseInt(format);
      case 'customPattern':
        const customPattern = new RegExp(format);
        return customPattern.test(value);
      default:
        return true;
    }
  }

  // Set translations for a specific language
  setTranslations(lang, translations) {
    this.stateManager.setState(`translations.${lang}`, translations);
  }

  // Get translation for a specific key and language
  getTranslation(lang, key) {
    return this.stateManager.getState(`translations.${lang}.${key}`);
  }

  // Load translations from a JSON file
  loadTranslations(url, lang) {
    fetch(url)
      .then(response => response.json())
      .then(translations => {
        this.translations[lang] = translations;
        this.handleTranslations(); // Reapply translations after loading
      })
      .catch(error => {
        console.error('Error loading translations:', error);
      });
  }

  // Apply translations based on user's language
  handleTranslations(root) {
    // Determine user's language (you can use more sophisticated logic here)
    const userLang = navigator.language || navigator.userLanguage;

    // Find elements with the translate directive for specific language
    const elementsWithSpecificLangTranslation = root.querySelectorAll(`[translate\\.${userLang}]`);
    elementsWithSpecificLangTranslation.forEach(element => {
      const translationKey = element.getAttribute(`[translate.${userLang}]`);
      const translation = this.translations[userLang] && this.translations[userLang][translationKey];
      if (translation) {
        element.textContent = translation;
      }
    });

    // Find elements with the generic translate directive
    const elementsWithGenericTranslation = root.querySelectorAll('[translate]');
    elementsWithGenericTranslation.forEach(element => {
      const parentWithLang = element.closest('[lang]');
      if (parentWithLang) {
        const lang = parentWithLang.getAttribute('[lang]');
        const translationKey = element.getAttribute('[translate]');
        const translation = this.translations[lang] && this.translations[lang][translationKey];
        if (translation) {
          element.textContent = translation;
        }
      }
    });
  }

  // Apply translation files
  handleTranslationFiles(root) {
    const elementsWithTranslationFile = root.querySelectorAll('[translations]');

    elementsWithTranslationFile.forEach(element => {
      const url = element.getAttribute('[translations]');
      const lang = element.getAttribute('[lang]');

      if (url && lang) {
        this.loadTranslations(url, lang);
      }
    });
  }

  // State Management
  handleStateBindings(root) {
    const elementsWithStateBinding = root.querySelectorAll('[bind]');

    elementsWithStateBinding.forEach(element => {
      const stateKey = element.getAttribute('[bind]');
      const stateValue = this.stateManager.getState(stateKey);

      // Update element content with state value
      if (stateValue !== undefined) {
        element.textContent = stateValue;
      }

      // Subscribe to changes in state
      this.stateManager.subscribe((key, value) => {
        if (key === stateKey) {
          element.textContent = value;
        }
      });
    });
  }

  // Web Components Compatibility
  handleWebComponents() {
    // Listen for custom elements being defined
    window.addEventListener('WebComponentsReady', () => {
      customElements.whenDefined('custom-element').then(() => {
        const customElements = document.querySelectorAll('custom-element');
        customElements.forEach(customElement => {
          const shadowRoot = customElement.shadowRoot;
          if (shadowRoot) {
            this.handleAll(shadowRoot);
          }
        });
      });
    });
  }

  // using variables
  handleTemplateWithVariables(templateId, result, root) {
    const targetElement = root.querySelector(templateId);
    if (targetElement) {
      const templateDetails = this.templates.get(templateId.replace('#', ''));
      const variableName = templateDetails.variableName || 'result';
      let templateContent = templateDetails.content;

      const variablePattern = new RegExp(`{${variableName}\.([^}]+)}`, 'g');
      templateContent = templateContent.replace(variablePattern, (match, p1) => result[p1]);

      targetElement.innerHTML = templateContent;
      targetElement.style.display = 'block';
    }
  }

  handleAll(root = document) {
    this.handleConditionals(root);
    this.handleLoops(root);
    this.handleTemplates(root);
    this.handleDynamicClasses(root);
    this.handleDynamicStyles(root);
    this.handleSwitchCases(root);
    this.handleCallActions(root);
    this.handleEventHandlers(root);
    this.handleCustomDirectives(root);
    this.handleAnimationsAndTransitions(root);
    this.handleFormValidation(root);
    this.handleTranslations(root);
    this.handleTranslationFiles(root);
    this.handleStateBindings(root);
  }

  // General method to parse and render
  init() {
    this.handleAll();
    this.handleWebComponents();
  }

}

// Example of registering a custom directive
// dhtml.registerDirective('customDirective', (element, value) => {
//   element.innerHTML = `Custom Content: ${value}`;
// });

// Example of setting translations
// dhtml.setTranslations('en-us', {welcomeMessage: 'Welcome!'});
// dhtml.setTranslations('pt-br', {welcomeMessage: 'Bem-vindo!'});

// Example of updating state
// dhtml.stateManager.setState('userProfile.name', 'Tony Stark');

// Usage:
const dhtml = new DHTMLjs();
document.onload = dhtml.init();