// File: designer/static/designer/js/utils/api.js

/**
 * API Module
 * 
 * Handles communication with the backend API.
 */

/**
 * Save a light plot to the server
 * @param {Object} plotData - Plot data to save
 * @return {Promise} Promise resolving to saved plot data
 */
 export async function savePlot(plotData) {
    console.log('API: Saving plot data:', plotData);
    
    try {
        const csrfToken = getCsrfToken();
        console.log('API: Using CSRF token:', csrfToken);
        
        const response = await fetch('/api/plot/save/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(plotData),
        });
        
        console.log('API: Server response status:', response.status);
        
        if (!response.ok) {
            console.error('API: Server returned error status:', response.status, response.statusText);
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('API: Server response data:', responseData);
        return responseData;
    } catch (error) {
        console.error('API: Error saving plot:', error);
        throw error;
    }
}

/**
 * Load a light plot from the server
 * @param {Number} plotId - ID of the plot to load
 * @return {Promise} Promise resolving to plot data
 */
export async function loadPlot(plotId) {
    console.log('API: Loading plot with ID:', plotId);
    
    try {
        const csrfToken = getCsrfToken();
        console.log('API: Using CSRF token:', csrfToken);
        
        const response = await fetch(`/api/plot/${plotId}/`, {
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
        
        console.log('API: Server response status:', response.status);
        
        if (!response.ok) {
            console.error('API: Server returned error status:', response.status, response.statusText);
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('API: Server response data:', responseData);
        return responseData;
    } catch (error) {
        console.error('API: Error loading plot:', error);
        throw error;
    }
}

/**
 * Get CSRF token from cookies
 * @return {String} CSRF token
 */
function getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    
    console.log('API: Retrieved CSRF token from cookies');
    return cookieValue;
}