/**
 * Light Plot Designer - Editor JavaScript
 * 
 * This file is the entry point for the lighting plot editor application.
 * It imports and initializes all the modules.
 */

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if SVG.js is properly loaded
    if (typeof SVG !== 'function') {
        console.error('SVG.js library not loaded!');
        alert('Error: Required SVG.js library is not loaded. Please refresh the page.');
        return;
    }

    // Import modules
    import('./core.js')
        .then(core => {
            // Initialize the editor
            try {
                
                core.initEditor();
                
                // Set up save button
                const saveButton = document.getElementById('save-button');
                if (saveButton) {
                    import('./io.js').then(io => {
                        saveButton.addEventListener('click', io.savePlot);
                        
                        // Check if we're editing an existing plot
                        const plotId = window.location.pathname.match(/\/editor\/(\d+)/)?.[1];
                        if (plotId) {
                            io.loadPlot(plotId);
                        }
                    });
                }
            } catch (error) {
                console.error('Error initializing editor:', error);
            }
        })
        .catch(err => {
            console.error('Error loading modules:', err);
            alert('Error: Failed to load editor modules. Please refresh the page or check the console for details.');
        });
});