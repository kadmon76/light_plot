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