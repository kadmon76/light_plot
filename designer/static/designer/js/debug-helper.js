// Completely new debug helper file
document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug helper loaded - creating debug button');
    
    // Wait a moment to ensure the DOM is fully loaded
    setTimeout(function() {
        // Add a button to inspect the fixtures group
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Debug Fixtures';
        debugButton.style.position = 'absolute';
        debugButton.style.top = '5px';
        debugButton.style.right = '260px';
        debugButton.style.zIndex = '1000';
        debugButton.style.padding = '5px 10px';
        debugButton.style.backgroundColor = '#ffcc00';
        debugButton.style.color = '#000';
        debugButton.style.border = '2px solid #cc9900';
        debugButton.style.borderRadius = '4px';
        debugButton.style.fontWeight = 'bold';
        
        debugButton.addEventListener('click', function() {
            console.log('Debug button clicked - inspecting fixtures group');
            const fixturesGroup = document.getElementById('fixtures-group');
            if (fixturesGroup) {
                console.log('FIXTURES GROUP FOUND:', fixturesGroup);
                
                // Change styling to make it more visible
                fixturesGroup.style.border = '2px solid red';
                
                // Check for fixture elements inside
                const fixtures = fixturesGroup.querySelectorAll('g[id^="fixture-"]');
                console.log('FIXTURES FOUND:', fixtures.length);
                fixtures.forEach((fixture, index) => {
                    console.log(`FIXTURE ${index}:`, fixture);
                    
                    // Make fixture highly visible
                    const rect = fixture.querySelector('rect');
                    if (rect) {
                        rect.setAttribute('fill', '#FF00FF');
                        rect.setAttribute('width', '100');
                        rect.setAttribute('height', '100');
                        rect.setAttribute('x', '0');
                        rect.setAttribute('y', '0');
                    }
                });
                
                // Also check for our direct fixture
                const directFixtures = fixturesGroup.querySelectorAll('g[id^="direct-fixture-"]');
                console.log('DIRECT FIXTURES FOUND:', directFixtures.length);
                directFixtures.forEach((fixture, index) => {
                    console.log(`DIRECT FIXTURE ${index}:`, fixture);
                    
                    // Make it even more visible
                    const rect = fixture.querySelector('rect');
                    if (rect) {
                        rect.setAttribute('fill', '#00FFFF');  // Cyan color
                        rect.setAttribute('width', '120');
                        rect.setAttribute('height', '120');
                        rect.setAttribute('x', '-60');
                        rect.setAttribute('y', '-60');
                    }
                });
                
                // Count ALL g elements in fixtures group (this should find everything)
                const allGroups = fixturesGroup.querySelectorAll('g');
                console.log('ALL GROUPS IN FIXTURES GROUP:', allGroups.length);
                
                // List all child nodes directly
                console.log('DIRECT CHILDREN:', fixturesGroup.childNodes);
            } else {
                console.error('FIXTURES GROUP NOT FOUND IN DOM');
            }
        });
        
        // Add to document body
        document.body.appendChild(debugButton);
        console.log('Debug button added to document');
        
        // Add a message on the screen too
        const debugMessage = document.createElement('div');
        debugMessage.textContent = 'Debug Helper Loaded';
        debugMessage.style.position = 'absolute';
        debugMessage.style.top = '35px';
        debugMessage.style.right = '260px';
        debugMessage.style.zIndex = '1000';
        debugMessage.style.padding = '3px 6px';
        debugMessage.style.backgroundColor = '#fff';
        debugMessage.style.border = '1px solid #ccc';
        debugMessage.style.borderRadius = '3px';
        debugMessage.style.fontSize = '10px';
        document.body.appendChild(debugMessage);
    }, 1000); // Wait 1 second to ensure everything is loaded
});

// Add this to your debug-helper.js file to inspect fixture data attributes

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Add a button to inspect fixture data
        const inspectButton = document.createElement('button');
        inspectButton.textContent = 'Inspect Fixture Data';
        inspectButton.style.position = 'absolute';
        inspectButton.style.top = '35px';
        inspectButton.style.right = '260px';
        inspectButton.style.zIndex = '1000';
        inspectButton.style.padding = '5px 10px';
        inspectButton.style.backgroundColor = '#ffaa00';
        inspectButton.style.color = '#000';
        inspectButton.style.border = '2px solid #cc7700';
        inspectButton.style.borderRadius = '4px';
        
        inspectButton.addEventListener('click', function() {
            // Get all fixture items in the sidebar
            const fixtureItems = document.querySelectorAll('.fixture-item');
            console.log('Found', fixtureItems.length, 'fixture items');
            
            fixtureItems.forEach((item, index) => {
                console.log(`Fixture ${index}:`, {
                    id: item.dataset.fixtureId,
                    type: item.dataset.fixtureType,
                    svgIcon: item.dataset.svgIcon ? 'Present' : 'Missing',
                    svgIconContent: item.dataset.svgIcon ? item.dataset.svgIcon.substring(0, 50) + '...' : 'None'
                });
            });
        });
        
        document.body.appendChild(inspectButton);
    }, 1000);
});

// Add this to debug-helper.js

// Add DOM observer to track elements being added to fixtures group
function setupFixtureCreationObserver() {
    // Wait for fixtures group to exist
    const checkInterval = setInterval(() => {
        const fixturesGroup = document.getElementById('fixtures-group');
        if (fixturesGroup) {
            clearInterval(checkInterval);
            
            console.log('Debug: Setting up observer for fixtures group');
            
            // Create observer
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Element node
                                console.log('Debug: Element added to fixtures group:', {
                                    id: node.id,
                                    tagName: node.tagName,
                                    timestamp: new Date().toISOString(),
                                    stack: new Error().stack // This will show call stack
                                });
                            }
                        });
                    }
                });
            });
            
            // Start observing
            observer.observe(fixturesGroup, { 
                childList: true, 
                subtree: false 
            });
            
            console.log('Debug: Observer set up successfully');
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupFixtureCreationObserver, 1500);
});
// Add to debug-helper.js

function inspectFixtureSvgData() {
    const fixtureItems = document.querySelectorAll('.fixture-item');
    console.log('Found', fixtureItems.length, 'fixture items');
    
    fixtureItems.forEach((item, index) => {
        const fixtureId = item.dataset.fixtureId;
        const svgIcon = item.dataset.svgIcon;
        console.log(`Fixture ${index} (ID: ${fixtureId}):`, {
            hasSvgIcon: !!svgIcon,
            svgIconPreview: svgIcon ? svgIcon.substring(0, 100) + '...' : 'None'
        });
    });
}

// Add a button for this
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const inspectSvgButton = document.createElement('button');
        inspectSvgButton.textContent = 'Inspect SVG Data';
        inspectSvgButton.style.position = 'absolute';
        inspectSvgButton.style.top = '65px';
        inspectSvgButton.style.right = '260px';
        inspectSvgButton.style.zIndex = '1000';
        inspectSvgButton.style.padding = '5px 10px';
        inspectSvgButton.style.backgroundColor = '#00cc99';
        inspectSvgButton.style.color = '#000';
        inspectSvgButton.style.border = '2px solid #009977';
        inspectSvgButton.style.borderRadius = '4px';
        
        inspectSvgButton.addEventListener('click', inspectFixtureSvgData);
        document.body.appendChild(inspectSvgButton);
    }, 1000);
});