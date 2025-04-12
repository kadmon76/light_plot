/**
 * Light Plot Designer - I/O Module
 *
 * Handles saving and loading of plots
 */

import { 
    paperSize, 
    stageDimensions, 
    viewportInfo, 
    fixturesGroup, 
    pipesGroup,
    updateViewport,
    getCsrfToken, 
    showToast 
} from './core.js';

import { loadPipe } from './pipes.js';

// Save the current plot
function savePlot() {
    // Check if we're editing an existing plot
    const plotId = document.querySelector('input[name="plot_id"]')?.value;
    const plotTitle = document.querySelector('input[name="plot_title"]')?.value || 'Untitled Plot';
    const stageId = document.getElementById('stage-select')?.value;
    
    if (!stageId) {
        alert('Please select a stage first');
        return;
    }
    
    // Collect all fixtures data
    const fixturesData = [];
    fixturesGroup.children().forEach(fixtureElement => {
        // Get fixture position (center point)
        const pos = fixtureElement.bbox();
        const x = pos.cx;
        const y = pos.cy;
        
        // Get other fixture data from attributes
        fixturesData.push({
            fixture_id: fixtureElement.attr('data-fixture-id'),
            x: x,
            y: y,
            rotation: fixtureElement.transform().rotation || 0,
            channel: fixtureElement.attr('data-channel') || null,
            dimmer: fixtureElement.attr('data-dimmer') || null,
            color: fixtureElement.attr('data-color') || '',
            purpose: fixtureElement.attr('data-purpose') || '',
            notes: fixtureElement.attr('data-notes') || ''
        });
    });
    
    // Collect all pipes data
    const pipesData = [];
    pipesGroup.children().forEach(pipeElement => {
        // Get pipe position
        const pos = pipeElement.bbox();
        
        // Get other pipe data from attributes
        pipesData.push({
            pipe_id: pipeElement.attr('data-pipe-id'),
            pipe_name: pipeElement.attr('data-pipe-name'),
            pipe_type: pipeElement.attr('data-pipe-type'),
            pipe_length: pipeElement.attr('data-pipe-length'),
            pipe_color: pipeElement.attr('data-pipe-color'),
            x: pipeElement.x(),
            y: pipeElement.y(),
            rotation: pipeElement.transform().rotation || 0
        });
    });
    
    // Get additional plot data if needed (like stage configuration, etc.)
    const plotData = {
        paperSize: {
            width: paperSize.width,
            height: paperSize.height
        },
        stageDimensions: stageDimensions,
        viewportInfo: viewportInfo,
        pipes: pipesData
    };
    
    // Prepare data for submission
    const data = {
        plot_id: plotId || null,
        title: plotTitle,
        stage_id: stageId,
        fixtures: fixturesData,
        plot_data: plotData
    };
    
    // Show saving indicator
    const saveButton = document.getElementById('save-button');
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    saveButton.disabled = true;
    
    // Submit to server
    fetch('/designer/api/plot/save/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Update plot ID if this was a new plot
            if (!plotId && result.plot_id) {
                // Add the plot ID to the form for future saves
                const plotIdInput = document.createElement('input');
                plotIdInput.type = 'hidden';
                plotIdInput.name = 'plot_id';
                plotIdInput.value = result.plot_id;
                document.body.appendChild(plotIdInput);
                
                // Update URL to reflect the new plot ID
                const newUrl = window.location.pathname.replace('/editor/', `/editor/${result.plot_id}/`);
                window.history.replaceState({}, '', newUrl);
            }
            
            // Show success message
            showToast('Success', 'Plot saved successfully', 'success');
        } else {
            showToast('Error', result.message || 'Error saving plot', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving plot:', error);
        showToast('Error', 'Failed to save plot', 'error');
    })
    .finally(() => {
        // Restore save button
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
    });
}

// Load an existing plot
function loadPlot(plotId) {
    if (!plotId) return;
    
    // Show loading indicator
    showToast('Loading', 'Loading plot...', 'info');
    
    fetch(`/designer/api/plot/${plotId}/`)
        .then(response => response.json())
        .then(data => {
            // Clear existing fixtures and pipes
            fixturesGroup.clear();
            pipesGroup.clear();
            
            // If there's stage data, update the stage
            if (data.plot.stage_id) {
                const stageSelect = document.getElementById('stage-select');
                if (stageSelect) {
                    stageSelect.value = data.plot.stage_id;
                    // TODO: Redraw stage based on selection
                }
            }
            
            // If there's plot data, restore viewbox and other settings
            if (data.plot.plot_data) {
                if (data.plot.plot_data.viewportInfo) {
                    viewportInfo = data.plot.plot_data.viewportInfo;
                    updateViewport();
                }
                
                if (data.plot.plot_data.stageDimensions) {
                    stageDimensions = data.plot.plot_data.stageDimensions;
                    // Will need to import and call drawDefaultStage here
                    // For now, stageDimension changes will be applied on next editor load
                }
                
                // Load pipes if they exist
                if (data.plot.plot_data.pipes && Array.isArray(data.plot.plot_data.pipes)) {
                    data.plot.plot_data.pipes.forEach(pipe => {
                        loadPipe(pipe);
                    });
                }
            }
            
            // Add fixtures to the plot
            // Fixtures would be loaded here
            // This functionality will need to be moved to the fixtures module
            // For now, we'll just show a message
            console.log('Plot contains', data.fixtures.length, 'fixtures to load');
            
            showToast('Success', 'Plot loaded successfully', 'success');
        })
        .catch(error => {
            console.error('Error loading plot:', error);
            showToast('Error', 'Failed to load plot', 'error');
        });
}

export { savePlot, loadPlot };