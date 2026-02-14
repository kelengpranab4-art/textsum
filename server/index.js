
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { summarizer } from './summarizer.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize the model on startup (optional but good for performance)
summarizer.initialize().catch(console.error);

app.post('/summarize', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const summary = await summarizer.summarize(text);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to summarize text' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
