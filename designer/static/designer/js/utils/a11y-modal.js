// File: designer/static/designer/js/utils/a11y-modal.js

export default class A11yModal {
    constructor(modalElement, options = {}) {
        if (!modalElement) {
            console.error('A11yModal: No modal element provided');
            return;
        }

        this.modalElement = modalElement;
        this.options = options;
        this.previousActiveElement = null;
        this.focusableElements = null;

        // Only bind events if the element exists
        this.bindEvents();
    }

    bindEvents() {
        // Use optional chaining and null checks
        this.modalElement?.addEventListener('show.bs.modal', this.onShow.bind(this));
        this.modalElement?.addEventListener('shown.bs.modal', this.trapFocus.bind(this));
        this.modalElement?.addEventListener('hide.bs.modal', this.releaseFocus.bind(this));
    }

    onShow(event) {
        // Store the currently active element
        this.previousActiveElement = document.activeElement;

        // Call custom onShow if provided
        if (typeof this.options.onShow === 'function') {
            this.options.onShow(event);
        }
    }

    trapFocus() {
        // Remove inert attribute
        this.modalElement?.removeAttribute('inert');

        // Find focusable elements
        this.focusableElements = this.modalElement?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || [];

        // Ensure first and last focusable elements loop focus
        if (this.focusableElements.length) {
            const firstElement = this.focusableElements[0];
            const lastElement = this.focusableElements[this.focusableElements.length - 1];

            this.modalElement?.addEventListener('keydown', this.handleKeydown.bind(this));
            firstElement?.focus();
        }
    }

    releaseFocus(event, preserve = true) {
        // Restore focus to the previous active element if preserve is true
        if (preserve && this.previousActiveElement) {
            this.previousActiveElement.focus();
        }

        // Add inert back
        this.modalElement?.setAttribute('inert', '');

        // Remove keydown listener
        this.modalElement?.removeEventListener('keydown', this.handleKeydown);

        // Call custom onHide if provided
        if (typeof this.options.onHide === 'function') {
            this.options.onHide(event);
        }
    }

    handleKeydown(event) {
        if (event.key === 'Tab' && this.focusableElements?.length) {
            const firstElement = this.focusableElements[0];
            const lastElement = this.focusableElements[this.focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }

    show() {
        // Any additional show logic
    }

    hide() {
        this.releaseFocus();
    }
}