
import { pipeline } from '@xenova/transformers';

class Summarizer {
  constructor() {
    this.generator = null;
  }

  async initialize() {
    if (!this.generator) {
      console.log('Loading summarization model...');
      this.generator = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
      console.log('Model loaded successfully.');
    }
  }

  async summarize(text) {
    if (!this.generator) {
      await this.initialize();
    }

    try {
      // Basic summarization with default parameters
      const output = await this.generator(text, {
        max_length: 150,
        min_length: 40,
        length_penalty: 2.0,
        num_beams: 4,
        early_stopping: true,
      });

      // The output is an array of objects, e.g., [{ summary_text: "..." }]
      return output[0].summary_text;
    } catch (error) {
      console.error('Error during summarization:', error);
      throw error;
    }
  }
}

export const summarizer = new Summarizer();
