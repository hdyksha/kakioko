import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Copy, Check, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface TranscriptionViewProps {
    text: string;
    onReset: () => void;
}

export function TranscriptionView({ text, onReset }: TranscriptionViewProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "transcription.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Transcription Result</h2>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        New
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? "Copied" : "Copy Text"}
                    </Button>
                </div>
            </div>

            <Card variant="glass" className="min-h-[300px] p-6 text-lg text-slate-200 leading-relaxed font-sans glass-card">
                {text.split('\n').map((line, i) => (
                    <p key={i} className="mb-4">{line}</p>
                ))}
            </Card>
        </motion.div>
    );
}
