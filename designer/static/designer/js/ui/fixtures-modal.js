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

/**
 * Open the Add Fixtures modal
 */
function openAddFixturesModal() {
    console.log('FixturesModal: Opening Add Fixtures modal');
    
    // Create the modal each time to ensure we have fresh data
    createAddFixturesModal();
    
    // Show the modal
    showModal('add-fixtures-modal');
}

/**
 * Create the Add Fixtures modal
 */
function createAddFixturesModal() {
    console.log('FixturesModal: Creating Add Fixtures modal');
    
    // Create the modal body content
    const modalBody = createModalBody();
    
    // Create the modal
    fixturesModal = createModal({
        id: 'add-fixtures-modal',
        title: 'Add Fixtures',  // Simplified title
        body: modalBody,
        size: 'lg',
        confirmButton: 'Add',
        cancelButton: 'Cancel',
        onConfirm: handleAddFixtures,
        onShow: handleModalShow,
        onHide: () => console.log('FixturesModal: Modal hidden')
    });
    
    console.log('FixturesModal: Add Fixtures modal created');
}

/**
 * Create the modal body content
 * @return {HTMLElement} The modal body content
 */
function createModalBody() {
    // Create a container for the modal body
    const container = document.createElement('div');
    
    // Add the form content
    container.innerHTML = `
        <form id="add-fixtures-form">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Fixture Type</label>
                    <select class="form-select" id="fixture-type-select">
                        <option value="" disabled selected>Select fixture type...</option>
                        <!-- Fixture options will be populated dynamically from backend data -->
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-control" id="fixture-quantity" min="1" value="1">
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Placement Pattern</label>
                    <select class="form-select" id="placement-pattern">
                        <option value="line">Line</option>
                        <option value="grid">Grid</option>
                        <option value="circle">Circle</option>
                        <option value="manual">Manual (one by one)</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Color</label>
                    <input type="color" class="form-control" id="fixture-color" value="#0066cc">
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Starting Channel</label>
                    <input type="number" class="form-control" id="starting-channel" min="1" value="1">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Channel Increment</label>
                    <input type="number" class="form-control" id="channel-increment" min="1" value="1">
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
 * Handle modal show event - populate fixture types from available fixtures
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
    
    // Add pattern-specific options
    switch (selectedPattern) {
        case 'line':
            patternOptionsContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">Line Options</div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Direction</label>
                                <select class="form-select" id="line-direction">
                                    <option value="horizontal">Horizontal</option>
                                    <option value="vertical">Vertical</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Spacing (px)</label>
                                <input type="number" class="form-control" id="line-spacing" min="20" value="50">
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
                                <input type="number" class="form-control" id="grid-rows" min="1" value="3">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Columns</label>
                                <input type="number" class="form-control" id="grid-columns" min="1" value="3">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <label class="form-label">Horizontal Spacing (px)</label>
                                <input type="number" class="form-control" id="grid-h-spacing" min="20" value="50">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Vertical Spacing (px)</label>
                                <input type="number" class="form-control" id="grid-v-spacing" min="20" value="50">
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
                                <input type="number" class="form-control" id="circle-radius" min="50" value="100">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Start Angle (degrees)</label>
                                <input type="number" class="form-control" id="circle-start-angle" min="0" max="359" value="0">
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
}

/**
 * Handle adding fixtures when the confirm button is clicked
 */
function handleAddFixtures() {
    console.log('FixturesModal: Add fixtures button clicked');
    
    // This will be implemented in the next chat
    // For now, just log that it was clicked
}

// Export the module functions
export default {
    initFixturesModal
};