class Modal {
  constructor() {
    this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.modal = null;
    this.scrollPosition = null;
    this.starterLink = null;
    this.html = document.documentElement;
    this.overlay = document.querySelector('.overlay');
    this.scrollbarWidth = window.innerWidth - this.html.clientWidth;
    this.overlayChecker = false;
    this.eventsFeeler()
  }
  focusInit() {
    if (this.modal) {
      this.modalFocusableElements = this.modal.querySelectorAll(this.focusableElements);
      this.firstFocusableElement = this.modalFocusableElements[0];
      this.lastFocusableElement = this.modalFocusableElements[this.modalFocusableElements.length - 1];
      this.firstFocusableElement.focus();
    }
    else return;
  }
  eventsFeeler() {
    document.addEventListener('click', this.handleClickEvent.bind(this));
    document.addEventListener('keydown', this.handleKeyDownEvent.bind(this));
    document.addEventListener('mousedown', this.handleMouseDownEvent.bind(this));
    document.addEventListener('mouseup', this.handleMouseUpEvent.bind(this));
  }

  handleClickEvent(e) {
    if (e.target.closest('[data-modal]')) {
      e.preventDefault();
      if (!this.modal) {
        this.starterLink = e.target.closest('[data-modal]');
        this.scrollPosition = window.pageYOffset;
        this.modal = document.querySelector(e.target.closest('[data-modal]').getAttribute('data-modal'));
        this.openModal();
        this.focusInit();
      }
    }
    if (e.target.closest('.modal__close')) {
      this.closeModal();
    }
  }
  handleKeyDownEvent(e) {
    if (e.code === 'Escape' && this.modal) {
      this.closeModal();
    }
    else if (e.code === 'Tab' && this.modal) {
      this.focusControl(e);
    }
  }
  handleMouseDownEvent(e) {
    if (!e.target.classList.contains('modal__wrapper')) return;
    this.overlayChecker = true;
  }
  handleMouseUpEvent(e) {
    if (this.overlayChecker && e.target.classList.contains('modal__wrapper')) {
      e.preventDefault();
      !this.overlayChecker;
      this.closeModal();
      return;
    }
    this.overlayChecker = false;
  }

  openModal() {
    this.openOverlay();
    this.modal.classList.add('modal--active');
    this.bodyScrollLock(this.scrollPosition);
  }
  openSuccessModal() {
    this.modal.classList.remove('modal--active');
    this.modal = document.querySelector('.modal--success');
    this.modal.classList.add('modal--active');
    this.focusInit();
  }
  closeModal() {
    this.modal.classList.remove('modal--active');
    this.modal = null;
    this.closeOverlay();
    this.bodyScrollUnlock();
    this.setFocusOnStarterLink();
  }

  bodyScrollLock(scrollPosition) {
    this.html.classList.add('page--lock');
    this.html.style.top = -this.scrollPosition + "px";
    this.html.style.marginRight = this.scrollbarWidth + 'px';
  }
  bodyScrollUnlock() {
    this.html.classList.remove('page--lock');
    this.html.style.top = "";
    this.html.style.marginRight = '';
    window.scrollTo(0, this.scrollPosition);
  }
  openOverlay() {
    this.overlay.classList.add('overlay--active');
  }
  closeOverlay() {
    this.overlay.classList.remove('overlay--active');
  }

  focusControl(e) {
    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        this.setFocusOnLastFocusableElement();
        e.preventDefault();
      }
    }
    else if (document.activeElement === this.lastFocusableElement) {
      this.setFocusOnFirstFocusableElement();
      e.preventDefault();
    }
  }
  setFocusOnFirstFocusableElement(e) {
    this.firstFocusableElement.focus();
  }
  setFocusOnLastFocusableElement(e) {
    this.lastFocusableElement.focus();
  }
  setFocusOnStarterLink() {
    this.starterLink.focus();
  }
}

class FormValidation {
  constructor(form) {
    this.form = form;
    this.formInputs = this.form.querySelectorAll('input, textarea');
    this.errors = {};
    this.eventsFeeler();
  }
  eventsFeeler() {
    for (let i = 0; i < this.formInputs.length; i++) {
      this.formInputs[i].addEventListener('blur', this.handleBlur.bind(this));
      this.formInputs[i].addEventListener('input', this.handleInput.bind(this));
    }
  }

  hasErrors() {
    if (Object.keys(this.errors).length === 0) return false;
    else return true;
  }

  /* Events handlers */
  handleBlur(e) {
    this.validate(e.target);
  }
  handleInput(e) {
    const nameField = e.target.name;
    if (this.errors[nameField]) {
      this.removeErrorFromElement(e.target);
    }
  }

  /* Validation methods */
  validate(element) {
    switch (element.name) {
      case 'name':
        this.required(element, 'Please, enter Your name');
        break;
      case 'email':
        this.required(element, 'Please, enter Your email');
        this.validateEmail(element, 'Invalid email');
        break;
      case 'message':
        this.required(element, 'Please, enter Your message');
        this.minLength(element, 'The text of the appeal must be at least 10 characters', 10)
        break;
    }
  }
  required(element, errorMessage) {
    if (!this.errors[element.name]) {
      if (!element.value.trim()) {
        this.addErrorToElement(element, errorMessage);
      }
    }
  }
  validateEmail(element, errorMessage) {
    if (!this.errors[element.name]) {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(element.value)) {
        this.addErrorToElement(element, errorMessage);
      }
    }
  }
  minLength(element, errorMessage, minLength) {
    if (!this.errors[element.name]) {
      if (element.value.trim().length < minLength) {
        this.addErrorToElement(element, errorMessage);
      }
    }
  }
  validateOnSubmit() {
    this.formInputs.forEach((input) => {
      this.validate(input);
    });
  }

  addErrorToElement(element, message) {
    this.errors[element.name] = message;
    const elementWrapper = element.closest('.form__group');
    elementWrapper.classList.add('form__group--has-error');
    const errorMessageContainer = document.createElement('span');
    errorMessageContainer.classList.add('form__error-message');
    errorMessageContainer.appendChild(document.createTextNode(message));
    element.after(errorMessageContainer);
  }
  removeErrorFromElement(element) {
    const elementWrapper = element.closest('.form__group');
    const errorMessage = elementWrapper.querySelector('.form__error-message');
    elementWrapper.classList.remove('form__group--has-error');
    errorMessage.remove();
    delete this.errors[element.name];

  }
}

const myModal = new Modal();

const form = document.querySelector('#modal-call-form');
const formValidation = new FormValidation(form);
form.addEventListener('submit', handleFormSubmit);

function handleFormSubmit(e) {
  e.preventDefault();
  formValidation.validateOnSubmit();
  if (!formValidation.hasErrors()) {
    sendForm(form).then(result => {
      if (result.ok) myModal.openSuccessModal();
    });

  }
  else return;

}

function sendForm(form) {
  const method = form.method;
  const url = form.action;
  const formData = new FormData(form);
  return fetch(url, {
    method,
    body: formData
  }).then(result => result)
}