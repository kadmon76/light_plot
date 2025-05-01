// File: designer/static/designer/js/utils/modal-utils.js

/**
 * Modal Utilities Module
 * 
 * Provides a reusable system for creating and managing Bootstrap modals.
 * This utility simplifies the process of creating modals, handling their events,
 * and managing their lifecycle within the application.
 * 
 * Features:
 * - Create modals with custom content, header, footer
 * - Show, hide, and destroy modals
 * - Register event handlers for modal actions (confirm, cancel, etc.)
 * - Support for form inputs within modals
 * - Manage multiple modal instances with unique IDs
 * 
 * Usage example:
 * 
 * // Create a simple confirmation modal
 * const modal = createModal({
 *     id: 'confirm-delete',
 *     title: 'Confirm Delete',
 *     body: 'Are you sure you want to delete this item?',
 *     confirmButton: 'Delete',
 *     cancelButton: 'Cancel',
 *     onConfirm: () => deleteItem(itemId)
 * });
 * 
 * // Show the modal
 * showModal('confirm-delete');
 * 
 * // Hide the modal
 * hideModal('confirm-delete');
 */

import A11yModal from './a11y-modal.js';
// Store references to created modals
const _modals = {};

/**
 * Create a new modal with the given options
 * @param {Object} options - Modal configuration options
 * @param {String} options.id - Unique identifier for the modal
 * @param {String} options.title - Modal title
 * @param {String|HTMLElement} options.body - Modal body content (HTML string or DOM element)
 * @param {String} [options.size] - Modal size ('sm', 'lg', 'xl', or undefined for default)
 * @param {Boolean} [options.backdrop=true] - Whether to show a backdrop
 * @param {Boolean} [options.keyboard=true] - Whether to close on escape key
 * @param {String} [options.confirmButton] - Text for confirm button (omit to hide)
 * @param {String} [options.cancelButton] - Text for cancel button (omit to hide)
 * @param {Function} [options.onConfirm] - Callback for confirm button click
 * @param {Function} [options.onCancel] - Callback for cancel button click
 * @param {Function} [options.onShow] - Callback when modal is shown
 * @param {Function} [options.onHide] - Callback when modal is hidden
 * @return {Object} Modal instance with methods to control the modal
 */
export function createModal(options) {
    // Check if modal with this ID already exists
    if (_modals[options.id]) {
        console.warn(`Modal with ID ${options.id} already exists. Returning existing instance.`);
        return _modals[options.id];
    }

    // Create modal element
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = options.id;
    modalElement.setAttribute('tabindex', '-1');
    
    // IMPORTANT: Remove aria-hidden, use inert instead
    modalElement.setAttribute('inert', '');
    
    // Add size class if specified
    const sizeClass = options.size ? `modal-${options.size}` : '';
    
    // Create modal content
    modalElement.innerHTML = `
        <div class="modal-dialog ${sizeClass}">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${options.title || ''}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${typeof options.body === 'string' ? options.body : ''}
                </div>
                <div class="modal-footer">
                    ${options.cancelButton ? `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${options.cancelButton}</button>` : ''}
                    ${options.confirmButton ? `<button type="button" class="btn btn-primary" id="${options.id}-confirm">${options.confirmButton}</button>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Append to document body
    document.body.appendChild(modalElement);
    
    // If body is a DOM element, append it to modal body
    if (options.body instanceof HTMLElement) {
        const modalBody = modalElement.querySelector('.modal-body');
        modalBody.innerHTML = '';
        modalBody.appendChild(options.body);
    }
    
    // Initialize Bootstrap modal
    const modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: options.backdrop !== undefined ? options.backdrop : true,
        keyboard: options.keyboard !== undefined ? options.keyboard : true,
        focus: true
    });
    
    // Set up event handlers
    if (options.onConfirm) {
        const confirmBtn = modalElement.querySelector(`#${options.id}-confirm`);
        if (confirmBtn) {
            confirmBtn.addEventListener('click', (event) => {
                options.onConfirm(event);
            });
        }
    }
    
    if (options.onShow) {
        modalElement.addEventListener('shown.bs.modal', options.onShow);
    }
    
    if (options.onHide) {
        modalElement.addEventListener('hidden.bs.modal', options.onHide);
    }
    
    // Handle cancel through bootstrap's event
    if (options.onCancel) {
        modalElement.addEventListener('hide.bs.modal', options.onCancel);
    }
    // Enhance modal initialization with accessibility
    const a11yModal = new A11yModal(modalElement, {
        onShow: options.onShow,
        onHide: options.onHide
    });
    // Create modal controller object
    const modal = {
        element: modalElement,
        instance: modalInstance,
        a11yModal: a11yModal,
        show: () => {
            a11yModal.show();
            return modalInstance.show();
        },
        hide: () => {
            a11yModal.hide();
            return modalInstance.hide();
        },
        // Rest of the methods remain the same
    };
    
    // Store reference
    _modals[options.id] = modal;
    
    return modal;
}

/**
 * Show a modal by ID
 * @param {String} id - Modal ID
 * @return {Boolean} Whether the modal was found and shown
 */
export function showModal(id) {
    if (!_modals[id]) {
        console.error(`Modal with ID ${id} not found`);
        return false;
    }
    
    _modals[id].show();
    return true;
}

/**
 * Hide a modal by ID
 * @param {String} id - Modal ID
 * @return {Boolean} Whether the modal was found and hidden
 */
export function hideModal(id) {
    if (!_modals[id]) {
        console.error(`Modal with ID ${id} not found`);
        return false;
    }
    
    _modals[id].hide();
    return true;
}

/**
 * Update an existing modal with new options
 * @param {String} id - Modal ID
 * @param {Object} newOptions - New options to apply
 * @return {Boolean} Whether the modal was found and updated
 */
export function updateModal(id, newOptions) {
    if (!_modals[id]) {
        console.error(`Modal with ID ${id} not found`);
        return false;
    }
    
    const modal = _modals[id];
    const element = modal.element;
    
    // Update title if provided
    if (newOptions.title) {
        const titleElement = element.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = newOptions.title;
        }
    }
    
    // Update body if provided
    if (newOptions.body) {
        const bodyElement = element.querySelector('.modal-body');
        if (bodyElement) {
            if (typeof newOptions.body === 'string') {
                bodyElement.innerHTML = newOptions.body;
            } else if (newOptions.body instanceof HTMLElement) {
                bodyElement.innerHTML = '';
                bodyElement.appendChild(newOptions.body);
            }
        }
    }
    
    return true;
}

/**
 * Remove a modal from the DOM and delete its reference
 * @param {String} id - Modal ID
 * @return {Boolean} Whether the modal was found and destroyed
 */
export function destroyModal(id) {
    if (!_modals[id]) {
        console.error(`Modal with ID ${id} not found`);
        return false;
    }
    
    _modals[id].dispose();
    return true;
}

/**
 * Get a reference to a modal by ID
 * @param {String} id - Modal ID
 * @return {Object|null} Modal object or null if not found
 */
export function getModal(id) {
    return _modals[id] || null;
}

/**
 * Create a confirmation modal with confirm/cancel buttons
 * @param {Object} options - Modal configuration options
 * @return {Object} Modal instance
 */
export function createConfirmModal(options) {
    return createModal({
        id: options.id || 'confirm-modal',
        title: options.title || 'Confirm',
        body: options.message || 'Are you sure?',
        size: options.size,
        confirmButton: options.confirmText || 'Confirm',
        cancelButton: options.cancelText || 'Cancel',
        onConfirm: (e) => {
            if (options.onConfirm) {
                options.onConfirm(e);
            }
            if (options.autoHide !== false) {
                hideModal(options.id || 'confirm-modal');
            }
        },
        onCancel: options.onCancel
    });
}