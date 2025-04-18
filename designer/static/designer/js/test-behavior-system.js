/**
 * Simplified Test Script
 * 
 * This is a direct, non-modular test script that doesn't rely on imports.
 * It creates simple SVG elements to verify the concepts work.
 */

console.log('Loading simplified test script...');

// Create a helper function for testing
window.runBehaviorTest = function() {
    console.log('Running simplified behavior test');
    
    // Reference to SVG drawing
    const draw = window.mainDraw || (SVG && SVG('#canvas svg'));
    
    if (!draw) {
        console.error('SVG drawing not found');
        alert('Error: SVG drawing not found. Check console for details.');
        return null;
    }
    
    console.log('Found SVG drawing:', draw);
    
    // Create a test fixture
    const testFixture = draw.group().id('test-fixture');
    testFixture.circle(30)
        .fill('#FF5722')
        .center(0, 0);
        
    testFixture.circle(16)
        .fill('white')
        .center(0, 0);
        
    testFixture.text('1')
        .font({ size: 12, family: 'Arial', weight: 'bold', anchor: 'middle' })
        .center(0, 0);
    
    // Add state data 
    testFixture.attr({
        'data-locked': 'false',
        'data-channel': '1',
        'data-type': 'PAR64'
    });
    
    // Position fixture
    testFixture.center(100, 100);
    
    // Create a test pipe
    const testPipe = draw.group().id('test-pipe');
    testPipe.rect(150, 8)
        .fill('#424242')
        .stroke({ width: 1, color: '#000' });
        
    testPipe.text('Test Pipe')
        .font({ size: 12, family: 'Arial', weight: 'bold' })
        .center(75, -10);
    
    // Add state data
    testPipe.attr({
        'data-locked': 'false',
        'data-pipe-name': 'Test Pipe',
        'data-pipe-length': '5'
    });
    
    // Position pipe
    testPipe.center(200, 200);
    
    // Create tooltip div for information display
    const tooltip = document.createElement('div');
    tooltip.id = 'behavior-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.padding = '5px 10px';
    tooltip.style.background = 'rgba(0,0,0,0.7)';
    tooltip.style.color = 'white';
    tooltip.style.borderRadius = '3px';
    tooltip.style.fontSize = '12px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '3000';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    
    // Helper function to update tooltip
    const showTooltip = (element, event) => {
        const isLocked = element.attr('data-locked') === 'true';
        const type = element.attr('data-type') || element.attr('data-pipe-name') || 'Element';
        
        tooltip.innerHTML = `
            <div><strong>${type}</strong></div>
            <div>ID: ${element.id()}</div>
            <div>Status: ${isLocked ? '🔒 Locked' : '🔓 Unlocked'}</div>
            <div>Position: ${Math.round(element.cx())}, ${Math.round(element.cy())}</div>
            ${element.attr('data-channel') ? `<div>Channel: ${element.attr('data-channel')}</div>` : ''}
            ${element.attr('data-pipe-length') ? `<div>Length: ${element.attr('data-pipe-length')}m</div>` : ''}
        `;
        
        tooltip.style.display = 'block';
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';
        
        // Hide tooltip after 3 seconds
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 3000);
    };
    
    // Helper to toggle lock state
    const toggleLock = (element) => {
        const isLocked = element.attr('data-locked') === 'true';
        const newLocked = !isLocked;
        
        // Update lock state
        element.attr('data-locked', newLocked ? 'true' : 'false');
        
        if (newLocked) {
            // Visual indicator for locked state
            if (element.id() === 'test-pipe') {
                element.findOne('rect').stroke({ width: 2, color: '#009900' });
            } else {
                element.findOne('circle').stroke({ width: 2, color: '#009900', dasharray: '4,3' });
            }
            
            // Disable dragging
            element.draggable(false);
        } else {
            // Remove locked visual indicator
            if (element.id() === 'test-pipe') {
                // Apply appropriate stroke based on selection
                if (element.hasClass('selected')) {
                    element.findOne('rect').stroke({ width: 2, color: '#ff0000', dasharray: '5,5' });
                } else {
                    element.findOne('rect').stroke({ width: 1, color: '#000' });
                }
            } else {
                // Apply appropriate stroke based on selection
                if (element.hasClass('selected')) {
                    element.findOne('circle').stroke({ width: 2, color: '#ff0000' });
                } else {
                    element.findOne('circle').stroke({ width: 0 });
                }
            }
            
            // Enable dragging
            element.draggable(true);
        }
        
        return newLocked;
    };
    
    // === PIPE BEHAVIORS ===
    
    // Add selection behavior to pipe
    testPipe.click(function(event) {
        // Toggle selection
        const isSelected = this.hasClass('selected');
        
        if (isSelected) {
            this.removeClass('selected');
            
            // Apply correct stroke based on lock state
            if (this.attr('data-locked') === 'true') {
                this.findOne('rect').stroke({ width: 2, color: '#009900' });
            } else {
                this.findOne('rect').stroke({ width: 1, color: '#000' });
            }
        } else {
            this.addClass('selected');
            
            // Always use red dashed stroke for selection, regardless of lock state
            this.findOne('rect').stroke({ width: 2, color: '#ff0000', dasharray: '5,5' });
        }
        
        // Show tooltip
        showTooltip(this, event);
    });
    
    // Double-click to toggle lock
    testPipe.dblclick(function(event) {
        event.stopPropagation();
        const isNowLocked = toggleLock(this);
        
        // Show notification
        tooltip.innerHTML = `<div>Pipe ${isNowLocked ? 'locked 🔒' : 'unlocked 🔓'}</div>`;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';
        
        // Hide tooltip after 1.5 seconds
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 1500);
    });
    
    // Make pipe draggable
    try {
        testPipe.draggable();
    } catch (e) {
        console.error('Error making pipe draggable:', e);
    }
    
    // === FIXTURE BEHAVIORS ===
    
    // Add selection behavior to fixture
    testFixture.click(function(event) {
        // Toggle selection
        const isSelected = this.hasClass('selected');
        
        if (isSelected) {
            this.removeClass('selected');
            
            // Apply correct stroke based on lock state
            if (this.attr('data-locked') === 'true') {
                this.findOne('circle').stroke({ width: 2, color: '#009900', dasharray: '4,3' });
            } else {
                this.findOne('circle').stroke({ width: 0 });
            }
        } else {
            this.addClass('selected');
            
            // Always use red stroke for selection, regardless of lock state
            this.findOne('circle').stroke({ width: 2, color: '#ff0000' });
        }
        
        // Show tooltip
        showTooltip(this, event);
    });
    
    // Double-click to toggle lock
    testFixture.dblclick(function(event) {
        event.stopPropagation();
        const isNowLocked = toggleLock(this);
        
        // Show notification
        tooltip.innerHTML = `<div>Fixture ${isNowLocked ? 'locked 🔒' : 'unlocked 🔓'}</div>`;
        tooltip.style.display = 'block';
        tooltip.style.left = (event.clientX + 15) + 'px';
        tooltip.style.top = (event.clientY + 15) + 'px';
        
        // Hide tooltip after 1.5 seconds
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 1500);
    });
    
    // Make fixture draggable
    try {
        testFixture.draggable();
    } catch (e) {
        console.error('Error making fixture draggable:', e);
    }
    
    console.log('Test elements created');
    
    // Return cleanup function
    return {
        fixture: testFixture,
        pipe: testPipe,
        tooltip: tooltip,
        cleanup: function() {
            testFixture.remove();
            testPipe.remove();
            
            // Remove tooltip as well
            if (document.getElementById('behavior-tooltip')) {
                document.getElementById('behavior-tooltip').remove();
            }
            
            console.log('Test elements and tooltip removed');
        }
    };
};

// Create test button
function createSimpleTestButton() {
    console.log('Creating simple test button');
    
    // Check if button already exists
    if (document.getElementById('simple-test-btn')) {
        console.log('Test button already exists');
        return;
    }
    
    // Create button
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Selection & Locking';
    testButton.id = 'simple-test-btn';
    testButton.className = 'btn btn-success position-fixed';
    testButton.style.bottom = '20px';
    testButton.style.right = '20px';
    testButton.style.zIndex = '2000';
    testButton.title = 'Click to create test elements. Click to select, double-click to lock/unlock.';
    
    // Add to document
    document.body.appendChild(testButton);
    console.log('Simple test button added to document');
    
    // Add click handler
    let testElements = null;
    testButton.addEventListener('click', function() {
        console.log('Simple test button clicked');
        
        // Clean up previous test elements if any
        if (testElements && testElements.cleanup) {
            testElements.cleanup();
            testElements = null;
            testButton.textContent = 'Simple Behavior Test';
            return;
        }
        
        // Run the test
        testElements = window.runBehaviorTest();
        if (testElements) {
            testButton.textContent = 'Remove Test Elements';
            testButton.className = 'btn btn-danger position-fixed';
            testButton.title = 'Click to remove test elements';
        }
    });
}

// Create button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSimpleTestButton);
} else {
    createSimpleTestButton();
}

// Fallback
setTimeout(createSimpleTestButton, 2000);

console.log('Simplified test script loaded');