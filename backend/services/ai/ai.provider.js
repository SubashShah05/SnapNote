/**
 * Base AI Provider interface
 * All specific providers (like gemini, openai, etc.) must implement this interface.
 */
export class AIProvider {
  /**
   * Initialize the provider with API keys, etc.
   */
  constructor() {
    if (this.constructor === AIProvider) {
      throw new Error("Cannot instantiate abstract class AIProvider");
    }
  }

  /**
   * Process a single text prompt and return the string response.
   * @param {string} prompt - The text prompt
   * @param {Object} [options] - Additional options (e.g., temperature)
   * @returns {Promise<string>}
   */
  async generateText(prompt, options = {}) {
    throw new Error("Method 'generateText()' must be implemented.");
  }

  /**
   * Process a prompt and return a structured JSON response.
   * @param {string} prompt - The text prompt
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>}
   */
  async generateJson(prompt, options = {}) {
    throw new Error("Method 'generateJson()' must be implemented.");
  }
}
