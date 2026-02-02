"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Globe, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { tgService } from "@/lib/telegramService";
import { useChatStore } from "@/store/useChatStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuthenticated = useChatStore((state) => state.setAuthenticated);
  const [step, setStep] = useState(1); // 1: Phone, 2: Code
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await tgService.sendCode(phone);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result: any = await tgService.signIn(code);
      
      // Mock user extraction from Telegram response
      const user = result.user || result;
      setAuthenticated({
        id: user.id?.toString() || "id",
        phone: phone,
        firstName: user.firstName || "Telegram",
        lastName: user.lastName || "User",
        username: user.username
      });
      
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid code or login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-tg-chat-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tg-blue/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tg-blue/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-tg-sidebar border border-tg-border rounded-[40px] p-8 md:p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
           <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-20 h-20 bg-tg-blue rounded-3xl flex items-center justify-center shadow-lg shadow-tg-blue/30 mb-6"
           >
              <Shield className="text-white" size={40} />
           </motion.div>
           <h1 className="text-2xl font-bold text-center">TeleCool Login</h1>
           <p className="text-tg-text-secondary text-sm text-center mt-2 px-6">
              Connect your Telegram account securely to access advanced features.
           </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs"
          >
            <AlertCircle size={14} className="shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handlePhoneSubmit}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-tg-blue ml-2">Phone Number</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tg-text-secondary pointer-events-none">
                      <Globe size={18} />
                   </div>
                   <input 
                    required
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-tg-chat-bg border border-tg-border rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:border-tg-blue transition-colors placeholder:text-tg-text-secondary/30"
                   />
                </div>
              </div>

              <button 
                disabled={isLoading || !phone}
                className="w-full bg-tg-blue hover:bg-tg-blue-hover disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Next Step <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              <div className="flex items-center gap-2 justify-center text-[10px] text-tg-text-secondary uppercase tracking-widest font-bold">
                 <Shield size={12} /> Privacy First Encryption Active
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleCodeSubmit}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2 text-center mb-2">
                <p className="text-sm text-tg-text-secondary">We've sent a code to <span className="text-tg-text font-bold">{phone}</span></p>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-tg-blue hover:underline">Wrong number?</button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-tg-blue ml-2">Login Code</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tg-text-secondary pointer-events-none">
                      <Lock size={18} />
                   </div>
                   <input 
                    required
                    autoFocus
                    type="text"
                    placeholder="Enter code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-tg-chat-bg border border-tg-border rounded-2xl py-4 pl-12 pr-4 text-2xl tracking-[0.5em] text-center focus:outline-none focus:border-tg-blue transition-colors placeholder:text-tg-text-secondary/30"
                   />
                </div>
              </div>

              <button 
                disabled={isLoading || !code}
                className="w-full bg-tg-blue hover:bg-tg-blue-hover disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 group transition-all"
              >
                 {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Verify & Login <CheckCircle2 size={20} /></>
                )}
              </button>

              <p className="text-center text-xs text-tg-text-secondary">
                Didn't receive the code? <button type="button" className="text-tg-blue font-bold">Resend</button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-12 text-tg-text-secondary/40 text-[10px] uppercase tracking-[0.3em] font-bold">
         Powered by TeleCool Pro Protocol
      </div>
    </main>
  );
}
