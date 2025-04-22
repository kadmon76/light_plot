/**
 * Light Plot Designer - Paper Module
 *
 * Handles paper setup and layout related functionality
 */

import { draw, paperGroup, paperSize, SCALE_FACTOR } from './core.js';

// Setup paper size background
function setupPaperSize() {
    paperGroup.clear();
    
    // Draw paper background
    paperGroup.rect(paperSize.width, paperSize.height)
        .fill('#ffffff')
        .stroke({ width: 1, color: '#000000' })
        .center(0, 0);
        
    // Add paper margins (20mm)
    const marginSize = 20 * SCALE_FACTOR;
    const innerWidth = paperSize.width - (marginSize * 2);
    const innerHeight = paperSize.height - (marginSize * 2);
    
    paperGroup.rect(innerWidth, innerHeight)
        .fill('none')
        .stroke({ width: 0.5, color: '#cccccc', dasharray: '5,5' })
        .center(0, 0);
        
    // Add title block at the bottom
    const titleBlockHeight = 30 * SCALE_FACTOR;
    paperGroup.rect(innerWidth, titleBlockHeight)
        .fill('#f8f8f8')
        .stroke({ width: 0.5, color: '#000000' })
        .move(-innerWidth/2, paperSize.height/2 - titleBlockHeight - marginSize);
        
    // Add default text in title block
    paperGroup.text("LIGHT PLOT - NEW DESIGN")
        .font({ size: 16, family: 'Arial', weight: 'bold' })
        .move(-innerWidth/2 + 10, paperSize.height/2 - titleBlockHeight - marginSize + 10);
}

export { setupPaperSize };