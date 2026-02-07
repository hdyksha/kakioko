"use client";

import { useState } from "react";
import axios from "axios";
import { ModeSwitcher } from "@/components/ModeSwitcher";
import { FileUploader } from "@/components/FileUploader";
import { Recorder } from "@/components/Recorder";
import { TranscriptionView } from "@/components/TranscriptionView";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Upload, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

export default function Home() {
  const [mode, setMode] = useState<'local' | 'cloud'>('local');
  const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setTranscription(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    try {
      // Assuming backend is running on localhost:8000
      const response = await axios.post("http://localhost:8000/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setTranscription(response.data.text);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred during transcription.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setTranscription(null);
    setError(null);
  };

  return (
    <main className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

      <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-4 tracking-tight">
            Kakioko
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Privacy-first AI speech transcription. Process audio locally or in the cloud.
          </p>
        </motion.div>

        {!transcription ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            {/* Controls */}
            <div className="flex flex-col items-center gap-8 mb-12">
              <ModeSwitcher mode={mode} onChange={setMode} />

              <div className="flex p-1 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-800">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all",
                    activeTab === 'upload' ? "bg-slate-700 text-white shadow-md" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('record')}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all",
                    activeTab === 'record' ? "bg-slate-700 text-white shadow-md" : "text-slate-400 hover:text-white"
                  )}
                >
                  <Mic className="w-4 h-4" />
                  Record Audio
                </button>
              </div>
            </div>

            {/* Main Area */}
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'upload' ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FileUploader startAnalysis={handleAnalysis} isLoading={isLoading} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="record"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Recorder onRecordingComplete={handleAnalysis} isLoading={isLoading} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3 text-left"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-indigo-300 animate-pulse font-medium"
              >
                Processing your audio...
              </motion.div>
            )}
          </motion.div>
        ) : (
          <TranscriptionView text={transcription} onReset={reset} />
        )}
      </div>
    </main>
  );
}
