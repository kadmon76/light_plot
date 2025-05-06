/**
 * Behavior Initialization Module
 * 
 * Handles the registration of all behaviors with the behavior manager.
 * This avoids circular dependencies between behavior modules.
 */

import behaviorManager from './behavior-manager.js';
import { DraggableBehavior } from './draggable.js';
import { SelectableBehavior } from './selectable.js';
import { LockableBehavior } from './lockable.js';
import { RotatableBehavior } from './rotatable.js';
import { DroppableBehavior } from './droppable.js';

// Register all behaviors
behaviorManager.registerBehavior('draggable', (options) => new DraggableBehavior(options));
behaviorManager.registerBehavior('selectable', (options) => new SelectableBehavior(options));
behaviorManager.registerBehavior('lockable', (options) => new LockableBehavior(options));
behaviorManager.registerBehavior('rotatable', (options) => new RotatableBehavior(options));
behaviorManager.registerBehavior('droppable', (options) => new DroppableBehavior(options));

export default behaviorManager; 