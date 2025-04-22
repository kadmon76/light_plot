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

import elementFactory from './types/element-factory.js';

// Track user's fixture inventory
let userFixtureInventory = [];

// Show fixture properties in the properties panel
function showFixtureProperties(fixtureElement) {
    console.log('showFixtureProperties called with element:', fixtureElement);
    const propertiesPanel = document.getElementById('fixture-properties');
    
    // Log all properties to understand what's available
    console.log('Fixture Element Properties:', fixtureElement.properties());
    
    // Try multiple ways to find the fixture item
    let fixtureItem = null;
    
    // Try finding by instance ID first
    fixtureItem = document.querySelector(`.fixture-item[data-fixture-id="${fixtureElement.id()}"]`);
    
    // If not found, try by fixture type
    if (!fixtureItem) {
        const fixtureType = fixtureElement.prop('fixtureType') || fixtureElement.prop('fixture_type');
        fixtureItem = document.querySelector(`.fixture-item:contains("${fixtureType}")`);
    }
    
    console.log('Fixture item from DOM:', fixtureItem);
    
    if (!propertiesPanel) {
        console.error('Properties panel not found');
        return;
    }
    
    // Show the panel
    propertiesPanel.style.display = 'block';
    
    // Make sure properties tab is active
    const propertiesTab = document.getElementById('properties-tab');
    if (propertiesTab) {
        const tabInstance = new bootstrap.Tab(propertiesTab);
        tabInstance.show();
    }
    
    // Get fixture properties with more robust fallbacks
    const channel = fixtureElement.prop('channel') || 
                    (fixtureItem ? fixtureItem.dataset.channel : '') || 
                    '1';
    const dimmer = fixtureElement.prop('dimmer') || '';
    const color = fixtureElement.prop('color') || 
                  (fixtureItem ? fixtureItem.dataset.color : '') || 
                  '#0066cc';
    const purpose = fixtureElement.prop('purpose') || '';
    const notes = fixtureElement.prop('notes') || '';
    const locked = fixtureElement.isLocked && fixtureElement.isLocked();
    
    console.log('Extracted properties:', { 
        channel, dimmer, color, purpose, notes, locked 
    });
    
    // Set form values
    const channelInput = document.getElementById('channel');
    const dimmerInput = document.getElementById('dimmer');
    const colorInput = document.getElementById('color');
    const purposeInput = document.getElementById('purpose');
    const notesInput = document.getElementById('notes');
    
    if (channelInput) channelInput.value = channel;
    if (dimmerInput) dimmerInput.value = dimmer;
    if (colorInput) colorInput.value = color;
    if (purposeInput) purposeInput.value = purpose;
    if (notesInput) notesInput.value = notes;
    
    // Add or update lock toggle
    let lockToggle = document.getElementById('fixture-locked');
    if (lockToggle) {
        lockToggle.checked = locked;
    }
    
    // Event listeners for property changes
    if (channelInput) {
        channelInput.onchange = function() {
            fixtureElement.prop('channel', this.value);
        };
    }
    
    if (dimmerInput) {
        dimmerInput.onchange = function() {
            fixtureElement.prop('dimmer', this.value);
        };
    }
    
    if (colorInput) {
        colorInput.onchange = function() {
            fixtureElement.prop('color', this.value);
        };
    }
    
    if (purposeInput) {
        purposeInput.onchange = function() {
            fixtureElement.prop('purpose', this.value);
        };
    }
    
    if (notesInput) {
        notesInput.onchange = function() {
            fixtureElement.prop('notes', this.value);
        };
    }
    
    if (lockToggle) {
        lockToggle.onchange = function() {
            fixtureElement.lock(this.checked);
        };
    }
    
    // Add rotation input if it exists in the DOM
    const rotationInput = document.getElementById('fixture-rotation');
    if (rotationInput) {
        rotationInput.value = fixtureElement.prop('rotation') || 0;
        rotationInput.onchange = function() {
            const rotation = parseInt(this.value) || 0;
            fixtureElement.rotate(rotation);
        };
    }
    
    // Store reference to current element being edited
    propertiesPanel.dataset.currentElementId = fixtureElement.id();
    console.log(`Showing properties for fixture: ${fixtureElement.id()}`);
}

function loadFixture(fixtureData) {
    // Use ElementFactory to create the fixture
    const fixtureElement = elementFactory.loadFixture(fixtureData);
    
    // Add to inventory
    addToInventory(fixtureElement);
    
    return fixtureElement;
}

// Inventory functions

// Add a fixture to user's inventory
function addToInventory(fixtureElement) {
    // Check if the input is actually a fixture element
    if (!fixtureElement || typeof fixtureElement.serialize !== 'function') {
        console.error('Invalid fixture element provided to addToInventory');
        return null;
    }

    // Serialize the fixture element to get its data
    try{
        const inventoryData = {
            ...fixtureElement.serialize(),
            // Add any additional display-specific information
            displayInfo: {
                type: fixtureElement.prop('fixtureType'),
                channel: fixtureElement.prop('channel'),
                instanceId: fixtureElement.id()
            }
        };

        // Add to inventory array
        userFixtureInventory.push(inventoryData);

        // Update UI (consider making this more decoupled in future)
        updateInventoryDisplay();
        console.log('Fixture added to inventory:', fixtureElement.id());
        return inventoryData;
    } catch (error) {
        console.error('Error adding fixture to inventory:', error);
        showToast('Error', 'Could not process fixture', 'error');
    }
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