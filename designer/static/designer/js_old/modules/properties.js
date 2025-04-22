/**
 * Light Plot Designer - Properties Module
 *
 * Handles properties panel functionality for fixtures and stage
 */
console.log('Loading properties module');
import { 
    gridGroup, 
    selectedFixtures, 
    selectedPipe,
    setSelectedPipe,
    clearSelectedFixtures
} from './core.js';

import { showFixtureProperties } from './fixtures.js';
import { showPipeProperties } from './pipes.js';

// Set up property panel interactions
function setupPropertyPanel() {
    const propertiesPanel = document.getElementById('fixture-properties');
    const pipePropertiesPanel = document.getElementById('pipe-properties');

    console.log('Setting up property panel event listeners');

    // Listen for element selection events from the event system
    document.addEventListener('element:selected', function(event) {
        console.log('Property Panel: Received element:selected event', event.detail);
        const element = event.detail.element;
        
        if (!element){
            console.log('Property Panel: No element provided in event');
            return;
        }
        console.log(`Property Panel: Selected element type is ${element.type()}`);

        // Handle different element types
        switch(element.type()) {
            case 'fixture':
                console.log('Property Panel: Showing fixture properties');
                // Show fixture properties and hide pipe properties
                if (pipePropertiesPanel) pipePropertiesPanel.style.display = 'none';
                showFixtureProperties(element);
                break;
                
            case 'pipe':
                // Show pipe properties and hide fixture properties
                console.log('Property Panel: Showing pipe properties');
                if (propertiesPanel) propertiesPanel.style.display = 'none';
                showPipeProperties(element);
                break;
                
            default:
                // Unknown element type, hide all property panels
                console.log(`Property Panel: Unknown element type: ${element.type()}`);
                if (propertiesPanel) propertiesPanel.style.display = 'none';
                if (pipePropertiesPanel) pipePropertiesPanel.style.display = 'none';
                break;
        }
    });
    
    // Listen for element deselection
    document.addEventListener('element:deselected', function(event) {
        console.log('Element deselected event received:', event.detail);
        // Hide property panels when elements are deselected
        if (propertiesPanel){
            propertiesPanel.style.display = 'none';
            console.log('Hiding fixture properties panel');
        }
        if (pipePropertiesPanel) {
            pipePropertiesPanel.style.display = 'none';
            console.log('Hiding pipe properties panel');
        }
    });
    console.log('Property panel event listeners setup complete');
    // Listen for property changes to update UI if needed
    document.addEventListener('element:propertyChange', function(event) {
        const { elementId, elementType, propertyKey, propertyValue } = event.detail;
        
        // Get the currently displayed element ID
        const currentElementId = propertiesPanel?.dataset.currentElementId || 
                                pipePropertiesPanel?.dataset.currentElementId;
        
        // Only update UI if this is the element being displayed
        if (currentElementId === elementId) {
            // Find the input for this property
            const input = document.getElementById(propertyKey);
            if (input && input.value !== propertyValue) {
                input.value = propertyValue;
            }
        }
    });
    
    // Handle stage properties
    const stageSelect = document.getElementById('stage-select');
    if (stageSelect) {
        stageSelect.addEventListener('change', function() {
            const stageId = this.value;
            console.log(`Selected stage: ${stageId}`);
            // In a full implementation, this would update the stage
        });
    }
    
    // Handle grid toggle
    const showGridCheckbox = document.getElementById('show-grid');
    if (showGridCheckbox) {
        showGridCheckbox.addEventListener('change', function() {
            gridGroup.style('display', this.checked ? 'block' : 'none');
        });
    }
    
    // Handle grid size
    const gridSizeInput = document.getElementById('grid-size');
    if (gridSizeInput) {
        gridSizeInput.addEventListener('change', function() {
            // Redraw grid with new size
            console.log(`Grid size changed to: ${this.value}`);
            // In a full implementation, this would update the grid
        });
    }
    
    // Canvas click handler for deselecting
    document.getElementById('canvas').addEventListener('click', function(event) {
        if (event.target.id === 'canvas' || event.target.tagName === 'svg') {
            // Clear selections and hide property panels
            clearSelections();
            
            // Hide property panels
            if (propertiesPanel) {
                propertiesPanel.style.display = 'none';
            }
            
            if (pipePropertiesPanel) {
                pipePropertiesPanel.style.display = 'none';
            }
        }
    });
    
    console.log('Property panel initialized');
}

// Helper function to clear all selections
function clearSelections() {
    // Clear fixture selections
    selectedFixtures.forEach(fixture => {
        if (fixture && fixture.select) {
            fixture.select(false);
        }
    });
    clearSelectedFixtures();
    
    // Clear pipe selection
    if (selectedPipe) {
        if (selectedPipe.select) {
            selectedPipe.select(false);
        }
        setSelectedPipe(null);
    }
    
    // Dispatch deselection event
    document.dispatchEvent(new CustomEvent('element:deselected'));
}

export { setupPropertyPanel };