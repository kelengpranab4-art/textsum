
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Copy, Check, FileText, AlignLeft, ArrowRight } from 'lucide-react';

const Summarizer = () => {
    const [inputText, setInputText] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(null); // { status: 'initiate' | 'download' | 'process', file: string, progress: number }
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Create user reference to worker
    const worker = React.useRef(null);

    React.useEffect(() => {
        if (!worker.current) {
            // Create the worker
            worker.current = new Worker(new URL('../worker.js', import.meta.url), {
                type: 'module'
            });
        }

        const onMessageReceived = (e) => {
            const { status } = e.data;
            switch (status) {
                case 'initiate':
                    setLoading(true);
                    setProgress({ status: 'initiate', text: 'Initializing AI Model...' });
                    break;
                case 'progress':
                    // e.data.data has { status, file, progress, ... } or similar from Transformers.js
                    // Transformers.js 'progress_callback' usually returns { status: 'progress', file: '...', progress: 0-100, ... }
                    if (e.data.data && e.data.data.status === 'progress') {
                        setProgress({
                            status: 'download',
                            text: `Downloading ${e.data.data.file}...`,
                            percentage: Math.round(e.data.data.progress)
                        });
                    }
                    break;
                case 'ready':
                    // Model is ready, inference starting
                    setProgress({ status: 'process', text: 'Generating summary...' });
                    break;
                case 'complete':
                    setSummary(e.data.output);
                    setLoading(false);
                    setProgress(null);
                    break;
                case 'error':
                    setError(e.data.error);
                    setLoading(false);
                    setProgress(null);
                    break;
            }
        };

        // Attach the callback function as an event listener.
        worker.current.addEventListener('message', onMessageReceived);

        // Cleanup function when the component unmounts
        return () => worker.current.removeEventListener('message', onMessageReceived);
    }, []);

    const handleSummarize = () => {
        if (!inputText.trim()) return;
        setLoading(true);
        setError('');
        setSummary('');
        setProgress({ status: 'initiate', text: 'Starting...' });
        // Send the text to the worker
        worker.current.postMessage({ text: inputText });
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
            <div className="relative p-8 border-b border-white/10 flex flex-col items-center justify-center text-center space-y-2 overflow-hidden">
                {/* Subtle header bloom */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-500/10 to-transparent blur-xl pointer-events-none"></div>

                <motion.div
                    initial={{ rotate: -10, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative p-3 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl border border-white/10 mb-2 shadow-inner shadow-white/10"
                >
                    <Sparkles className="w-8 h-8 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]" />
                </motion.div>
                <h1 className="relative text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-indigo-100 tracking-tight drop-shadow-sm">
                    AI Summarizer
                </h1>
                <p className="relative text-slate-400 text-lg max-w-lg font-light">
                    Runs 100% in your browser. No data leaves your device.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                {/* Input Column */}
                <div className="p-8 flex flex-col space-y-6">
                    <div className="flex items-center space-x-3 text-slate-300">
                        <AlignLeft className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-semibold tracking-wide">Source Text</h2>
                    </div>

                    <div className="relative flex-1 group">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste your text here to begin..."
                            className="w-full h-full min-h-[400px] p-6 rounded-2xl glass-input text-slate-200 placeholder:text-slate-600 resize-none outline-none text-lg leading-relaxed shadow-inner"
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-mono bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5 pointer-events-none">
                            {inputText.length} chars
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSummarize}
                        disabled={loading || !inputText}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-xl ${loading || !inputText
                            ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/5'
                            : 'btn-gradient ring-1 ring-white/20'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Summarize Now</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </div>

                {/* Output Column */}
                <div className="p-8 flex flex-col space-y-6 bg-black/20 relative overflow-hidden">
                    {/* Background Noise/Texture optional */}

                    <div className="flex items-center justify-between text-slate-300 z-10">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-xl font-semibold tracking-wide">Summary</h2>
                        </div>
                        {summary && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={copyToClipboard}
                                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors border border-white/5"
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

                    <div className="relative flex-1 rounded-2xl bg-black/30 border border-white/10 p-6 overflow-y-auto custom-scrollbar shadow-inner z-10">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center space-y-6 p-4 text-center"
                                >
                                    <div className="relative w-20 h-20">
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xl font-semibold text-slate-200">
                                            {progress?.status === 'download' ? 'Downloading Knowledge...' : 'Analyzing Text...'}
                                        </p>
                                        <p className="text-sm text-slate-400 max-w-xs mx-auto">
                                            {progress?.text || 'Constructing summary...'}
                                        </p>
                                        {progress?.percentage !== undefined && (
                                            <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto mt-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress.percentage}%` }}
                                                    className="h-full bg-indigo-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : summary ? (
                                <motion.div
                                    key="summary"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="prose prose-invert max-w-none"
                                >
                                    <p className="text-lg leading-loose text-slate-200 font-light tracking-wide">
                                        {summary}
                                    </p>
                                </motion.div>
                            ) : error ? (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full text-red-400 space-y-3"
                                >
                                    <div className="p-3 bg-red-500/10 rounded-full">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium">{error}</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4"
                                >
                                    <div className="p-6 rounded-full bg-slate-800/50 border border-white/5 shadow-lg">
                                        <Sparkles className="w-10 h-10 opacity-20" />
                                    </div>
                                    <p className="font-light">AI Summary will materialize here</p>
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
