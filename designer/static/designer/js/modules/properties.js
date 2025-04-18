/**
 * Light Plot Designer - Properties Module
 *
 * Handles properties panel functionality for fixtures and stage
 */

import { 
    gridGroup, 
    selectedFixtures, 
    selectedPipe,
    setSelectedPipe,
    clearSelectedFixtures
} from './core.js';

import { showFixtureProperties } from './fixtures.js';

// Set up property panel interactions
function setupPropertyPanel() {
    const propertiesPanel = document.getElementById('fixture-properties');
    const propertiesForm = document.getElementById('fixture-properties-form');
    
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
            // Deselect all
            selectedFixtures.forEach(f => {
                if (f && typeof f.stroke === 'function') {
                    f.stroke({ width: 0 });
                }
            });
            // Clear the array using the helper function
            clearSelectedFixtures();
            
            if (selectedPipe) {
                // Clear selection styling
                selectedPipe.removeClass('selected');
                
                // Reset stroke unless the pipe is locked
                const pipeRect = selectedPipe.findOne('rect');
                const isLocked = selectedPipe.attr('data-locked') === 'true';
                
                if (pipeRect) {
                    if (isLocked) {
                        // Keep green stroke for locked pipes
                        pipeRect.stroke({ width: 2, color: '#009900' });
                    } else {
                        // Reset to default stroke
                        pipeRect.stroke({ width: 1, color: '#000' });
                    }
                }
                
                // Use the imported function to set selectedPipe to null
                setSelectedPipe(null);
            }
            
            // Hide property panels
            if (propertiesPanel) {
                propertiesPanel.style.display = 'none';
            }
            
            // Also hide pipe properties panel
            const pipePropertiesPanel = document.getElementById('pipe-properties');
            if (pipePropertiesPanel) {
                pipePropertiesPanel.style.display = 'none';
            }
        }
    });
    
    console.log('Property panel initialized');
}

export { setupPropertyPanel };