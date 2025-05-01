// File: designer/static/designer/js/ui/fixtures-modal.js

/**
 * Fixtures Modal Module
 * 
 * Implements the "Add Fixtures" modal functionality for creating
 * fixtures with various placement options.
 */

import { createModal, showModal } from '../utils/modal-utils.js';
import { getState, setCurrentTool } from '../core/state.js';
import { TOOLS } from '../core/config.js';

// Create the modal when the module is imported
let fixturesModal;

/**
 * Initialize the Add Fixtures modal
 */
export function initFixturesModal() {
    console.log('FixturesModal: Initializing Add Fixtures modal');
    
    // Set up event listener for the Add Fixture button
    setupButtonListener();
    
    console.log('FixturesModal: Add Fixtures modal initialized');
}

/**
 * Set up the button listener to open the modal
 */
function setupButtonListener() {
    const addFixtureBtn = document.getElementById('add-fixture-tool');
    if (!addFixtureBtn) {
        console.error('FixturesModal: Add Fixture button not found');
        return;
    }
    
    // Store the original click handler if it exists
    const originalClickHandler = addFixtureBtn.onclick;
    
    // Override the click handler
    addFixtureBtn.onclick = function(event) {
        console.log('FixturesModal: Add Fixture button clicked');
        
        // Open the modal
        openAddFixturesModal();
        
        // Prevent the default action
        event.preventDefault();
    };
}
const FIXTURES_MODAL_ID = 'add-fixtures-modal';

/**
 * Open the Add Fixtures modal
 */
 function openAddFixturesModal() {
    console.log('FixturesModal: Opening Add Fixtures modal');
    
    // Create the modal each time to ensure we have fresh data
    createAddFixturesModal();
    
    // Show the modal - use the constant here
    showModal(FIXTURES_MODAL_ID);
}

/**
 * Create the Add Fixtures modal
 */
function createAddFixturesModal() {
    console.log('FixturesModal: Creating Add Fixtures modal');
    
    // Create the modal body content
    const modalBody = createModalBody();
    
    // Create the modal - use the constant here
    fixturesModal = createModal({
        id: FIXTURES_MODAL_ID,  // Use the same ID constant
        title: 'Add Fixtures',
        body: modalBody,
        size: 'lg',
        confirmButton: 'Add',
        cancelButton: 'Cancel',
        onConfirm: (e) => {
            // When confirm button is clicked, trigger form submission
            const form = document.getElementById('add-fixtures-form');
            if (form) {
                // Create and dispatch a submit event
                const submitEvent = new Event('submit', {
                    bubbles: true,
                    cancelable: true
                });
                form.dispatchEvent(submitEvent);
            }
        },
        onShow: handleModalShow,
        onHide: () => {
            console.log('FixturesModal: Modal hidden');
            // Reset form when modal is hidden
            const form = document.getElementById('add-fixtures-form');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
        }
    });
    
    console.log('FixturesModal: Add Fixtures modal created');
}
/**
 * Create the Add Fixtures modal
 */

/**
 * Create the modal body content
 * @return {HTMLElement} The modal body content
 */
function createModalBody() {
    // Create a container for the modal body
    const container = document.createElement('div');
    
    // Add the form content - notice the needs-validation class and novalidate attribute
    container.innerHTML = `
        <form id="add-fixtures-form" class="needs-validation" novalidate>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Fixture Type</label>
                    <select class="form-select" id="fixture-type-select" required>
                        <option value="" disabled selected>Select fixture type...</option>
                        <!-- Fixture options will be populated dynamically from backend data -->
                    </select>
                    <div class="invalid-feedback">
                        Please select a fixture type.
                    </div>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-control" id="fixture-quantity" min="1" value="1" required>
                    <div class="invalid-feedback">
                        Quantity must be at least 1.
                    </div>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Placement Pattern</label>
                    <select class="form-select" id="placement-pattern" required>
                        <option value="line">Line</option>
                        <option value="grid">Grid</option>
                        <option value="circle">Circle</option>
                        <option value="manual">Manual (one by one)</option>
                    </select>
                    <div class="invalid-feedback">
                        Please select a placement pattern.
                    </div>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Color</label>
                    <input type="color" class="form-control" id="fixture-color" value="#0066cc">
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Fixture ID</label>
                    <input type="number" class="form-control" id="starting-channel" min="1" value="1" required>
                    <div class="invalid-feedback">
                        Fixture ID must be a positive number.
                    </div>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Channel Increment</label>
                    <input type="number" class="form-control" id="channel-increment" min="1" value="1" required>
                    <div class="invalid-feedback">
                        Channel increment must be at least 1.
                    </div>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-12">
                    <label class="form-label">Purpose</label>
                    <input type="text" class="form-control" id="fixture-purpose" placeholder="e.g., Front Light, Special">
                </div>
            </div>
            
            <div id="pattern-options" class="mt-3">
                <!-- Pattern-specific options will be displayed here based on selection -->
            </div>
        </form>
    `;
    
    // Return the container
    return container;
}



/**
 * Update pattern-specific options based on the selected pattern
 */
function updatePatternOptions() {
    const patternSelect = document.getElementById('placement-pattern');
    const patternOptionsContainer = document.getElementById('pattern-options');
    
    if (!patternSelect || !patternOptionsContainer) return;
    
    const selectedPattern = patternSelect.value;
    
    // Clear existing options
    patternOptionsContainer.innerHTML = '';
    
    // Add pattern-specific options with validation
    switch (selectedPattern) {
        case 'line':
            patternOptionsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">Line Options</div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Direction</label>
                                <select class="form-select" id="line-direction" required>
                                    <option value="horizontal">Horizontal</option>
                                    <option value="vertical">Vertical</option>
                                </select>
                                <div class="invalid-feedback">
                                    Please select a direction.
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Spacing (px)</label>
                                <input type="number" class="form-control" id="line-spacing" min="10" value="50" required>
                                <div class="invalid-feedback">
                                    Spacing must be at least 10px.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'grid':
            patternOptionsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">Grid Options</div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Rows</label>
                                <input type="number" class="form-control" id="grid-rows" min="1" value="3" required>
                                <div class="invalid-feedback">
                                    Rows must be at least 1.
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Columns</label>
                                <input type="number" class="form-control" id="grid-columns" min="1" value="3" required>
                                <div class="invalid-feedback">
                                    Columns must be at least 1.
                                </div>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <label class="form-label">Horizontal Spacing (px)</label>
                                <input type="number" class="form-control" id="grid-h-spacing" min="10" value="50" required>
                                <div class="invalid-feedback">
                                    Horizontal spacing must be at least 10px.
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Vertical Spacing (px)</label>
                                <input type="number" class="form-control" id="grid-v-spacing" min="10" value="50" required>
                                <div class="invalid-feedback">
                                    Vertical spacing must be at least 10px.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'circle':
            patternOptionsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">Circle Options</div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Radius (px)</label>
                                <input type="number" class="form-control" id="circle-radius" min="20" value="100" required>
                                <div class="invalid-feedback">
                                    Radius must be at least 20px.
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Start Angle (degrees)</label>
                                <input type="number" class="form-control" id="circle-start-angle" min="0" max="359" value="0" required>
                                <div class="invalid-feedback">
                                    Start angle must be between 0 and 359 degrees.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'manual':
            patternOptionsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">Manual Placement</div>
                    <div class="card-body">
                        <p class="card-text">
                            After clicking "Add Fixtures", you'll be able to place each fixture 
                            individually by clicking on the canvas.
                        </p>
                    </div>
                </div>
            `;
            break;
    }
    
    // Re-initialize validation for the new fields
    setupBootstrapValidation();
}

// Export the module functions
export default {
    initFixturesModal
};

/**
 * Set up Bootstrap validation
 */
 function setupBootstrapValidation() {
    console.log('FixturesModal: Setting up Bootstrap validation');
    
    // Get all forms with the "needs-validation" class
    const forms = document.querySelectorAll('.needs-validation');
    
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        // Re-attach the event handler to avoid duplicates
        form.removeEventListener('submit', handleFormSubmission);
        form.addEventListener('submit', handleFormSubmission);
    });
}

/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
function handleFormSubmission(event) {
    const form = event.currentTarget;
    
    // Prevent default form submission
    event.preventDefault();
    event.stopPropagation();
    
    // Add the "was-validated" class to show validation feedback
    form.classList.add('was-validated');
    
    // Check if the form is valid
    if (form.checkValidity()) {
        // If valid, proceed with handleAddFixtures
        handleAddFixtures();
    } else {
        // If not valid, focus the first invalid field
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) {
            firstInvalid.focus();
        }
    }
}

/**
 * Handle adding fixtures when the form validates
 */
function handleAddFixtures() {
    console.log('FixturesModal: Add fixtures button clicked');
    
    // Get form values
    const fixtureType = document.getElementById('fixture-type-select').value;
    const quantity = parseInt(document.getElementById('fixture-quantity').value);
    const pattern = document.getElementById('placement-pattern').value;
    const color = document.getElementById('fixture-color').value;
    const fixtureId = parseInt(document.getElementById('starting-channel').value); // Renamed but kept ID the same
    const channelIncrement = parseInt(document.getElementById('channel-increment').value);
    const purpose = document.getElementById('fixture-purpose').value;
    
    // Check for duplicate fixture IDs - this would be an API call
    // This is just a placeholder - you would need to implement the actual check
    checkIfFixtureIdExists(fixtureId).then(exists => {
        if (exists) {
            // If the ID already exists, show an error
            document.getElementById('starting-channel').setCustomValidity('This fixture ID is already in use');
            document.getElementById('add-fixtures-form').classList.add('was-validated');
            document.getElementById('starting-channel').focus();
            return;
        }
        
        // If the ID is available, clear any custom validity
        document.getElementById('starting-channel').setCustomValidity('');
        
        // Collect pattern-specific options
        const patternOptions = getPatternOptions(pattern);
        
        console.log('FixturesModal: Form validation passed, proceeding with fixture creation');
        
        // Log the final data
        console.log({
            fixtureType,
            quantity,
            pattern,
            color,
            fixtureId,
            channelIncrement,
            purpose,
            patternOptions
        });
        
        // Close the modal
        fixturesModal.hide();
        
        // Reset form validation state
        document.getElementById('add-fixtures-form').classList.remove('was-validated');
    });
}

/**
 * Get pattern-specific options based on the selected pattern
 * @param {String} pattern - Selected pattern
 * @return {Object} Pattern-specific options
 */
function getPatternOptions(pattern) {
    switch (pattern) {
        case 'line':
            return {
                direction: document.getElementById('line-direction').value,
                spacing: parseInt(document.getElementById('line-spacing').value)
            };
        case 'grid':
            return {
                rows: parseInt(document.getElementById('grid-rows').value),
                columns: parseInt(document.getElementById('grid-columns').value),
                hSpacing: parseInt(document.getElementById('grid-h-spacing').value),
                vSpacing: parseInt(document.getElementById('grid-v-spacing').value)
            };
        case 'circle':
            return {
                radius: parseInt(document.getElementById('circle-radius').value),
                startAngle: parseInt(document.getElementById('circle-start-angle').value)
            };
        case 'manual':
            return {}; // No special options for manual placement
        default:
            return {};
    }
}

/**
 * Check if a fixture ID already exists
 * @param {Number} fixtureId - Fixture ID to check
 * @return {Promise<Boolean>} Promise resolving to true if the ID exists, false otherwise
 */
async function checkIfFixtureIdExists(fixtureId) {
    // This is a stub - you would need to implement the actual API call
    try {
        // Example API call:
        // const response = await fetch(`/api/check-fixture-id/${fixtureId}/`);
        // const data = await response.json();
        // return data.exists;
        
        // For now, just return false to simulate that the ID is available
        console.log(`Checking if fixture ID ${fixtureId} exists...`);
        
        // Simulate an API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // For testing, let's say ID 1 is already taken
        return fixtureId === 1;
    } catch (error) {
        console.error('Error checking fixture ID:', error);
        return false; // Assume it doesn't exist if we can't check
    }
}

/**
 * Handle modal show event - populate fixture types and set up validation
 */
function handleModalShow() {
    console.log('FixturesModal: Modal shown, populating fixture types');
    
    // Get the fixture type select element
    const fixtureTypeSelect = document.getElementById('fixture-type-select');
    if (!fixtureTypeSelect) {
        console.error('FixturesModal: Fixture type select not found');
        return;
    }
    
    // Clear existing options except the first placeholder
    while (fixtureTypeSelect.options.length > 1) {
        fixtureTypeSelect.remove(1);
    }
    
    // Get fixture items from the DOM (this connects to your existing UI)
    // We'll use the fixture library that's already in the sidebar
    const fixtureItems = document.querySelectorAll('.fixture-item');
    
    // Populate the select with available fixture types
    fixtureItems.forEach(item => {
        const fixtureId = item.dataset.fixtureId;
        const fixtureType = item.dataset.fixtureType;
        const fixtureName = item.querySelector('strong')?.textContent || fixtureType;
        
        if (fixtureId && fixtureType) {
            const option = document.createElement('option');
            option.value = fixtureId;
            option.textContent = fixtureName;
            option.dataset.fixtureType = fixtureType;
            
            // Store additional data attributes
            if (item.dataset.channel) option.dataset.channel = item.dataset.channel;
            if (item.dataset.color) option.dataset.color = item.dataset.color;
            
            fixtureTypeSelect.appendChild(option);
        }
    });
    
    // Set up pattern selection change handler
    const patternSelect = document.getElementById('placement-pattern');
    if (patternSelect) {
        patternSelect.addEventListener('change', updatePatternOptions);
        // Initialize pattern options
        updatePatternOptions();
    }
    
    // Set up Bootstrap validation
    setupBootstrapValidation();
    
    // Clear any previously set custom validity
    const fixtureIdField = document.getElementById('starting-channel');
    if (fixtureIdField) {
        fixtureIdField.setCustomValidity('');
    }
    
    // Reset the form validation state
    const form = document.getElementById('add-fixtures-form');
    if (form) {
        form.classList.remove('was-validated');
    }
}

