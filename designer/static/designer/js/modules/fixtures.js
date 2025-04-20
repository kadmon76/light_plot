// File: designer/static/designer/js/modules/fixtures.js
// UPDATED VERSION - Remove redundant code now in library-panel.js

/**
 * Light Plot Designer - Fixtures Module
 *
 * Handles fixture manipulation and fixture-specific operations
 */

import { 
    fixturesGroup, 
    selectedFixtures,
    showToast,
    clearSelectedFixtures
} from './core.js';

import elementFactory from '../types/element-factory.js';

// Track user's fixture inventory
let userFixtureInventory = [];

// Show fixture properties in the properties panel
function showFixtureProperties(fixtureElement) {
    const propertiesPanel = document.getElementById('fixture-properties');
    
    if (!propertiesPanel) return;
    
    // Show the panel
    propertiesPanel.style.display = 'block';
    
    // Get fixture data
    const fixtureId = fixtureElement.attr('data-fixture-id');
    const instanceId = fixtureElement.attr('data-fixture-instance-id');
    const channel = fixtureElement.attr('data-channel') || '';
    const dimmer = fixtureElement.attr('data-dimmer') || '';
    const color = fixtureElement.attr('data-color') || '';
    const purpose = fixtureElement.attr('data-purpose') || '';
    const notes = fixtureElement.attr('data-notes') || '';
    const locked = fixtureElement.attr('data-locked') === 'true';
    
    // Set form values
    document.getElementById('channel').value = channel;
    document.getElementById('dimmer').value = dimmer;
    document.getElementById('color').value = color;
    document.getElementById('purpose').value = purpose;
    document.getElementById('notes').value = notes;
    
    // Add or update lock toggle if it doesn't exist
    let lockToggle = document.getElementById('fixture-lock-toggle');
    if (!lockToggle) {
        const lockContainer = document.createElement('div');
        lockContainer.className = 'mb-3 form-check';
        lockContainer.innerHTML = `
            <input type="checkbox" class="form-check-input" id="fixture-lock-toggle">
            <label class="form-check-label" for="fixture-lock-toggle">Lock fixture in place</label>
        `;
        document.getElementById('fixture-properties-form').insertBefore(
            lockContainer, 
            document.getElementById('delete-fixture-btn')
        );
        lockToggle = document.getElementById('fixture-lock-toggle');
    }
    
    // Set lock state
    lockToggle.checked = locked;
    
    // Add lock toggle handler
    lockToggle.onchange = function() {
        // Update lock state
        fixtureElement.attr('data-locked', this.checked);
        
        // Enable/disable dragging
        if (this.checked) {
            fixtureElement.draggable(false);
        } else {
            fixtureElement.draggable(true);
        }
        
        // Update inventory
        updateInventoryLockState(instanceId, this.checked);
    };
    
    // Add rotation input if it doesn't exist
    let rotationInput = document.getElementById('fixture-rotation');
    if (!rotationInput) {
        const rotationContainer = document.createElement('div');
        rotationContainer.className = 'mb-3';
        rotationContainer.innerHTML = `
            <label for="fixture-rotation" class="form-label">Rotation (degrees)</label>
            <input type="number" class="form-control" id="fixture-rotation" min="0" max="359" step="5">
        `;
        document.getElementById('fixture-properties-form').insertBefore(
            rotationContainer,
            document.getElementById('delete-fixture-btn')
        );
        rotationInput = document.getElementById('fixture-rotation');
    }
    
    // Set rotation value
    rotationInput.value = fixtureElement.attr('data-rotation') || 0;
    
    // Add rotation handler
    rotationInput.onchange = function() {
        const rotation = parseInt(this.value) || 0;
        fixtureElement.rotate(rotation);
        fixtureElement.attr('data-rotation', rotation);
        
        // Update inventory
        updateInventoryRotation(instanceId, rotation);
    };
    
    // Event listeners for property changes
    document.getElementById('channel').onchange = function() {
        fixtureElement.attr('data-channel', this.value);
        // Update channel number in fixture
        const channelText = fixtureElement.findOne('text');
        if (channelText) {
            channelText.text(this.value || '');
        }
        
        // Update inventory
        updateInventoryProperties(instanceId, { channel: this.value });
        
        // Update inventory display
        updateInventoryDisplay();
    };
    
    document.getElementById('dimmer').onchange = function() {
        fixtureElement.attr('data-dimmer', this.value);
        updateInventoryProperties(instanceId, { dimmer: this.value });
    };
    
    document.getElementById('color').onchange = function() {
        fixtureElement.attr('data-color', this.value);
        updateInventoryProperties(instanceId, { color: this.value });
        
        // Visually update the fixture color if it has a specific main circle
        const mainCircle = fixtureElement.findOne('circle');
        if (mainCircle) {
            mainCircle.fill(this.value || '#0066cc');
        }
    };
    
    document.getElementById('purpose').onchange = function() {
        fixtureElement.attr('data-purpose', this.value);
        updateInventoryProperties(instanceId, { purpose: this.value });
    };
    
    document.getElementById('notes').onchange = function() {
        fixtureElement.attr('data-notes', this.value);
        updateInventoryProperties(instanceId, { notes: this.value });
    };
}

// Load a fixture from saved data
function loadFixture(fixtureData) {
    // Use the ElementFactory to create the fixture
    const fixtureElement = elementFactory.loadFixture(fixtureData);
    
    // Add to user's inventory
    const instanceId = fixtureElement.id();
    const fixtureId = fixtureElement.prop('fixtureId');
    const fixtureType = fixtureElement.prop('fixtureType');
    addToInventory(instanceId, fixtureId, fixtureType);
    
    console.log(`Loaded fixture ${fixtureId} from saved data`);
    
    return fixtureElement;
}

// Inventory functions

// Add a fixture to user's inventory
function addToInventory(instanceId, fixtureId, fixtureType) {
    userFixtureInventory.push({
        instanceId: instanceId,
        fixtureId: fixtureId,
        fixtureType: fixtureType,
        position: { x: 0, y: 0 },
        rotation: 0,
        locked: false,
        properties: {
            channel: 1,
            dimmer: '',
            color: '',
            purpose: '',
            notes: ''
        }
    });
    
    // Update inventory display
    updateInventoryDisplay();
}

// Remove a fixture from inventory
function removeFromInventory(instanceId) {
    userFixtureInventory = userFixtureInventory.filter(item => item.instanceId !== instanceId);
    
    // Update inventory display
    updateInventoryDisplay();
}

// Update a fixture's position in inventory
function updateInventoryPosition(instanceId, x, y) {
    const fixture = userFixtureInventory.find(item => item.instanceId === instanceId);
    if (fixture) {
        fixture.position = { x, y };
    }
}

// Update a fixture's rotation in inventory
function updateInventoryRotation(instanceId, rotation) {
    const fixture = userFixtureInventory.find(item => item.instanceId === instanceId);
    if (fixture) {
        fixture.rotation = rotation;
    }
}

// Update a fixture's lock state in inventory
function updateInventoryLockState(instanceId, locked) {
    const fixture = userFixtureInventory.find(item => item.instanceId === instanceId);
    if (fixture) {
        fixture.locked = locked;
    }
}

// Update a fixture's properties in inventory
function updateInventoryProperties(instanceId, properties) {
    const fixture = userFixtureInventory.find(item => item.instanceId === instanceId);
    if (fixture) {
        fixture.properties = { ...fixture.properties, ...properties };
    }
}

// Update inventory display in UI
function updateInventoryDisplay() {
    const inventoryContainer = document.getElementById('user-inventory');
    if (!inventoryContainer) {
        // Create inventory container if it doesn't exist
        createInventoryPanel();
        return;
    }
    
    // Clear current inventory
    inventoryContainer.innerHTML = '';
    
    // Group fixtures by type for a better organized display
    const fixturesByType = {};
    userFixtureInventory.forEach(fixture => {
        if (!fixturesByType[fixture.fixtureType]) {
            fixturesByType[fixture.fixtureType] = [];
        }
        fixturesByType[fixture.fixtureType].push(fixture);
    });
    
    // Create inventory items
    for (const [type, fixtures] of Object.entries(fixturesByType)) {
        // Add type header
        const typeHeader = document.createElement('div');
        typeHeader.className = 'inventory-type-header';
        typeHeader.textContent = `${type} (${fixtures.length})`;
        inventoryContainer.appendChild(typeHeader);
        
        // Add fixtures of this type
        fixtures.forEach(fixture => {
            const fixtureItem = document.createElement('div');
            fixtureItem.className = 'inventory-item';
            fixtureItem.dataset.instanceId = fixture.instanceId;
            
            // Basic info
            fixtureItem.innerHTML = `
                <div class="inventory-item-preview"></div>
                <div class="inventory-item-info">
                    <span>Channel: ${fixture.properties.channel}</span>
                    <span>${fixture.locked ? '🔒' : ''}</span>
                </div>
            `;
            
            // Add click handler to select this fixture on the canvas
            fixtureItem.addEventListener('click', () => {
                const fixtureElement = SVG.find(`#${fixture.instanceId}`)[0];
                if (fixtureElement) {
                    // Trigger the click event on the fixture
                    fixtureElement.fire('click');
                }
            });
            
            inventoryContainer.appendChild(fixtureItem);
        });
    }
}

// Create inventory panel if it doesn't exist
function createInventoryPanel() {
    const sidebarRight = document.querySelector('.sidebar-right');
    if (!sidebarRight) return;
    
    // Create inventory section
    const inventorySection = document.createElement('div');
    inventorySection.className = 'card mb-3';
    inventorySection.innerHTML = `
        <div class="card-header">
            <h5 class="mb-0">Your Fixture Inventory</h5>
        </div>
        <div class="card-body" id="user-inventory">
            <p class="text-muted small">No fixtures added yet.</p>
        </div>
    `;
    
    // Add to sidebar
    sidebarRight.appendChild(inventorySection);
}

// Export functions and data
export { 
    showFixtureProperties,
    loadFixture,
    userFixtureInventory,
    addToInventory,
    removeFromInventory,
    updateInventoryPosition,
    updateInventoryRotation,
    updateInventoryLockState,
    updateInventoryProperties
};