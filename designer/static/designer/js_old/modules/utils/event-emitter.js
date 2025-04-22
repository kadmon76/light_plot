/**
 * Event Emitter Module
 * 
 * Provides a simple event system for implementing the observer pattern.
 * Allows objects to communicate without tight coupling.
 */

/**
 * EventEmitter class
 * Adds event handling capabilities to any class
 */
export class EventEmitter {
    constructor() {
        // Map of event types to arrays of listeners
        this._events = new Map();
    }
    
    /**
     * Add an event listener
     * @param {String} type - Event type
     * @param {Function} listener - Event callback function
     * @return {EventEmitter} this
     */
    on(type, listener) {
        if (typeof listener !== 'function') return this;
        
        if (!this._events.has(type)) {
            this._events.set(type, []);
        }
        
        const listeners = this._events.get(type);
        
        // Don't add the same listener twice
        if (!listeners.includes(listener)) {
            listeners.push(listener);
        }
        
        return this;
    }
    
    /**
     * Add a one-time event listener
     * @param {String} type - Event type
     * @param {Function} listener - Event callback function
     * @return {EventEmitter} this
     */
    once(type, listener) {
        if (typeof listener !== 'function') return this;
        
        // Create a wrapper that will remove itself after one call
        const onceWrapper = (...args) => {
            this.off(type, onceWrapper);
            listener.apply(this, args);
        };
        
        // Store reference to original listener for removal
        onceWrapper._originalListener = listener;
        
        return this.on(type, onceWrapper);
    }
    
    /**
     * Remove an event listener
     * @param {String} type - Event type
     * @param {Function} listener - Event callback function to remove
     * @return {EventEmitter} this
     */
    off(type, listener) {
        if (!this._events.has(type)) return this;
        
        const listeners = this._events.get(type);
        const newListeners = listeners.filter(item => {
            return item !== listener && 
                  item._originalListener !== listener;
        });
        
        if (newListeners.length === 0) {
            this._events.delete(type);
        } else {
            this._events.set(type, newListeners);
        }
        
        return this;
    }
    
    /**
     * Remove all listeners for an event type
     * @param {String} [type] - Event type (if omitted, removes all listeners)
     * @return {EventEmitter} this
     */
    removeAllListeners(type) {
        if (type === undefined) {
            this._events.clear();
        } else if (this._events.has(type)) {
            this._events.delete(type);
        }
        
        return this;
    }
    
    /**
     * Emit an event
     * @param {String} type - Event type
     * @param {...*} args - Arguments to pass to listeners
     * @return {Boolean} Whether the event had listeners
     */
    emit(type, ...args) {
        if (!this._events.has(type)) return false;
        
        const listeners = this._events.get(type).slice();
        
        // Call each listener with the provided arguments
        listeners.forEach(listener => {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error(`Error in event listener for "${type}":`, error);
            }
        });
        
        return listeners.length > 0;
    }
    
    /**
     * Get the number of listeners for an event type
     * @param {String} type - Event type
     * @return {Number} Number of listeners
     */
    listenerCount(type) {
        if (!this._events.has(type)) return 0;
        return this._events.get(type).length;
    }
    
    /**
     * Get array of listeners for an event type
     * @param {String} type - Event type
     * @return {Array<Function>} Array of listeners
     */
    listeners(type) {
        if (!this._events.has(type)) return [];
        return this._events.get(type).slice();
    }
    
    /**
     * Get array of all event types
     * @return {Array<String>} Array of event types
     */
    eventNames() {
        return Array.from(this._events.keys());
    }
}

export default EventEmitter;