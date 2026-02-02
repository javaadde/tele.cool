"use client";

import { useState, useEffect, useRef } from "react";
import { useChatStore } from "@/store/useChatStore";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, ChevronRight, Grid, Hash, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export const PrivateUnlockModal = () => {
  const { revealTriggered, setRevealTriggered, togglePrivateMode, isPrivateMode } = useChatStore();
  const [method, setMethod] = useState<'pin' | 'pattern'>('pin');
  const [pin, setPin] = useState("");
  const [pattern, setPattern] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (revealTriggered) {
      setPin("");
      setPattern([]);
      setError(false);
    }
  }, [revealTriggered]);

  const handleSubmit = (val: string | number[]) => {
    // Mock passwords: PIN '1234' or Pattern [0, 1, 2, 5] (top row + center-right)
    const isCorrect = method === 'pin' 
      ? val === "1234" 
      : JSON.stringify(val) === JSON.stringify([0, 1, 2, 5]);

    if (isCorrect) {
      togglePrivateMode("1234");
      setRevealTriggered(false);
    } else {
      setError(true);
      setPin("");
      setPattern([]);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleDotClick = (index: number) => {
    if (!isDrawing) setIsDrawing(true);
    if (!pattern.includes(index)) {
      setPattern([...pattern, index]);
    }
  };

  const handlePatternComplete = () => {
    if (pattern.length > 0) {
      handleSubmit(pattern);
      setIsDrawing(false);
    }
  };

  return (
    <AnimatePresence>
      {revealTriggered && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRevealTriggered(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              x: error ? [0, -10, 10, -10, 10, 0] : 0
            }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-[360px] bg-tg-sidebar border border-tg-border rounded-[40px] p-8 flex flex-col items-center gap-6 relative shadow-2xl"
          >
            {/* Method Switcher */}
            <div className="flex bg-tg-chat-bg p-1 rounded-2xl w-full border border-tg-border">
               <button 
                  onClick={() => setMethod('pin')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                    method === 'pin' ? "bg-tg-blue text-white shadow-lg" : "text-tg-text-secondary hover:text-tg-text"
                  )}
               >
                  <Hash size={14} /> PIN
               </button>
               <button 
                  onClick={() => setMethod('pattern')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                    method === 'pattern' ? "bg-tg-blue text-white shadow-lg" : "text-tg-text-secondary hover:text-tg-text"
                  )}
               >
                  <Grid size={14} /> Pattern
               </button>
            </div>

            <div className="w-16 h-16 bg-tg-blue/10 rounded-2xl flex items-center justify-center text-tg-blue">
               {method === 'pin' ? <Lock size={32} /> : <Grid size={32} />}
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">Secure Access</h2>
              <p className="text-sm text-tg-text-secondary mt-1">
                {method === 'pin' ? "Enter your security PIN" : "Draw your security pattern"}
              </p>
            </div>

            {method === 'pin' ? (
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSubmit(pin); }} 
                className="w-full flex flex-col gap-4"
              >
                <input 
                  autoFocus
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-tg-chat-bg border border-tg-border rounded-2xl px-4 py-4 text-center text-3xl tracking-[0.5em] focus:outline-none focus:border-tg-blue transition-colors"
                />
                <button 
                  type="submit"
                  className="w-full bg-tg-blue hover:bg-tg-blue-hover text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  Verify <ChevronRight size={18} />
                </button>
              </form>
            ) : (
              <div className="w-full flex flex-col gap-6">
                 {/* Pattern Grid */}
                 <div className="grid grid-cols-3 gap-6 p-4 bg-tg-chat-bg/50 rounded-3xl border border-tg-border aspect-square relative">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <button
                        key={i}
                        onMouseEnter={() => isDrawing && handleDotClick(i)}
                        onMouseDown={() => { setIsDrawing(true); handleDotClick(i); }}
                        className="relative z-10 p-2"
                      >
                         <div className={cn(
                           "w-4 h-4 rounded-full transition-all duration-300",
                           pattern.includes(i) ? "bg-tg-blue scale-125 shadow-lg shadow-tg-blue/50" : "bg-tg-text-secondary/20 group-hover:bg-tg-text-secondary/40"
                         )} />
                      </button>
                    ))}
                    
                    {/* Visual connections would go here in a full svg implementation */}
                 </div>

                 <div className="flex gap-2">
                    <button 
                      onClick={() => setPattern([])}
                      className="flex-1 bg-tg-chat-bg border border-tg-border text-tg-text-secondary py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-tg-sidebar transition-colors"
                    >
                      <RotateCcw size={16} /> Reset
                    </button>
                    <button 
                      onClick={handlePatternComplete}
                      disabled={pattern.length === 0}
                      className="flex-[2] bg-tg-blue hover:bg-tg-blue-hover disabled:opacity-50 text-white py-3 rounded-2xl font-bold transition-colors"
                    >
                      Process Pattern
                    </button>
                 </div>
              </div>
            )}

            <button 
               onClick={() => setRevealTriggered(false)}
               className="text-[10px] text-tg-text-secondary hover:text-tg-text uppercase tracking-widest font-bold transition-colors"
            >
              Cancel Access Request
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
