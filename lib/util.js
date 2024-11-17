export class AsyncQueue {
  constructor() {
    this.queue = [];
    this.progressCallbacks = new Map();
    this.isProcessing = false;
  }

  /**
   * Add a callback to the queue
   * @param {Function} callback - The async function to be executed
   * @param {Function} [progressCallback] - Optional callback that reports position updates
   * @returns {Promise} A promise that resolves when the callback completes
   */
  async push(callback, progressCallback = null) {
    const position = this.queue.length;
    const callbackId = Symbol('callback');

    if (progressCallback) {
      this.progressCallbacks.set(callbackId, progressCallback);
      progressCallback({
        position,
        status: 'queued'
      });
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        id: callbackId,
        execute: async () => {
          if (progressCallback) {
            progressCallback({
              position: 0,
              status: 'processing'
            });
          }
          
          try {
            const result = await callback();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            this.progressCallbacks.delete(callbackId);
          }
        }
      });
      
      this.processQueue();
      this.updatePositions();
    });
  }

  /**
   * Update all callbacks with their new positions
   * @private
   */
  updatePositions() {
    this.queue.forEach((item, index) => {
      const progressCallback = this.progressCallbacks.get(item.id);
      if (progressCallback) {
        progressCallback({
          position: index,
          status: 'queued'
        });
      }
    });
  }

  /**
   * Process items in the queue sequentially
   * @private
   */
  async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      try {
        await item.execute();
        this.updatePositions();
      } catch (error) {
        console.error('Queue processing error:', error);
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Get the current length of the queue
   * @returns {number} The number of callbacks in the queue
   */
  get length() {
    return this.queue.length;
  }

  /**
   * Clear all pending callbacks from the queue
   */
  clear() {
    this.queue = [];
    this.progressCallbacks.clear();
  }
}