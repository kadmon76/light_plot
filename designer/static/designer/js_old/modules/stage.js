/**
 * Light Plot Designer - Stage Module
 *
 * Handles stage rendering and related functionality
 */

import { draw, stageGroup, fohGroup, paperSize, SCALE_FACTOR } from './core.js';

// Draw a default stage
function drawDefaultStage() {
    stageGroup.clear();
    fohGroup.clear();
    
    // Get the title block dimensions for reference
    const marginSize = 20 * SCALE_FACTOR;
    const titleBlockHeight = 20 * SCALE_FACTOR;
    
    // Calculate available space on paper
    const innerWidth = paperSize.width - (marginSize * 2);
    const innerHeight = paperSize.height - (marginSize * 2) - titleBlockHeight;
    
    // Make stage width match the inner width of the title block
    const stageWidthPx = innerWidth;
    
    // Calculate stage depth to fit in available space with FOH
    // Leave 70% for stage, 20% for FOH, 10% for spacing
    const stageDepthPx = innerHeight * 0.7;
    const fohDepthPx = innerHeight * 0.2;
    const spacing = innerHeight * 0.1;
    
    // Calculate the top position of the stage (from center of paper)
    const paperTopEdge = -paperSize.height/2 + marginSize;
    const stageY = paperTopEdge + stageDepthPx/2;
    
    // Draw stage shape with dotted line
    stageGroup.rect(stageWidthPx, stageDepthPx)
        .fill('#f9f9f9')
        .stroke({ width: 2, color: '#000', dasharray: '5,5' })
        .center(0, stageY);
        
    // Draw FOH area
    fohGroup.rect(stageWidthPx, fohDepthPx)
        .fill('#f0f0f0') 
        .stroke({ width: 1, color: '#000', dasharray: '5,5' })
        .center(0, stageY + stageDepthPx/2 + fohDepthPx/2);
        
    // Add FOH label
    fohGroup.text("FRONT OF HOUSE")
        .font({ size: 14, family: 'Arial', weight: 'bold' })
        .center(0, stageY + stageDepthPx/2 + fohDepthPx/2);
        
    // Draw center line
    stageGroup.line(-stageWidthPx/2, stageY, stageWidthPx/2, stageY)
        .stroke({ width: 1, color: '#999', dasharray: '5,5' });
        
    // Draw plaster line - at the downstage edge of the stage
    stageGroup.line(-stageWidthPx/2, stageY + stageDepthPx/2, stageWidthPx/2, stageY + stageDepthPx/2)
        .stroke({ width: 2, color: '#333' });
    
    // Add label for plaster line
    stageGroup.text("PLASTER LINE")
        .font({ size: 12, family: 'Arial' })
        .center(0, stageY + stageDepthPx/2 + 15);
}

export { drawDefaultStage };