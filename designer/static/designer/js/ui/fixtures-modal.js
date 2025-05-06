// File: designer/static/designer/js/ui/fixtures-modal.js

/**
 * Fixtures Modal Module
 * 
 * Implements the "Add Fixtures" modal functionality for creating
 * fixtures with various placement options.
 */

import { createModal, showModal } from '../utils/modal-utils.js';
import { getState, setCurrentTool, setState } from '../core/state.js';
import { TOOLS } from '../core/config.js';
import { createFixture } from '../elements/fixture-element.js';
import behaviorManager from '../behaviors/behavior-manager.js';

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
    
    // Reset any custom validation messages first
    const fixtureIdInput = document.getElementById('starting-channel');
    if (fixtureIdInput) {
        fixtureIdInput.setCustomValidity('');
    }
    
    // Prevent default form submission
    event.preventDefault();
    event.stopPropagation();
    
    // Add the "was-validated" class to show validation feedback
    form.classList.add('was-validated');
    
    // Explicitly check if fixture ID is positive
    const fixtureId = parseInt(fixtureIdInput?.value);
    if (fixtureIdInput && (isNaN(fixtureId) || fixtureId <= 0)) {
        fixtureIdInput.setCustomValidity('Fixture ID must be a positive number');
    }
    
    // Check if the form is valid (after our custom validation)
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
 * Check if a fixture ID already exists
 * @param {Number} fixtureId - Fixture ID to check
 * @return {Boolean} Whether the ID exists
 */
function hasDuplicateFixtureId(fixtureId) {
    // Get all existing fixtures
    const fixturesGroup = getState('fixturesGroup');
    if (!fixturesGroup) return false;

    // Check if any fixture has this ID
    return fixturesGroup.children().some(fixture => {
        const element = fixture.data('element');
        return element && element.getProperty('fixtureId') === fixtureId;
    });
}

/**
 * Handle Add Fixtures button click
 * Creates and adds fixtures based on form values
 */
function handleAddFixtures() {
    console.log('FixturesModal: Starting fixture creation process');
    
    // Get form values
    const fixtureTypeSelect = document.getElementById('fixture-type-select');
    const selectedOption = fixtureTypeSelect.options[fixtureTypeSelect.selectedIndex];
    
    // Get form values
    const formValues = {
        fixtureType: selectedOption.dataset.fixtureType || selectedOption.value,
        quantity: parseInt(document.getElementById('fixture-quantity').value) || 1,
        pattern: document.getElementById('placement-pattern').value,
        color: document.getElementById('fixture-color').value,
        fixtureId: parseInt(document.getElementById('starting-channel').value) || 1
    };
    
    console.log('FixturesModal: Form values:', formValues);
    
    // Get the SVG drawing and its viewport
    const svgDrawing = document.querySelector('#canvas svg');
    if (!svgDrawing) {
        console.error('FixturesModal: SVG drawing not found');
        return;
    }
    
    console.log('FixturesModal: SVG drawing found:', svgDrawing);
    
    // Calculate center position of the viewport
    const viewBox = svgDrawing.viewBox.baseVal;
    const centerX = viewBox.x + (viewBox.width / 2);
    const centerY = viewBox.y + (viewBox.height / 2);
    
    console.log('FixturesModal: Viewport dimensions:', {
        x: viewBox.x,
        y: viewBox.y,
        width: viewBox.width,
        height: viewBox.height,
        centerX,
        centerY
    });
    
    // Get the fixtures group
    const fixturesGroup = getState('fixturesGroup');
    console.log('FixturesModal: Fixtures group:', fixturesGroup);
    
    if (!fixturesGroup) {
        console.error('FixturesModal: No fixtures group found');
        return;
    }
    
    // Create properties object for the fixture
    const properties = {
        id: `fixture-${Date.now()}`,
        channel: formValues.fixtureId.toString(),
        color: formValues.color,
        purpose: document.getElementById('fixture-purpose').value || '',
        fixtureType: formValues.fixtureType,
        position: { x: centerX, y: centerY }
    };
    
    console.log('FixturesModal: Creating fixture with properties:', properties);
    
    // Create the fixture at the center of the viewport
    const fixture = createFixture(formValues.fixtureType, centerX, centerY, properties);
    
    console.log('FixturesModal: Fixture created:', fixture);
    
    // Add to fixtures group
    console.log('FixturesModal: Adding fixture to group');
    fixturesGroup.add(fixture._svgElement);
    
    // Ensure the fixture is visible
    fixture._svgElement.attr({
        'fill-opacity': 1,
        'stroke-opacity': 1,
        'pointer-events': 'all'
    });
    
    // Move to center and ensure it's visible
    console.log('FixturesModal: Moving fixture to center');
    fixture.move(centerX, centerY);
    
    // Bring to front
    fixture._svgElement.front();
    
    console.log('FixturesModal: Fixture creation complete');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-fixtures-modal'));
    if (modal) {
        modal.hide();
    }
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
    
    // Get fixture items from the DOM
    const fixtureItems = document.querySelectorAll('.fixture-item');
    
    // Group fixtures by category
    const fixturesByCategory = {};
    fixtureItems.forEach(item => {
        const categoryPath = item.dataset.categoryPath;
        if (!fixturesByCategory[categoryPath]) {
            fixturesByCategory[categoryPath] = [];
        }
        fixturesByCategory[categoryPath].push(item);
    });
    
    // Populate the select with available fixture types
    Object.entries(fixturesByCategory).forEach(([categoryPath, items]) => {
        // Add category as optgroup
        const optgroup = document.createElement('optgroup');
        optgroup.label = categoryPath;
        
        // Add fixtures in this category
        items.forEach(item => {
            const fixtureId = item.dataset.fixtureId;
            const fixtureName = item.querySelector('strong')?.textContent || 'Unknown Fixture';
            
            if (fixtureId) {
                const option = document.createElement('option');
                option.value = fixtureId;
                option.textContent = fixtureName;
                
                // Store additional data attributes
                if (item.dataset.channel) option.dataset.channel = item.dataset.channel;
                if (item.dataset.color) option.dataset.color = item.dataset.color;
                
                optgroup.appendChild(option);
            }
        });
        
        fixtureTypeSelect.appendChild(optgroup);
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

/**
 * Handle add fixtures button click
 * @private
 */
function _handleAddFixtures() {
    console.log('FixturesModal: Starting fixture creation');
    
    // Get form values
    const fixtureTypeSelect = document.getElementById('fixture-type-select');
    const selectedOption = fixtureTypeSelect.options[fixtureTypeSelect.selectedIndex];
    const fixtureType = selectedOption.dataset.fixtureType;
    const quantity = parseInt(document.getElementById('fixture-quantity').value);
    const pattern = document.getElementById('placement-pattern').value;
    const color = document.getElementById('fixture-color').value;
    const fixtureId = parseInt(document.getElementById('starting-channel').value);
    const channelIncrement = parseInt(document.getElementById('channel-increment').value);
    const purpose = document.getElementById('fixture-purpose').value;

    // Check for duplicate fixture ID
    if (hasDuplicateFixtureId(fixtureId)) {
        console.error('FixturesModal: Duplicate fixture ID found:', fixtureId);
        return;
    }

    // Get SVG drawing
    const svgDrawing = document.querySelector('#svg-drawing');
    if (!svgDrawing) {
        console.error('FixturesModal: SVG drawing not found');
        return;
    }

    // Calculate center position
    const viewBox = svgDrawing.viewBox.baseVal;
    const centerX = viewBox.x + viewBox.width / 2;
    const centerY = viewBox.y + viewBox.height / 2;

    // Create fixture at center
    const fixture = createFixture(fixtureType, centerX, centerY, {
        color,
        fixtureId,
        channelIncrement,
        purpose
    });

    if (!fixture) {
        console.error('FixturesModal: Failed to create fixture');
        return;
    }

    // Apply droppable behavior
    const droppableBehavior = behaviorManager.applyBehavior(fixture, 'droppable', {
        snapToGrid: true,
        gridSize: 10
    });

    if (!droppableBehavior) {
        console.error('FixturesModal: Failed to apply droppable behavior');
        return;
    }

    // Close modal
    fixturesModal.hide();
    const form = document.getElementById('add-fixtures-form');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }

    console.log('FixturesModal: Fixture created and dropped successfully');
}

console.log('Fixtures group:', getState('fixturesGroup'));

