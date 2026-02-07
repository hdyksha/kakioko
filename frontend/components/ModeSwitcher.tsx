import { motion } from 'framer-motion';
import { Cloud, Laptop, Lock } from 'lucide-react';
import { clsx } from 'clsx';

interface ModeSwitcherProps {
    mode: 'local' | 'cloud';
    onChange: (mode: 'local' | 'cloud') => void;
}

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
    return (
        <div className="bg-slate-900/50 p-1.5 rounded-xl inline-flex relative border border-slate-800 backdrop-blur-sm">
            <button
                onClick={() => onChange('local')}
                className={clsx(
                    "relative z-10 flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    mode === 'local' ? "text-white" : "text-slate-400 hover:text-slate-200"
                )}
            >
                <Laptop className="w-4 h-4" />
                Local (Privacy)
                {mode === 'local' && (
                    <motion.div
                        layoutId="active-mode"
                        className="absolute inset-0 bg-slate-800 rounded-lg -z-10 shadow-sm border border-slate-700"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
            </button>

            <button
                onClick={() => onChange('cloud')}
                className={clsx(
                    "relative z-10 flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    mode === 'cloud' ? "text-white" : "text-slate-400 hover:text-slate-200"
                )}
            >
                <Cloud className="w-4 h-4" />
                Cloud (AWS)
                {mode === 'cloud' && (
                    <motion.div
                        layoutId="active-mode"
                        className="absolute inset-0 bg-indigo-900/40 rounded-lg -z-10 shadow-sm border border-indigo-500/30"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
            </button>
        </div>
    );
}
