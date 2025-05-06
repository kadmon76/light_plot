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
import { createFixture } from '../elements/fixture-element.js';
import behaviorManager from '../behaviors/behavior-manager.js';

// Create the modal when the module is imported
let fixturesModal;
const FIXTURES_MODAL_ID = 'add-fixtures-modal';

/**
 * Initialize the Add Fixtures modal
 */
export function initFixturesModal() {
    // Set up event listener for the Add Fixture button
    setupButtonListener();
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
    
    // Override the click handler
    addFixtureBtn.onclick = function(event) {
        // Open the modal
        openAddFixturesModal();
        
        // Prevent the default action
        event.preventDefault();
    };
}

/**
 * Open the Add Fixtures modal
 */
function openAddFixturesModal() {
    // Create the modal each time to ensure we have fresh data
    createAddFixturesModal();
    
    // Show the modal
    showModal(FIXTURES_MODAL_ID);
}

/**
 * Create the Add Fixtures modal
 */
function createAddFixturesModal() {
    // Create the modal body content
    const modalBody = createModalBody();
    
    // Create the modal
    fixturesModal = createModal({
        id: FIXTURES_MODAL_ID,
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
            // Reset form when modal is hidden
            const form = document.getElementById('add-fixtures-form');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
        }
    });
}


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

/**
 * Set up Bootstrap validation
 */
function setupBootstrapValidation() {
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
    
    // Get the SVG drawing and its viewport
    const svgDrawing = document.querySelector('#canvas svg');
    if (!svgDrawing) {
        console.error('FixturesModal: SVG drawing not found');
        return;
    }
    
    // Calculate center position of the viewport
    const viewBox = svgDrawing.viewBox.baseVal;
    const centerX = viewBox.x + (viewBox.width / 2);
    const centerY = viewBox.y + (viewBox.height / 2);
    
    // Get the fixtures group
    const fixturesGroup = getState('fixturesGroup');
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
    
    // Create the fixture at the center of the viewport
    const fixture = createFixture(formValues.fixtureType, centerX, centerY, properties);
    
    try {
        // Get SVG document and fixtures group
        const svgDoc = document.querySelector('#canvas svg');
        const fixturesGroupElement = document.getElementById('fixtures-group');
        
        if (svgDoc && fixturesGroupElement) {
            // Find the fixture item in the DOM to get its SVG icon
            const fixtureId = selectedOption.value;
            const fixtureItem = document.querySelector(`.fixture-item[data-fixture-id="${fixtureId}"]`);
            let svgIcon = '';
            
            // Default fixture appearance if we can't find custom SVG
            if (fixtureItem && fixtureItem.getAttribute('data-svg-icon')) {
                // Use SVG icon from the fixture library
                svgIcon = fixtureItem.getAttribute('data-svg-icon');
            }
            
            // Create a new group for the fixture with SVG namespace
            const fixtureGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            fixtureGroup.id = 'library-fixture-' + Date.now();
            
            // If we have a SVG icon, use it, otherwise create a default fixture
            if (svgIcon && svgIcon.trim().length > 0) {
                // Parse the SVG icon and add it to the fixture group
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = svgIcon;
                const svgElement = tempDiv.querySelector('svg');
                
                if (svgElement) {
                    // Extract all child elements from the SVG and add them to our fixture group
                    const svgChildren = svgElement.childNodes;
                    for (let i = 0; i < svgChildren.length; i++) {
                        const node = svgChildren[i];
                        // Only append actual element nodes, not comments or text nodes
                        if (node.nodeType === 1) { // 1 = Element node
                            fixtureGroup.appendChild(node.cloneNode(true));
                        }
                    }
                    
                    // Make the fixture highly visible
                    const rects = fixtureGroup.querySelectorAll('rect');
                    for (let i = 0; i < rects.length; i++) {
                        rects[i].setAttribute('fill', '#FF00FF');
                        rects[i].setAttribute('stroke-width', '3');
                    }
                    
                    // Add channel indicator
                    const channelCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    channelCircle.setAttribute('r', '10');
                    channelCircle.setAttribute('cx', '50');
                    channelCircle.setAttribute('cy', '60');
                    channelCircle.setAttribute('fill', 'white');
                    channelCircle.setAttribute('stroke', '#000000');
                    channelCircle.setAttribute('stroke-width', '1');
                    fixtureGroup.appendChild(channelCircle);
                    
                    // Add channel number
                    const channelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    channelText.setAttribute('x', '50');
                    channelText.setAttribute('y', '65');
                    channelText.setAttribute('text-anchor', 'middle');
                    channelText.setAttribute('font-size', '12');
                    channelText.setAttribute('font-family', 'Arial');
                    channelText.setAttribute('font-weight', 'bold');
                    channelText.textContent = properties.channel;
                    fixtureGroup.appendChild(channelText);
                } else {
                    // Fallback to default if SVG parsing failed
                    createDefaultFixture(fixtureGroup, properties.channel, properties.color);
                }
            } else {
                // Create default fixture shape if no SVG icon available
                createDefaultFixture(fixtureGroup, properties.channel, properties.color);
            }
            
            // Add fixture group to fixtures group
            fixturesGroupElement.appendChild(fixtureGroup);
            
            // Position at the center of viewport
            fixtureGroup.setAttribute('transform', `translate(${centerX}, ${centerY}) scale(1.5)`);
        }
    } catch(error) {
        console.error('Error creating library fixture:', error);
    }
    
    // Helper function to create a default fixture
    function createDefaultFixture(group, channelNumber, color) {
        // Create a rectangle for the fixture body
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '80');
        rect.setAttribute('height', '80');
        rect.setAttribute('x', '-40');
        rect.setAttribute('y', '-40');
        rect.setAttribute('fill', color || '#FF0000');
        rect.setAttribute('stroke', '#000000');
        rect.setAttribute('stroke-width', '3');
        
        // Create a circle for the channel
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '15');
        circle.setAttribute('cx', '0');
        circle.setAttribute('cy', '0');
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', '#000000');
        circle.setAttribute('stroke-width', '2');
        
        // Create text for the channel number
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '0');
        text.setAttribute('y', '5');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-family', 'Arial');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#000000');
        text.textContent = channelNumber || '1';
        
        // Add everything to the fixture group
        group.appendChild(rect);
        group.appendChild(circle);
        group.appendChild(text);
    }
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-fixtures-modal'));
    if (modal) {
        modal.hide();
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

