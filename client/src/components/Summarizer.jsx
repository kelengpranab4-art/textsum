
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Copy, Check, FileText, AlignLeft, ArrowRight } from 'lucide-react';

const Summarizer = () => {
    const [inputText, setInputText] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSummarize = async () => {
        if (!inputText.trim()) return;

        setLoading(true);
        setError('');
        setSummary('');

        try {
            const response = await fetch('http://localhost:3000/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: inputText }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch summary');
            }

            const data = await response.json();
            setSummary(data.summary);
        } catch (err) {
            setError('An error occurred while summarizing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="glass-panel rounded-[2rem] overflow-hidden"
        >
            {/* Header */}
            <div className="p-8 border-b border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                <motion.div
                    initial={{ rotate: -10, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-3 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl border border-white/10 mb-2"
                >
                    <Sparkles className="w-8 h-8 text-fuchsia-400" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200 tracking-tight">
                    AI Summarizer
                </h1>
                <p className="text-slate-400 text-lg max-w-lg">
                    Transform detailed content into concise, actionable insights with our advanced AI model.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                {/* Input Column */}
                <div className="p-8 flex flex-col space-y-6">
                    <div className="flex items-center space-x-3 text-slate-300">
                        <AlignLeft className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-semibold">Source Text</h2>
                    </div>

                    <div className="relative flex-1 group">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste your text here to begin..."
                            className="w-full h-full min-h-[400px] p-6 rounded-2xl glass-input text-slate-200 placeholder:text-slate-600 resize-none outline-none text-lg leading-relaxed"
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
                            {inputText.length} chars
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSummarize}
                        disabled={loading || !inputText}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-300 ${loading || !inputText
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'btn-gradient'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Generative Summary</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Output Column */}
                <div className="p-8 flex flex-col space-y-6 bg-black/20">
                    <div className="flex items-center justify-between text-slate-300">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-xl font-semibold">Summary</h2>
                        </div>
                        {summary && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={copyToClipboard}
                                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>

                    <div className="relative flex-1 rounded-2xl bg-black/20 border border-white/5 p-6 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center space-y-4"
                                >
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                                    </div>
                                    <p className="text-indigo-300 font-medium animate-pulse">Analyze. Condense. Create.</p>
                                </motion.div>
                            ) : summary ? (
                                <motion.div
                                    key="summary"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="prose prose-invert max-w-none"
                                >
                                    <p className="text-lg leading-loose text-slate-200 font-light">
                                        {summary}
                                    </p>
                                </motion.div>
                            ) : error ? (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full text-red-400 space-y-2"
                                >
                                    <p>{error}</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4"
                                >
                                    <div className="p-4 rounded-full bg-slate-800/50">
                                        <Sparkles className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p>Result will appear here</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Summarizer;
