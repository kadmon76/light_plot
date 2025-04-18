/**
 * Light Plot Designer - Fixtures Module
 *
 * Handles fixture library, fixture placement and manipulation
 */

import { 
    draw, 
    fixturesGroup, 
    selectedFixtures, 
    currentTool, 
    setActiveTool,
    getCanvasPoint,
    showToast,
    clearSelectedFixtures
} from './core.js';

// Track user's fixture inventory
let userFixtureInventory = [];

// Set up fixture library interactions
function setupFixtureLibrary() {
    const fixtureItems = document.querySelectorAll('.fixture-item');
    let selectedFixtureId = null;
    let placementPreviewElement = null;
    
    fixtureItems.forEach(item => {
        item.addEventListener('click', function() {
            const fixtureId = this.getAttribute('data-fixture-id');
            
            // Highlight the selected fixture in the list
            fixtureItems.forEach(fi => fi.classList.remove('selected'));
            this.classList.add('selected');
            
            selectedFixtureId = fixtureId;
            
            if (currentTool !== 'add-fixture') {
                setActiveTool('add-fixture');
            }
            
            console.log(`Selected fixture: ${fixtureId}`);
        });
    });
    
    // Set up canvas events for fixture placement
    const canvas = document.getElementById('canvas');
    
    // Preview fixture position during mousemove
    canvas.addEventListener('mousemove', function(event) {
        if (currentTool === 'add-fixture' && selectedFixtureId) {
            // Convert mouse position to SVG coordinates
            const point = getCanvasPoint(event);
            
            // Create or update placement preview
            showFixturePlacementPreview(selectedFixtureId, point.x, point.y);
        }
    });
    
    // Place fixture on click
    canvas.addEventListener('click', function(event) {
        if (currentTool === 'add-fixture' && selectedFixtureId) {
            // Convert mouse position to SVG coordinates
            const point = getCanvasPoint(event);
            
            // Place fixture at this position
            placeFixture(selectedFixtureId, point.x, point.y);
            
            // Remove preview after placement
            if (placementPreviewElement) {
                placementPreviewElement.remove();
                placementPreviewElement = null;
            }
        }
    });
    
    // Set up keyboard deletion for fixtures
    document.addEventListener('keydown', function(event) {
        if ((event.key === 'Delete' || event.key === 'Backspace') && selectedFixtures.length > 0) {
            deleteSelectedFixtures();
        }
    });
    
    // Add delete button to properties panel
    const propertiesPanel = document.getElementById('fixture-properties');
    if (propertiesPanel) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger mt-3';
        deleteButton.textContent = 'Delete Fixture';
        deleteButton.id = 'delete-fixture-btn';
        deleteButton.addEventListener('click', deleteSelectedFixtures);
        
        // Add after the properties form
        const propertiesForm = document.getElementById('fixture-properties-form');
        if (propertiesForm) {
            propertiesForm.appendChild(deleteButton);
        }
    }
    
    // Show preview of fixture during placement
    function showFixturePlacementPreview(fixtureId, x, y) {
        // Remove existing preview
        if (placementPreviewElement) {
            placementPreviewElement.remove();
        }
        
        // For now, we'll use a simple circle as a placeholder
        // In a full implementation, this would use the actual fixture SVG
        placementPreviewElement = draw.circle(30)
            .fill('rgba(0, 150, 255, 0.5)')
            .stroke({ width: 1, color: '#0066cc', dasharray: '5,5' })
            .center(x, y)
            .attr('data-fixture-id', fixtureId);
            
        // Add a label with fixture type
        const fixtureType = document.querySelector(`.fixture-item[data-fixture-id="${fixtureId}"]`).textContent.trim();
        draw.text(fixtureType)
            .font({ size: 10, family: 'Arial' })
            .center(x, y + 25)
            .addTo(placementPreviewElement);
    }
    
    // Actually place a fixture on the plot
    function placeFixture(fixtureId, x, y) {
        // Create a unique ID for this fixture instance
        const fixtureInstanceId = `fixture-${Date.now()}`;
        
        // For now, we'll use a simple circle
        // In a full implementation, this would use the SVG from the fixture model
        const fixtureElement = draw.group().id(fixtureInstanceId);
        fixtureElement.circle(30)
            .fill('#0066cc')
            .center(0, 0);
            
        // Add fixture number/channel
        fixtureElement.circle(16)
            .fill('white')
            .center(0, 0);
            
        fixtureElement.text("1")
            .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
            .center(0, 0);
            
        // Position the fixture
        fixtureElement.center(x, y);
        
        // Get fixture type for inventory tracking
        const fixtureType = document.querySelector(`.fixture-item[data-fixture-id="${fixtureId}"]`).textContent.trim();
        
        // Store fixture data
        fixtureElement.attr({
            'data-fixture-id': fixtureId,
            'data-fixture-instance-id': fixtureInstanceId,
            'data-fixture-type': fixtureType,
            'data-channel': 1, // Default channel
            'data-purpose': '',
            'data-color': '',
            'data-notes': '',
            'data-dimmer': '',
            'data-rotation': 0,
            'data-locked': false
        });
        
        // Add to fixtures group
        fixturesGroup.add(fixtureElement);
        
        // Make the fixture selectable
        makeFixtureSelectable(fixtureElement);
        
        // Add to user's inventory
        addToInventory(fixtureInstanceId, fixtureId, fixtureType);
        
        console.log(`Placed fixture ${fixtureId} at position ${x},${y}`);
        
        // After placing, switch back to select tool
        setActiveTool('select');
    }
    
    // Make a fixture instance selectable and draggable
    function makeFixtureSelectable(fixtureElement) {
        fixtureElement.click(function(event) {
            // Prevent event bubbling
            event.stopPropagation();
            
            if (currentTool === 'select') {
                // Check if we're holding shift for multi-select
                if (event.shiftKey) {
                    // Add to selection without deselecting others
                    if (!selectedFixtures.includes(fixtureElement)) {
                        selectedFixtures.push(fixtureElement);
                        fixtureElement.stroke({ width: 2, color: '#ff3300' });
                    }
                } else {
                    // Deselect previously selected fixtures
                    selectedFixtures.forEach(f => {
                        f.stroke({ width: 0 });
                    });
                    
                    // Select this fixture
                    clearSelectedFixtures();
                    selectedFixtures.push(fixtureElement);
                    fixtureElement.stroke({ width: 2, color: '#ff3300' });
                    
                    // Show properties
                    showFixtureProperties(fixtureElement);
                }
            }
        });
        
        // Double click to edit rotation
        fixtureElement.dblclick(function(event) {
            event.stopPropagation();
            
            if (currentTool === 'select') {
                // Toggle rotation - rotate by 45 degrees
                const currentRotation = parseInt(fixtureElement.attr('data-rotation') || 0);
                const newRotation = (currentRotation + 45) % 360;
                
                // Apply rotation
                fixtureElement.rotate(newRotation);
                fixtureElement.attr('data-rotation', newRotation);
                
                console.log(`Fixture rotated to ${newRotation} degrees`);
            }
        });
        
        // Check if draggable needs to be disabled (for locked fixtures)
        const isLocked = fixtureElement.attr('data-locked') === 'true';
        if (!isLocked) {
            // Make draggable
            fixtureElement.draggable();
            
            // Update properties when dragged
            fixtureElement.on('dragend', function() {
                // Update position in plot data
                console.log(`Fixture moved to ${fixtureElement.cx()},${fixtureElement.cy()}`);
                
                // Update inventory position
                updateInventoryPosition(
                    fixtureElement.attr('data-fixture-instance-id'), 
                    fixtureElement.cx(), 
                    fixtureElement.cy()
                );
            });
        }
    }
    
    // Function to lock/unlock a fixture in place
    function toggleFixtureLock(fixtureElement) {
        const currentLocked = fixtureElement.attr('data-locked') === 'true';
        const newLocked = !currentLocked;
        
        // Update attribute
        fixtureElement.attr('data-locked', newLocked);
        
        if (newLocked) {
            // Disable dragging
            fixtureElement.draggable(false);
            // Visual indicator for locked state
            fixtureElement.stroke({ width: 1, color: '#999999' });
        } else {
            // Enable dragging
            fixtureElement.draggable(true);
            // Update visual indicator
            if (selectedFixtures.includes(fixtureElement)) {
                fixtureElement.stroke({ width: 2, color: '#ff3300' });
            } else {
                fixtureElement.stroke({ width: 0 });
            }
        }
        
        // Update inventory
        updateInventoryLockState(
            fixtureElement.attr('data-fixture-instance-id'), 
            newLocked
        );
        
        console.log(`Fixture ${newLocked ? 'locked' : 'unlocked'}`);
    }
    
    // Delete selected fixtures
    function deleteSelectedFixtures() {
        if (selectedFixtures.length === 0) return;
        
        selectedFixtures.forEach(fixture => {
            const instanceId = fixture.attr('data-fixture-instance-id');
            
            // Remove from inventory
            removeFromInventory(instanceId);
            
            // Remove from canvas
            fixture.remove();
        });
        
        // Clear selection
        clearSelectedFixtures();
        
        // Hide properties panel
        const propertiesPanel = document.getElementById('fixture-properties');
        if (propertiesPanel) {
            propertiesPanel.style.display = 'none';
        }
        
        showToast('Fixtures Deleted', `${selectedFixtures.length} fixture(s) removed`);
        
        console.log('Fixtures deleted');
    }
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
    const fixtureId = fixtureData.fixture_id;
    const instanceId = fixtureData.instance_id || `fixture-${Date.now()}`;
    const x = fixtureData.x || 0;
    const y = fixtureData.y || 0;
    const rotation = fixtureData.rotation || 0;
    const locked = fixtureData.locked || false;
    
    // Create fixture element
    const fixtureElement = draw.group().id(instanceId);
    fixtureElement.circle(30)
        .fill(fixtureData.color || '#0066cc')
        .center(0, 0);
        
    // Add fixture number/channel
    fixtureElement.circle(16)
        .fill('white')
        .center(0, 0);
        
    fixtureElement.text(fixtureData.channel || '1')
        .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
        .center(0, 0);
        
    // Position and rotate the fixture
    fixtureElement.center(x, y);
    if (rotation) {
        fixtureElement.rotate(rotation);
    }
    
    // Get fixture type for inventory
    const fixtureType = fixtureData.fixture_type || 'Unknown Fixture';
    
    // Store fixture data
    fixtureElement.attr({
        'data-fixture-id': fixtureId,
        'data-fixture-instance-id': instanceId,
        'data-fixture-type': fixtureType,
        'data-channel': fixtureData.channel || '1',
        'data-purpose': fixtureData.purpose || '',
        'data-color': fixtureData.color || '',
        'data-notes': fixtureData.notes || '',
        'data-dimmer': fixtureData.dimmer || '',
        'data-rotation': rotation,
        'data-locked': locked
    });
    
    // Add to fixtures group
    fixturesGroup.add(fixtureElement);
    
    // Make the fixture selectable
    makeFixtureSelectable(fixtureElement);
    
    // Add to user's inventory
    addToInventory(instanceId, fixtureId, fixtureType);
    
    console.log(`Loaded fixture ${fixtureId} from saved data`);
    
    return fixtureElement;
}

export { 
    setupFixtureLibrary, 
    showFixtureProperties,
    loadFixture,
    userFixtureInventory
};