/**
 * Light Plot Designer - Grid Module
 *
 * Handles grid rendering and grid-related functionality
 */

import { draw, gridGroup, paperSize, GRID_SIZE, SCALE_FACTOR } from './core.js';

// Draw grid
function drawGrid() {
    gridGroup.clear();
    
    const gridColor = '#e0e0e0';
    const gridWidth = paperSize.width - 40 * SCALE_FACTOR;
    const gridHeight = paperSize.height - 60 * SCALE_FACTOR; // Leave room for title block
    
    // Create a pattern of grid lines
    for (let x = -gridWidth/2; x <= gridWidth/2; x += GRID_SIZE * SCALE_FACTOR) {
        gridGroup.line(x, -gridHeight/2, x, gridHeight/2)
            .stroke({ width: 0.5, color: gridColor });
    }
    
    for (let y = -gridHeight/2; y <= gridHeight/2; y += GRID_SIZE * SCALE_FACTOR) {
        gridGroup.line(-gridWidth/2, y, gridWidth/2, y)
            .stroke({ width: 0.5, color: gridColor });
    }
}

export { drawGrid };