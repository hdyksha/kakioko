import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from './ui/Card';

interface RecorderProps {
    onRecordingComplete: (file: File) => void;
    isLoading: boolean;
    prompt: string;
    setPrompt: (value: string) => void;
    language: string;
    setLanguage: (value: string) => void;
}

export function Recorder({ onRecordingComplete, isLoading, prompt, setPrompt, language, setLanguage }: RecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], "recording.webm", { type: 'audio/webm' });
                onRecordingComplete(file);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            // Start timer
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <Card variant="glass" className="w-full max-w-xl mx-auto p-12 flex flex-col items-center justify-center text-center">
            <div className={clsx(
                "w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-500",
                isRecording
                    ? "bg-red-500 shadow-xl shadow-red-500/40 animate-pulse"
                    : "bg-slate-800 shadow-lg border border-slate-700"
            )}>
                {isRecording ? (
                    <Mic className="w-12 h-12 text-white" />
                ) : (
                    <Mic className="w-12 h-12 text-slate-400" />
                )}
            </div>

            <div className="mb-8">
                {isRecording ? (
                    <div className="text-4xl font-mono font-bold text-white tracking-widest">
                        {formatTime(duration)}
                    </div>
                ) : (
                    <h3 className="text-xl font-semibold text-white">Ready to Record</h3>
                )}
                <p className="text-slate-400 mt-2">
                    {isRecording ? "Recording in progress..." : "Click the button below to start recording"}
                </p>
            </div>

            {!isRecording && (
                <div className="w-full mb-6 text-left space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Context / Hints (Optional)
                        </label>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="E.g. Meeting about Project X, Speakers: Alice, Bob"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Language code (Optional)
                        </label>
                        <input
                            type="text"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            placeholder="E.g. ja, en"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            )}

            {!isRecording ? (
                <button
                    onClick={startRecording}
                    disabled={isLoading}
                    className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg active:scale-95"
                >
                    Start Recording
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="px-8 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all active:scale-95 flex items-center gap-2"
                >
                    <Square className="w-4 h-4 fill-white" />
                    Stop Recording
                </button>
            )}
        </Card>
    );
}
