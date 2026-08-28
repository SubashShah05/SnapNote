import { GoogleGenAI, Type } from '@google/genai';
import { AIProvider } from '../ai.provider.js';
import dotenv from 'dotenv';
dotenv.config();

export class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = process.env.AI_API_KEY;
    this.modelName = process.env.AI_MODEL || 'gemini-3.6-flash';
    
    if (!this.apiKey || this.apiKey === 'your_server_side_key') {
      console.warn("⚠️ AI_API_KEY is missing or not configured correctly.");
      // We don't throw here to not crash the app on startup, but requests will fail.
    } else {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  _checkConfig() {
    if (!this.ai) {
      throw new Error("AI provider is not properly configured. Check AI_API_KEY.");
    }
  }

  async generateText(prompt, options = {}) {
    this._checkConfig();
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: options.temperature || 0.7,
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Provider Error (generateText):", error.message);
      throw new Error("AI response could not be processed. Please try again.");
    }
  }

  async generateJson(prompt, options = {}) {
    this._checkConfig();
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: options.temperature || 0.2,
          responseMimeType: "application/json",
          // For gemini, we typically add instruction to output valid json
          systemInstruction: "You are a helpful API that only returns valid JSON matching the requested schema. No markdown wrapping."
        }
      });
      
      let text = response.text;
      // Safety parsing in case it wrapped in markdown
      if (text.startsWith('```json')) {
        text = text.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (text.startsWith('```')) {
        text = text.replace(/^```/, '').replace(/```$/, '').trim();
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Provider Error (generateJson):", error.message);
      throw new Error("AI response could not be processed. Please try again.");
    }
  }
}
