// // File: designer/static/designer/js/test-fixture.js

// document.addEventListener('DOMContentLoaded', function() {
//     // Wait a short time to ensure SVG canvas is initialized
//     setTimeout(() => {
//         // Add the test fixture to the fixture list
//         addTestFixture();
        
//         // Add button to directly create a test fixture
//         addDirectPlacementButton();
//     }, 800);
// });

// /**
//  * Get the current addressing system from the dropdown
//  * @return {String} 'unified' or 'families'
//  */
//  function getAddressingSystem() {
//     const addressingSelect = document.getElementById('addressing-system');
//     return addressingSelect ? addressingSelect.value : 'unified';
// }

// function addTestFixture() {
//     const fixturesList = document.getElementById('fixtures-list');
//     if (!fixturesList) {
//         console.error('Test Fixture: Fixtures list not found');
//         return;
//     }
    
//     // Create test fixture item
//     const fixtureItem = document.createElement('div');
//     fixtureItem.className = 'fixture-item';
//     fixtureItem.dataset.fixtureId = 'test-par-64';
//     fixtureItem.dataset.fixtureType = 'PAR 64';
//     fixtureItem.dataset.channel = '1';
//     fixtureItem.dataset.color = '#FFAA00';
    
//     // Add item content
//     fixtureItem.innerHTML = `
//         <div class="d-flex justify-content-between align-items-center">
//             <div>
//                 <strong>Test PAR 64</strong>
//                 <div class="small text-muted">Test Fixture</div>
//             </div>
//         </div>
//     `;
    
//     // Add to fixtures list
//     fixturesList.appendChild(fixtureItem);
// }

// function addDirectPlacementButton() {
//     // Find the toolbar
//     const toolbar = document.getElementById('toolbar');
//     if (!toolbar) {
//         console.error('Test Fixture: Toolbar not found');
//         return;
//     }
    
//     // Create a button to directly place a test fixture
//     const button = document.createElement('button');
//     button.className = 'btn btn-sm btn-danger ms-2';
//     button.textContent = 'Place Test Fixture';
//     button.title = 'Directly place a test fixture on the canvas for debugging';
//     button.onclick = createTestFixture;
    
//     // Add to toolbar
//     toolbar.appendChild(button);
//     console.log('Test Fixture: Direct placement button added');
// }

// // File: designer/static/designer/js/test-fixture.js
// // Replace the createTestFixture function with this version

// function createTestFixture() {
//     console.log('Creating test fixture directly');
    
//     try {
//         // Get the SVG element
//         const svgElement = document.querySelector('#canvas svg');
//         if (!svgElement) {
//             console.error('Test Fixture: SVG element not found');
//             return;
//         }
        
//         // Create a new SVG.js instance
//         const draw = SVG(svgElement);
//         console.log('Test Fixture: Got SVG drawing', draw);
        
//         // Create a group for the fixture
//         const fixtureId = 'test-fixture-' + Date.now();
//         const fixtureGroup = draw.group().id(fixtureId);
//         console.log('Test Fixture: Created fixture group', fixtureGroup);
        
//         // Create a rectangular PAR 64 shape
//         fixtureGroup.rect(24, 36)  // Width, height
//             .fill('#FFAA00')
//             .stroke({ width: 1, color: '#000' })
//             .center(0, 0);
            
//         // Add lens/reflector circle
//         fixtureGroup.circle(20)
//             .fill('#FFFFFF')
//             .opacity(0.5)
//             .center(0, 0);
            
//         // Add channel indicator
//         fixtureGroup.circle(16)
//             .fill('white')
//             .center(0, 0);
            
//         // Add channel number
//         const channelText = fixtureGroup.text('1')
//             .font({
//                 size: 12,
//                 family: 'Arial',
//                 weight: 'bold',
//                 anchor: 'middle'
//             })
//             .center(0, 0);
        
//         // Add a small arrow to indicate direction
//         fixtureGroup.polygon('0,-18 5,-25 -5,-25')
//             .fill('#000')
//             .center(0, -18);
        
//         // Position in a visible area of the canvas
//         fixtureGroup.move(0, 0);
        
//         // Make it selectable by adding event handlers
//         fixtureGroup.click(function(event) {
//             console.log('Test fixture clicked');
            
//             // Create a mock fixture object for the properties panel
//             const mockFixture = {
//                 id: () => fixtureId,
//                 type: () => 'fixture',
//                 prop: (key, value) => {
//                     // Simple property getter/setter
//                     if (value === undefined) {
//                         switch(key) {
//                             case 'channel': return '1';
//                             case 'dimmer': return '2';
//                             case 'color': return '#FFAA00';
//                             case 'purpose': return 'Test PAR 64';
//                             case 'notes': return 'This is a test fixture for debugging';
//                             case 'rotation': return fixtureGroup.transform().rotation || 0;
//                             case 'fixtureType': return getAddressingSystem() === 'families' ? 'channel' : 'fixture';
//                             default: return '';
//                         }
//                     } else {
//                         // Handle property changes
//                         console.log(`Setting property ${key} to ${value}`);
                        
//                         if (key === 'color') {
//                             fixtureGroup.find('rect')[0].fill(value);
//                         } else if (key === 'channel') {
//                             channelText.text(value.toString());
//                         } else if (key === 'rotation') {
//                             // Center of the group for rotation
//                             const bbox = fixtureGroup.bbox();
//                             const cx = bbox.cx;
//                             const cy = bbox.cy;
                            
//                             // Apply rotation around center
//                             fixtureGroup.rotate(value, cx, cy);
//                         } else if (key === 'fixtureType') {
//                             // No visual change needed for this property
//                             console.log(`Fixture type changed to ${value}`);
//                         }
                        
//                         return mockFixture;
//                     }
//                 },
//                 isLocked: () => false,
//                 lock: () => console.log('Lock state changed'),
//                 position: () => {
//                     const bbox = fixtureGroup.bbox();
//                     return { x: bbox.x, y: bbox.y };
//                 },
//                 getBBox: () => fixtureGroup.bbox(),
//                 svgElement: () => fixtureGroup
//             };
            
//             // Show properties panel for this fixture
//             showFixtureProperties(mockFixture);
            
//             // Prevent event propagation
//             event.stopPropagation();
//         });
        
//         console.log('Test fixture created and placed on canvas');
//     } catch (error) {
//         console.error('Error creating test fixture:', error);
//     }
// }
// // Function to show fixture properties panel
// function showFixtureProperties(fixture) {
//     console.log(`Showing properties for fixture ${fixture.id()}`);
    
//     const propertiesPanel = document.getElementById('fixture-properties');
//     if (!propertiesPanel) {
//         console.error('Property panel not found');
//         return;
//     }
    
//     // Show the panel
//     propertiesPanel.style.display = 'block';
    
//     // Make sure properties tab is active
//     const propertiesTab = document.getElementById('properties-tab');
//     if (propertiesTab) {
//         const tabInstance = new bootstrap.Tab(propertiesTab);
//         tabInstance.show();
//     }
    
//     // Get the addressing system
//     const addressingSystem = getAddressingSystem();
    
//     // Show/hide addressing system specific fields
//     const unifiedFields = propertiesPanel.querySelector('.unified-addressing');
//     const familiesFields = propertiesPanel.querySelector('.families-addressing');
    
//     if (unifiedFields && familiesFields) {
//         if (addressingSystem === 'unified') {
//             unifiedFields.style.display = 'block';
//             familiesFields.style.display = 'none';
//         } else {
//             unifiedFields.style.display = 'none';
//             familiesFields.style.display = 'block';
//         }
//     }
    
//     // Get fixture properties
//     const channel = fixture.prop('channel');
//     const fixtureType = fixture.prop('fixtureType') || 'channel';
//     const dimmer = fixture.prop('dimmer');
//     const color = fixture.prop('color');
//     const purpose = fixture.prop('purpose');
//     const notes = fixture.prop('notes');
//     const isLocked = fixture.isLocked();
    
//     // Set form values based on addressing system
//     if (addressingSystem === 'unified') {
//         const fixtureNumberInput = document.getElementById('fixture-number');
//         if (fixtureNumberInput) fixtureNumberInput.value = channel;
//     } else {
//         // For families addressing system
//         const fixtureTypeSelect = document.getElementById('fixture-type');
//         const familyNumberInput = document.getElementById('fixture-family-number');
        
//         if (fixtureTypeSelect) fixtureTypeSelect.value = fixtureType === 'spot' ? 'spot' : 'channel';
//         if (familyNumberInput) familyNumberInput.value = channel;
//     }
    
//     // Set common fields
//     const dimmerInput = document.getElementById('dimmer');
//     const colorInput = document.getElementById('color');
//     const purposeInput = document.getElementById('purpose');
//     const notesInput = document.getElementById('notes');
//     const lockedCheckbox = document.getElementById('fixture-locked');
    
//     if (dimmerInput) dimmerInput.value = dimmer;
//     if (colorInput) colorInput.value = color;
//     if (purposeInput) purposeInput.value = purpose;
//     if (notesInput) notesInput.value = notes;
//     if (lockedCheckbox) lockedCheckbox.checked = isLocked;
    
//     // Store reference to fixture in panel
//     propertiesPanel.dataset.elementId = fixture.id();
    
//     console.log(`Fixture properties loaded for ${fixture.id()}`);
    
//     // Set up property change handlers
//     setupPropertyChangeHandlers(fixture);
// }

// function setupPropertyChangeHandlers(fixture) {
//     // Only set up handlers once
//     if (window._propertyHandlersInitialized) return;
//     window._propertyHandlersInitialized = true;
    
//     // Unified addressing system - Fixture Number
//     const fixtureNumberInput = document.getElementById('fixture-number');
//     if (fixtureNumberInput) {
//         fixtureNumberInput.addEventListener('change', () => {
//             updateFixtureProperty('channel', fixtureNumberInput.value);
//         });
//     }
    
//     // Families addressing system - Type
//     const fixtureTypeSelect = document.getElementById('fixture-type');
//     if (fixtureTypeSelect) {
//         fixtureTypeSelect.addEventListener('change', () => {
//             updateFixtureProperty('fixtureType', fixtureTypeSelect.value);
//         });
//     }
    
//     // Families addressing system - Number
//     const familyNumberInput = document.getElementById('fixture-family-number');
//     if (familyNumberInput) {
//         familyNumberInput.addEventListener('change', () => {
//             updateFixtureProperty('channel', familyNumberInput.value);
//         });
//     }
    
//     // Channel (for backward compatibility)
//     const channelInput = document.getElementById('channel');
//     if (channelInput) {
//         channelInput.addEventListener('change', () => {
//             updateFixtureProperty('channel', channelInput.value);
//         });
//     }
    
//     // Dimmer
//     const dimmerInput = document.getElementById('dimmer');
//     if (dimmerInput) {
//         dimmerInput.addEventListener('change', () => {
//             updateFixtureProperty('dimmer', dimmerInput.value);
//         });
//     }
    
//     // Color
//     const colorInput = document.getElementById('color');
//     if (colorInput) {
//         colorInput.addEventListener('change', () => {
//             updateFixtureProperty('color', colorInput.value);
//         });
//     }
    
//     // Function to update properties
//     function updateFixtureProperty(property, value) {
//         const propertiesPanel = document.getElementById('fixture-properties');
//         if (!propertiesPanel || !propertiesPanel.dataset.elementId) {
//             console.error('No fixture selected');
//             return;
//         }
        
//         const elementId = propertiesPanel.dataset.elementId;
//         console.log(`Updating fixture property ${property}=${value} for ${elementId}`);
        
//         // For our test fixture, we stored it as a global reference
//         if (fixture && typeof fixture.prop === 'function') {
//             fixture.prop(property, value);
//         }
//     }
// }