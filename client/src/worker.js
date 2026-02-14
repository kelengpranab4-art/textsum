
import { pipeline, env } from '@xenova/transformers';

// Skip local checks since we are running in the browser
env.allowLocalModels = false;
env.useBrowserCache = true;

class TextSummarizationPipeline {
    static task = 'summarization';
    static model = 'Xenova/distilbart-cnn-6-6';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { text } = event.data;

    try {
        const generator = await TextSummarizationPipeline.getInstance((data) => {
            // You can send progress back if needed
            self.postMessage({ status: 'progress', data });
        });

        const output = await generator(text, {
            max_length: 150,
            min_length: 40,
            length_penalty: 2.0,
            num_beams: 4,
            early_stopping: true,
        });

        self.postMessage({ status: 'complete', output: output[0].summary_text });

    } catch (error) {
        self.postMessage({ status: 'error', error: error.message });
    }
});
