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
         alert('Error: SVG.js library not loaded. Check console for details.');
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
         'data-type': 'PAR64',
         'data-rotation': '0'  // Added rotation data attribute
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
         'data-pipe-length': '5',
         'data-rotation': '0'  // Added rotation data attribute
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
         const rotation = element.attr('data-rotation') || '0';  // Get rotation data
         
         tooltip.innerHTML = `
             <div><strong>${type}</strong></div>
             <div>ID: ${element.id()}</div>
             <div>Status: ${isLocked ? '🔒 Locked' : '🔓 Unlocked'}</div>
             <div>Position: ${Math.round(element.cx())}, ${Math.round(element.cy())}</div>
             <div>Rotation: ${rotation}°</div>  <!-- Added rotation display -->
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
             
             // Remove rotation handle if present
             if (element.rotationHandle) {
                 element.rotationHandle.remove();
                 element.rotationHandle = null;
                 element.rotationLine = null;
             }
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
             
             // Re-add rotation handle if selected
             if (element.hasClass('selected')) {
                 createRotationHandle(element);
             }
         }
         
         return newLocked;
     };
     
     // Create rotation handle
     const createRotationHandle = (element) => {
         // Remove existing rotation handle if any
         if (element.rotationHandle) {
             element.rotationHandle.remove();
             element.rotationLine.remove();
             element.rotationHandle = null;
             element.rotationLine = null;
         }
         
         // Skip if element is locked
         if (element.attr('data-locked') === 'true') return;
         
         // Get element center
         const bbox = element.bbox();
         const centerX = bbox.cx;
         const centerY = bbox.cy;
         
         // Distance from center to rotation handle
         const handleDistance = 40;
         
         // Get current rotation angle if any
         const currentRotation = parseFloat(element.attr('data-rotation') || 0);
         
         // Calculate handle position
         // Base position is above the element (at -90 degrees)
         // Adjust for current rotation
         const angleInRadians = (currentRotation - 90) * (Math.PI / 180);
         const handleX = centerX + handleDistance * Math.cos(angleInRadians);
         const handleY = centerY + handleDistance * Math.sin(angleInRadians);
         
         // Create line from center to handle
         element.rotationLine = draw.line(centerX, centerY, handleX, handleY)
             .stroke({ width: 1, color: '#999', dasharray: '3,3' });
         
         // Create rotation handle
         element.rotationHandle = draw.circle(10)
             .fill('#2196F3')
             .stroke({ width: 1, color: '#0D47A1' })
             .center(handleX, handleY)
             .css({ cursor: 'grab' });
         
         // Add mouse events for rotation
         let isRotating = false;
         let startAngle, elementStartRotation;
         
         // Mouse down starts rotation
         element.rotationHandle.on('mousedown', function(e) {
             e.stopPropagation();
             
             // Calculate angle between center and mouse
             const mousePos = { x: e.clientX, y: e.clientY };
             const svgPoint = getCanvasPoint(mousePos);
             startAngle = getAngle(centerX, centerY, svgPoint.x, svgPoint.y);
             elementStartRotation = parseFloat(element.attr('data-rotation') || 0);
             
             isRotating = true;
             this.css({ cursor: 'grabbing' });
             
             // Add document-level event listeners
             document.addEventListener('mousemove', onMouseMove);
             document.addEventListener('mouseup', onMouseUp);
         });
         
         // Helper to convert client point to SVG coordinates
         function getCanvasPoint(point) {
             const svg = draw.node;
             const pt = svg.createSVGPoint();
             pt.x = point.x;
             pt.y = point.y;
             return pt.matrixTransform(svg.getScreenCTM().inverse());
         }
         
         // Mouse move updates rotation
         function onMouseMove(e) {
             if (!isRotating) return;
             
             // Calculate current angle
             const mousePos = { x: e.clientX, y: e.clientY };
             const svgPoint = getCanvasPoint(mousePos);
             const currentAngle = getAngle(centerX, centerY, svgPoint.x, svgPoint.y);
             
             // Calculate angle difference
             let angleDelta = currentAngle - startAngle;
             
             // Calculate new rotation 
             let newRotation = elementStartRotation + angleDelta;
             
             // Optional: Snap to 15 degree increments
             // newRotation = Math.round(newRotation / 15) * 15;
             
             // Apply rotation
             element.attr('data-rotation', newRotation);
             
             // Apply transform to element
             element.transform({ rotation: newRotation, cx: centerX, cy: centerY });
             
             // Update handle position
             updateRotationHandlePosition(element, newRotation);
             
             // Show angle in tooltip
             tooltip.innerHTML = `Rotating: ${Math.round(newRotation)}°`;
             tooltip.style.display = 'block';
             tooltip.style.left = (e.clientX + 15) + 'px';
             tooltip.style.top = (e.clientY + 15) + 'px';
         }
         
         // Mouse up ends rotation
         function onMouseUp() {
             if (!isRotating) return;
             
             isRotating = false;
             element.rotationHandle.css({ cursor: 'grab' });
             
             // Remove document-level event listeners
             document.removeEventListener('mousemove', onMouseMove);
             document.removeEventListener('mouseup', onMouseUp);
             
             // Hide tooltip
             tooltip.style.display = 'none';
         }
         
         // Helper to calculate angle between points
         function getAngle(cx, cy, px, py) {
             const dx = px - cx;
             const dy = py - cy;
             let angle = Math.atan2(dy, dx) * (180 / Math.PI);
             // Normalize to 0-360
             angle = (angle + 360) % 360;
             return angle;
         }
     };
     
     // Update rotation handle position
     function updateRotationHandlePosition(element, angle) {
         if (!element.rotationHandle || !element.rotationLine) return;
         
         const bbox = element.bbox();
         const centerX = bbox.cx;
         const centerY = bbox.cy;
         const handleDistance = 40;
         
         // Calculate new handle position
         // Base position is above the element (at -90 degrees)
         // Adjust for current rotation
         const angleInRadians = (angle - 90) * (Math.PI / 180);
         const handleX = centerX + handleDistance * Math.cos(angleInRadians);
         const handleY = centerY + handleDistance * Math.sin(angleInRadians);
         
         // Update handle and line
         element.rotationHandle.center(handleX, handleY);
         element.rotationLine.plot(centerX, centerY, handleX, handleY);
     }
     
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
             
             // Remove rotation handle
             if (this.rotationHandle) {
                 this.rotationHandle.remove();
                 this.rotationLine.remove();
                 this.rotationHandle = null;
                 this.rotationLine = null;
             }
         } else {
             this.addClass('selected');
             
             // Always use red dashed stroke for selection, regardless of lock state
             this.findOne('rect').stroke({ width: 2, color: '#ff0000', dasharray: '5,5' });
             
             // Add rotation handle if not locked
             if (this.attr('data-locked') !== 'true') {
                 createRotationHandle(this);
             }
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
             
             // Remove rotation handle
             if (this.rotationHandle) {
                 this.rotationHandle.remove();
                 this.rotationLine.remove();
                 this.rotationHandle = null;
                 this.rotationLine = null;
             }
         } else {
             this.addClass('selected');
             
             // Always use red stroke for selection, regardless of lock state
             this.findOne('circle').stroke({ width: 2, color: '#ff0000' });
             
             // Add rotation handle if not locked
             if (this.attr('data-locked') !== 'true') {
                 createRotationHandle(this);
             }
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
     
     console.log('Test elements created with rotation handles');
     
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
     testButton.textContent = 'Test Selection & Rotation';  // Updated button text
     testButton.id = 'simple-test-btn';
     testButton.className = 'btn btn-success position-fixed';
     testButton.style.bottom = '20px';
     testButton.style.right = '20px';
     testButton.style.zIndex = '2000';
     testButton.title = 'Click to create test elements. Select elements to see rotation handles!';
     
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
             testButton.textContent = 'Test Selection & Rotation';
             testButton.className = 'btn btn-success position-fixed';
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
 
 console.log('Simplified test script loaded with rotation support');