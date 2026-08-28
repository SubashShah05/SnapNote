import { GeminiProvider } from './providers/gemini.provider.js';
import * as prompts from '../../prompts/index.js';

class AIService {
  constructor() {
    this.provider = this._initializeProvider();
  }

  _initializeProvider() {
    const providerName = process.env.AI_PROVIDER || 'gemini';
    if (providerName.toLowerCase() === 'gemini') {
      return new GeminiProvider();
    }
    // Fallback or add other providers here
    return new GeminiProvider();
  }

  /**
   * Summarize the provided text
   * @param {string} text 
   * @param {string} length 'short', 'medium', 'detailed'
   */
  async summarize(text, length = 'medium') {
    const prompt = prompts.summarizePrompt(text, length);
    return await this.provider.generateText(prompt);
  }

  /**
   * Extract key points from the provided text
   * @param {string} text 
   */
  async extractKeyPoints(text) {
    const prompt = prompts.keyPointsPrompt(text);
    return await this.provider.generateText(prompt);
  }

  /**
   * Generate title for the provided text
   * @param {string} text 
   */
  async generateTitle(text) {
    const prompt = prompts.titlePrompt(text);
    // Since title should be short, temperature can be lower
    const title = await this.provider.generateText(prompt, { temperature: 0.4 });
    // Remove quotes if present
    return title.replace(/^["']|["']$/g, '').trim();
  }

  /**
   * Suggest tags for the provided text
   * @param {string} text 
   * @returns {Promise<string[]>}
   */
  async generateTags(text) {
    const prompt = prompts.tagsPrompt(text);
    const result = await this.provider.generateJson(prompt, { temperature: 0.3 });
    return result.tags || [];
  }

  /**
   * Rewrite text based on style
   * @param {string} text 
   * @param {string} style 'professional', 'simple', 'friendly', 'concise', 'detailed'
   */
  async rewrite(text, style) {
    const prompt = prompts.rewritePrompt(text, style);
    return await this.provider.generateText(prompt, { temperature: 0.7 });
  }

  /**
   * Improve grammar
   * @param {string} text 
   */
  async improveGrammar(text) {
    const prompt = prompts.grammarPrompt(text);
    return await this.provider.generateText(prompt, { temperature: 0.2 });
  }

  /**
   * Make text shorter
   * @param {string} text 
   */
  async shorten(text) {
    const prompt = prompts.shortenPrompt(text);
    return await this.provider.generateText(prompt, { temperature: 0.5 });
  }

  /**
   * Expand text
   * @param {string} text 
   */
  async expand(text) {
    const prompt = prompts.expandPrompt(text);
    return await this.provider.generateText(prompt, { temperature: 0.7 });
  }

  /**
   * Extract action items/tasks
   * @param {string} text 
   * @returns {Promise<Object[]>}
   */
  async extractTasks(text) {
    const prompt = prompts.tasksPrompt(text);
    const result = await this.provider.generateJson(prompt, { temperature: 0.2 });
    return result.tasks || [];
  }

  /**
   * Note Assistant feature (custom user prompt)
   * @param {string} noteContent 
   * @param {string} userPrompt 
   */
  async assistantQuery(noteContent, userPrompt) {
    const prompt = prompts.assistantPrompt(noteContent, userPrompt);
    return await this.provider.generateText(prompt, { temperature: 0.7 });
  }
}

// Export a singleton instance
export const aiService = new AIService();
