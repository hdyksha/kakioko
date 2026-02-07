import { useCallback, useState } from 'react';
import { Upload, FileAudio, X } from 'lucide-react';
import { Card } from './ui/Card';
import { clsx } from 'clsx';

interface FileUploaderProps {
    startAnalysis: (file: File) => void;
    isLoading: boolean;
    prompt: string;
    setPrompt: (value: string) => void;
    language: string;
    setLanguage: (value: string) => void;
    modelName: string;
    setModelName: (value: string) => void;
    useGpu: boolean;
    setUseGpu: (value: boolean) => void;
    mode: 'local' | 'cloud';
}

export function FileUploader({ startAnalysis, isLoading, prompt, setPrompt, language, setLanguage, modelName, setModelName, useGpu, setUseGpu, mode }: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith('audio/') || droppedFile.type.startsWith('video/')) {
                setFile(droppedFile);
            } else {
                alert('Please upload an audio or video file.');
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setFile(null);
    };

    const handleUpload = () => {
        if (file) {
            startAnalysis(file);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {!file ? (
                <div
                    className={clsx(
                        "relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300",
                        dragActive ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" : "border-slate-700 hover:border-slate-600 bg-slate-900/30"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="audio/*,video/*"
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center cursor-pointer h-full w-full"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-indigo-400 shadow-xl border border-slate-700">
                            <Upload className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Upload Audio File</h3>
                        <p className="text-slate-400 mb-6 max-w-xs mx-auto">
                            Drag and drop your audio file here, or click to browse.
                            Supports MP3, WAV, M4A, etc.
                        </p>
                        <span className="px-6 py-2.5 rounded-lg bg-slate-800 text-white font-medium border border-slate-700 transition hover:bg-slate-700">
                            Select File
                        </span>
                    </label>
                </div>
            ) : (
                <Card variant="solid" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <FileAudio className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-white truncate max-w-[200px]">{file.name}</p>
                                <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            onClick={clearFile}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4 mb-4 text-left">
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
                                Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                disabled={isLoading}
                            >
                                <option value="auto">Auto (Detect)</option>
                                <option value="ja-JP">Japanese (ja-JP)</option>
                                <option value="en-US">English (en-US)</option>
                            </select>
                        </div>

                        {mode === 'local' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Model
                                    </label>
                                    <select
                                        value={modelName}
                                        onChange={(e) => setModelName(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                        disabled={isLoading}
                                    >
                                        <option value="tiny">Tiny (Fastest)</option>
                                        <option value="base">Base (Balanced)</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large-v3-turbo">Large-v3-Turbo (Best)</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useGpu}
                                            onChange={(e) => setUseGpu(e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                            disabled={isLoading}
                                        />
                                        <span className="text-sm font-medium text-slate-300">Use GPU</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLoading ? "Transcribing..." : "Start Transcription"}
                    </button>
                </Card>
            )}
        </div>
    );
}
