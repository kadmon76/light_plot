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
    getCanvasPoint
} from './core.js';

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
        
        // Store fixture data
        fixtureElement.attr({
            'data-fixture-id': fixtureId,
            'data-fixture-instance-id': fixtureInstanceId,
            'data-channel': 1, // Default channel
            'data-purpose': '',
            'data-color': '',
            'data-notes': '',
            'data-dimmer': '',
        });
        
        // Add to fixtures group
        fixturesGroup.add(fixtureElement);
        
        // Make the fixture selectable
        makeFixtureSelectable(fixtureElement);
        
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
                // Deselect previously selected fixtures
                selectedFixtures.forEach(f => {
                    f.stroke({ width: 0 });
                });
                
                // Select this fixture
                selectedFixtures = [fixtureElement];
                fixtureElement.stroke({ width: 2, color: '#ff3300' });
                
                // Show properties
                showFixtureProperties(fixtureElement);
            }
        });
        
        // Make draggable
        fixtureElement.draggable();
        
        // Update properties when dragged
        fixtureElement.on('dragend', function() {
            // Update position in plot data
            console.log(`Fixture moved to ${fixtureElement.cx()},${fixtureElement.cy()}`);
        });
    }
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
    
    // Set form values
    document.getElementById('channel').value = channel;
    document.getElementById('dimmer').value = dimmer;
    document.getElementById('color').value = color;
    document.getElementById('purpose').value = purpose;
    document.getElementById('notes').value = notes;
    
    // Event listeners for property changes
    document.getElementById('channel').onchange = function() {
        fixtureElement.attr('data-channel', this.value);
        // Update channel number in fixture
        const channelText = fixtureElement.findOne('text');
        if (channelText) {
            channelText.text(this.value || '');
        }
    };
    
    document.getElementById('dimmer').onchange = function() {
        fixtureElement.attr('data-dimmer', this.value);
    };
    
    document.getElementById('color').onchange = function() {
        fixtureElement.attr('data-color', this.value);
        // Could visually update the fixture color
    };
    
    document.getElementById('purpose').onchange = function() {
        fixtureElement.attr('data-purpose', this.value);
    };
    
    document.getElementById('notes').onchange = function() {
        fixtureElement.attr('data-notes', this.value);
    };
}

export { 
    setupFixtureLibrary, 
    showFixtureProperties 
};