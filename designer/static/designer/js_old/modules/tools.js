/**
 * Light Plot Designer - Tools Module
 *
 * Handles tool selection and tool-related operations
 */

import { 
    setActiveTool, 
    currentTool, 
    viewportInfo, 
    updateViewport, 
    zoomCanvas
} from './core.js';

// Set up tool button handlers
function setupToolHandlers() {
    // Select tool
    document.getElementById('select-tool').addEventListener('click', function() {
        setActiveTool('select');
    });
    
    // Add fixture tool
    document.getElementById('add-fixture-tool').addEventListener('click', function() {
        setActiveTool('add-fixture');
    });
    
    // Pan tool
    document.getElementById('pan-tool').addEventListener('click', function() {
        setActiveTool('pan');
    });
    
    // Zoom in
    document.getElementById('zoom-in').addEventListener('click', function() {
        zoomCanvas(1.2);
    });
    
    // Zoom out
    document.getElementById('zoom-out').addEventListener('click', function() {
        zoomCanvas(0.8);
    });
    
    // Set up keyboard shortcuts
    let tempTool = null;
    
    document.addEventListener('keydown', function(event) {
        // Escape key - switch to select tool
        if (event.key === 'Escape') {
            setActiveTool('select');
        }
        
        // Space key - switch to pan tool temporarily
        if (event.key === ' ' && !event.repeat) {
            // Save current tool and switch to pan
            tempTool = currentTool;
            setActiveTool('pan');
        }
        
        // + key for zoom in
        if (event.key === '+' || event.key === '=') {
            zoomCanvas(1.2);
        }
        
        // - key for zoom out
        if (event.key === '-' || event.key === '_') {
            zoomCanvas(0.8);
        }
    });
    
    // Release space key to return to previous tool
    document.addEventListener('keyup', function(event) {
        if (event.key === ' ' && tempTool) {
            setActiveTool(tempTool);
            tempTool = null;
        }
    });
    
    // Set up mouse wheel for zooming
    document.getElementById('canvas').addEventListener('wheel', function(event) {
        event.preventDefault();
        const factor = event.deltaY < 0 ? 1.1 : 0.9;
        zoomCanvas(factor);
    });
    
    // Set up panning functionality
    setupPanning();
}

// Set up panning
function setupPanning() {
    const canvas = document.getElementById('canvas');
    let isPanning = false;
    let startPoint = { x: 0, y: 0 };
    
    canvas.addEventListener('mousedown', function(event) {
        if (currentTool === 'pan') {
            isPanning = true;
            startPoint = {
                x: event.clientX,
                y: event.clientY
            };
            canvas.style.cursor = 'grabbing';
        }
    });
    
    canvas.addEventListener('mousemove', function(event) {
        if (isPanning) {
            const dx = event.clientX - startPoint.x;
            const dy = event.clientY - startPoint.y;
            
            // Update pan values
            viewportInfo.pan.x += dx / viewportInfo.zoom;
            viewportInfo.pan.y += dy / viewportInfo.zoom;
            
            // Update viewport
            updateViewport();
            
            // Update start point
            startPoint = {
                x: event.clientX,
                y: event.clientY
            };
        }
    });
    
    canvas.addEventListener('mouseup', function() {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = 'grab';
        }
    });
    
    canvas.addEventListener('mouseleave', function() {
        if (isPanning) {
            isPanning = false;
            canvas.style.cursor = 'grab';
        }
    });
}

export { setupToolHandlers };