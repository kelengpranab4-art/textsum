
import React from 'react';
import Summarizer from './components/Summarizer';

function App() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4 sm:p-8">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/30 blur-[120px] animate-float delay-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/30 blur-[120px] animate-float delay-1000"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-pink-500/20 blur-[100px] animate-float delay-2000"></div>
        <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-emerald-500/20 blur-[100px] animate-float delay-3000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl">
        <Summarizer />
      </div>
    </div>
  );
}

export default App;
