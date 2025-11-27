import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateSpeech, extractTextFromImage, VoiceConfig } from './services/geminiService';
import { VOICES, VoiceName, VoiceOption } from './types';
import { decodeBase64, decodeAudioData, bufferToWav, bufferToMp3 } from './utils/audio';
import Visualizer from './components/Visualizer';

// Icons
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);
const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-400">
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.97 15.03a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-400 group-hover:text-cyan-400 transition-colors">
    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.49 1.478l-.565-.061a4.435 4.435 0 00-3.804-4.827.75.75 0 01.202-1.486zM3.196 6.634a.75.75 0 01.666-.084 48.806 48.806 0 003.878-.512v-.227c0-1.564 1.248-2.85 2.806-2.9 1.129-.036 2.256-.036 3.385 0 1.558.05 2.806 1.336 2.806 2.9v.227c.48.062.956.126 1.428.196l-.838 12.56a4.5 4.5 0 01-4.492 4.195H8.672a4.5 4.5 0 01-4.492-4.195L3.352 6.837a.75.75 0 01-.156-.203zM6.92 6.166a47.336 47.336 0 0010.16 0V4.478c0-.735-.584-1.343-1.317-1.367-1.464-.047-2.928-.047-4.393 0-.733.024-1.317.632-1.317 1.367v1.688z" clipRule="evenodd" />
  </svg>
);
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
    <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

type VoiceMode = 'prebuilt' | 'custom';
type DownloadFormat = 'wav' | 'mp3';

export default function App() {
  const [text, setText] = useState<string>('');
  
  // Voice State
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('prebuilt');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Kore);
  
  // Speech Settings
  const [speed, setSpeed] = useState<number>(1.0);
  
  // Custom Voice State
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFileBase64, setCustomFileBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OCR State
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const ocrInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('wav');
  
  // Audio context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0); // Track where we paused (in seconds)
  
  // Initialize Audio Context lazily
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 }); // Gemini 2.5 usually 24k
      
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
    }
  }, []);

  // Update playback rate in real-time
  useEffect(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.playbackRate.value = speed;
    }
  }, [speed]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) return;

    // 1. Size Check (5MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is ${MAX_SIZE_MB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Type Check
    // Common audio MIME types
    const validMimeTypes = [
      'audio/wav', 'audio/x-wav', 
      'audio/mp3', 'audio/mpeg', 
      'audio/ogg', 
      'audio/flac', 
      'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/webm'
    ];
    
    // Fallback extension check because file.type can be unreliable
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.wav', '.mp3', '.mpeg', '.ogg', '.flac', '.aac', '.m4a', '.mp4', '.webm'];
    
    const isValidType = validMimeTypes.some(type => file.type.includes(type)) || 
                        validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      setError(`Unsupported file type: "${file.name}". Please upload a WAV, MP3, FLAC, AAC, or OGG file.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Reader & Corruption Check
    setLoading(true);
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      if (!result || !result.includes(',')) {
        setError("Failed to read file data. The file might be empty or corrupted.");
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      const base64 = result.split(',')[1];
      setCustomFile(file);
      setCustomFileBase64(base64);
      setLoading(false);
      setError(null);
    };

    reader.onerror = () => {
      setError("Failed to read file. The file may be corrupted or unreadable.");
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const removeCustomFile = () => {
    setCustomFile(null);
    setCustomFileBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
  };

  const processImageForOcr = async (file: File) => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      if (ocrInputRef.current) ocrInputRef.current.value = '';
      return;
    }

    // Size Limit
    if (file.size > 5 * 1024 * 1024) {
       setError("Image file is too large (max 5MB).");
       if (ocrInputRef.current) ocrInputRef.current.value = '';
       return;
    }

    setOcrLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const extractedText = await extractTextFromImage(base64, file.type);
        
        setText(prev => prev ? `${prev}\n\n${extractedText}` : extractedText);
      } catch (err: any) {
        setError("Failed to extract text from image.");
      } finally {
        setOcrLoading(false);
        if (ocrInputRef.current) ocrInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
      setOcrLoading(false);
      if (ocrInputRef.current) ocrInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageForOcr(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          processImageForOcr(file);
        }
        return;
      }
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    // Validation for custom voice
    if (voiceMode === 'custom' && !customFileBase64) {
      setError("Please upload a reference audio file for custom voice.");
      return;
    }

    // Stop any existing playback
    handleStop();
    setAudioBuffer(null);
    setLoading(true);
    setError(null);

    try {
      const config: VoiceConfig = voiceMode === 'prebuilt' 
        ? { type: 'prebuilt', name: selectedVoice }
        : { type: 'custom', audioData: customFileBase64! };

      // 1. Fetch raw base64 (Speed passed but API wrapper may ignore it to prevent errors)
      const base64Data = await generateSpeech(text, config, speed);
      
      // 2. Decode base64 to bytes
      const rawBytes = decodeBase64(base64Data);

      // 3. Init context if needed
      initAudioContext();
      if (!audioContextRef.current) throw new Error("Audio Context init failed");

      // 4. Decode to AudioBuffer
      const buffer = await decodeAudioData(rawBytes, audioContextRef.current, 24000, 1);
      
      setAudioBuffer(buffer);
      pauseOffsetRef.current = 0; // Reset play position
      
      // Auto-play
      playBuffer(buffer, 0);

    } catch (err: any) {
      setError(err.message || "Failed to generate speech");
    } finally {
      setLoading(false);
    }
  };

  const playBuffer = (buffer: AudioBuffer, offset: number) => {
    if (!audioContextRef.current || !analyserRef.current) return;
    
    // Resume context if suspended (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    
    // Apply speed (pitch-affecting playback rate)
    source.playbackRate.value = speed;
    
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    source.onended = () => {
      setIsPlaying(false);
      pauseOffsetRef.current = 0; // Reset when finished naturally
    };

    // offset is in "buffer seconds" (unaffected by playbackRate start param)
    source.start(0, offset);
    
    // Record start time. Note: accurate pausing with variable speed is complex.
    // We store the current context time to calculate elapsed real time later.
    startTimeRef.current = audioContextRef.current.currentTime;
    
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (!audioBuffer) return;

    if (isPlaying) {
      // Pause
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
      
      if (audioContextRef.current) {
        // Calculate how much buffer we played.
        // Elapsed real time * current playback rate = buffer time advanced (approx)
        const elapsedRealTime = audioContextRef.current.currentTime - startTimeRef.current;
        const playedBufferTime = elapsedRealTime * speed;
        pauseOffsetRef.current = pauseOffsetRef.current + playedBufferTime;
        
        // Clamp to buffer duration
        if (pauseOffsetRef.current > audioBuffer.duration) {
            pauseOffsetRef.current = 0;
        }
      }
    } else {
      // Play
      // If we finished, reset
      if (pauseOffsetRef.current >= audioBuffer.duration) {
        pauseOffsetRef.current = 0;
      }
      playBuffer(audioBuffer, pauseOffsetRef.current);
    }
  };

  const handleStop = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    pauseOffsetRef.current = 0;
  };

  const handleDownload = () => {
    if (!audioBuffer) return;
    
    let blob: Blob;
    let ext: string;
    
    try {
      if (downloadFormat === 'mp3') {
        blob = bufferToMp3(audioBuffer);
        ext = 'mp3';
      } else {
        blob = bufferToWav(audioBuffer);
        ext = 'wav';
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geminivox-${voiceMode}-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download encoding error:", e);
      setError("Failed to encode audio for download.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-cyan-500 selection:text-white flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-5xl px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            GeminiVox
          </h1>
        </div>
        <div className="text-sm text-gray-500 font-medium border border-gray-800 px-3 py-1 rounded-full">
          v1.0 • Gemini 2.5 Flash
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl px-4 pb-12 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Input & Controls */}
        <section className="flex-1 flex flex-col gap-6">
          
          {/* Text Input */}
          <div className="bg-gray-900 rounded-2xl p-1 shadow-2xl border border-gray-800 focus-within:border-cyan-500/50 transition-colors duration-300">
             <div className="bg-gray-950 rounded-xl overflow-hidden relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Enter text to convert to lifelike speech, or paste an image (Ctrl+V) to extract text..."
                  className="w-full h-64 p-6 bg-transparent resize-none text-lg leading-relaxed focus:outline-none placeholder-gray-600 font-light"
                  maxLength={5000}
                />
             </div>
             <div className="px-4 py-3 flex justify-between items-center text-xs text-gray-500 border-t border-gray-800/50 bg-gray-900 rounded-b-xl">
               <div className="flex items-center gap-3">
                 <span>{text.length} / 5000 characters</span>
               </div>
               <div className="flex items-center gap-4">
                 <button 
                    onClick={() => ocrInputRef.current?.click()}
                    disabled={ocrLoading}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 px-4 py-2 rounded-lg transition-all border border-gray-700 hover:border-cyan-500/30 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-black/20"
                 >
                    {ocrLoading ? (
                       <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                       <CameraIcon />
                    )}
                    <span className="hidden sm:inline group-hover:text-cyan-300">Image to Text</span>
                 </button>
                 <div className="w-px h-6 bg-gray-800 mx-2"></div>
                 <button 
                  onClick={() => setText('')}
                  disabled={!text}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 px-3 py-2 rounded-lg transition-all border border-gray-700 hover:border-red-500/30 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-black/20 active:scale-95"
                  title="Clear all text"
                 >
                   <TrashIcon />
                   <span className="hidden sm:inline group-hover:text-red-300 transition-colors">Clear</span>
                 </button>
                 <input 
                    type="file" 
                    ref={ocrInputRef}
                    onChange={handleOcrFileChange}
                    accept="image/*"
                    className="hidden"
                 />
               </div>
             </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
             <button
              onClick={handleGenerate}
              disabled={loading || !text.trim() || (voiceMode === 'custom' && !customFileBase64)}
              className={`
                flex-1 py-4 rounded-xl font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95
                ${loading || !text.trim() || (voiceMode === 'custom' && !customFileBase64)
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20'
                }
              `}
             >
               {loading ? (
                 <>
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   Generating...
                 </>
               ) : (
                 <>
                   <SparklesIcon />
                   Generate Audio
                 </>
               )}
             </button>
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2 animate-pulse-slow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

        </section>

        {/* Right Column: Settings & Visuals */}
        <aside className="w-full md:w-80 flex flex-col gap-6">
          
          {/* Visualizer Card */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Visualizer</h2>
               {audioBuffer && (
                  <span className="text-xs text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900">
                    {isPlaying ? 'Playing' : 'Ready'}
                  </span>
               )}
             </div>
             <Visualizer analyser={analyserRef.current} isPlaying={isPlaying} />
             
             {/* Playback Controls */}
             <div className="mt-6 flex justify-center items-center gap-4">
               <button 
                onClick={handlePlayPause}
                disabled={!audioBuffer}
                className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
               >
                 {isPlaying ? <span className="block w-6 h-6"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></span> : <PlayIcon />}
               </button>
               
               <button 
                onClick={handleStop}
                disabled={!audioBuffer}
                className="p-3 rounded-full bg-gray-950 border border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
               >
                 <StopIcon />
               </button>

               <div className="h-8 w-px bg-gray-800 mx-2"></div>

               {/* Download Group */}
               <div className="flex bg-gray-950 border border-gray-800 rounded-full p-1 items-center">
                 <button
                   onClick={handleDownload}
                   disabled={!audioBuffer}
                   className="p-2 rounded-full text-gray-400 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                   title="Download"
                 >
                   <DownloadIcon />
                 </button>
                 <div className="relative border-l border-gray-800 ml-1 pl-1">
                   <select 
                     value={downloadFormat}
                     onChange={(e) => setDownloadFormat(e.target.value as DownloadFormat)}
                     className="bg-transparent text-xs font-medium text-gray-400 hover:text-white focus:outline-none appearance-none py-1 pr-4 pl-2 cursor-pointer disabled:cursor-not-allowed"
                     disabled={!audioBuffer}
                   >
                     <option value="wav">WAV</option>
                     <option value="mp3">MP3</option>
                   </select>
                   <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                       <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                     </svg>
                   </div>
                 </div>
               </div>

             </div>
          </div>

          {/* Speed Settings Card */}
           <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                   <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                 </svg>
                 <h2 className="text-sm font-semibold uppercase tracking-wider">Speed</h2>
               </div>
               <span className="text-xs font-bold text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-900/50 font-mono">
                 {speed.toFixed(1)}x
               </span>
             </div>
             
             <div className="relative pt-1">
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                  <span>0.5x</span>
                  <span>Normal</span>
                  <span>3.0x</span>
                </div>
             </div>
          </div>

          {/* Voice Selector */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => { setVoiceMode('prebuilt'); setError(null); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${voiceMode === 'prebuilt' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Prebuilt Voices
              </button>
              <button
                onClick={() => { setVoiceMode('custom'); setError(null); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${voiceMode === 'custom' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Custom Voice
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {voiceMode === 'prebuilt' ? (
                <div className="space-y-3">
                  {VOICES.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`
                        w-full text-left p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group outline-none focus:ring-2 focus:ring-cyan-500/40
                        ${selectedVoice === voice.id 
                          ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-900/20' 
                          : 'bg-gray-950 border-gray-800 hover:border-gray-700 hover:bg-gray-900'
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors
                        ${selectedVoice === voice.id ? 'bg-cyan-500 text-gray-950' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}
                      `}>
                        {voice.name[0]}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className={`font-semibold text-sm transition-colors ${selectedVoice === voice.id ? 'text-white' : 'text-gray-200'}`}>
                          {voice.name}
                        </div>
                        <div className={`text-xs transition-colors ${selectedVoice === voice.id ? 'text-cyan-200/80' : 'text-gray-500'}`}>
                          {voice.gender} • {voice.description}
                        </div>
                      </div>

                      {/* Radio Button */}
                      <div className={`
                        w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200
                        ${selectedVoice === voice.id ? 'border-cyan-400 bg-cyan-400' : 'border-gray-600 group-hover:border-gray-500'}
                      `}>
                        {selectedVoice === voice.id && (
                           <div className="w-2 h-2 rounded-full bg-gray-950" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4 h-full">
                  <div className="text-sm text-gray-400">
                    Upload a reference audio file (WAV/MP3) to clone the speaker's voice.
                  </div>

                  {!customFile ? (
                     <div 
                      className={`flex-1 min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer group transition-all
                        ${error && voiceMode === 'custom'
                          ? 'border-red-500/50 bg-red-500/5 animate-pulse-slow' 
                          : 'border-gray-700 hover:border-cyan-500/50 bg-gray-950/50 hover:bg-gray-900'
                        }
                      `}
                      onClick={() => fileInputRef.current?.click()}
                     >
                       <UploadIcon />
                       <span className="mt-2 text-sm text-gray-500 group-hover:text-gray-300">Click to upload audio</span>
                       <span className="text-xs text-gray-600 mt-1">Max 5MB • WAV/MP3</span>
                     </div>
                  ) : (
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-cyan-900/30 text-cyan-400 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                             <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.061-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-9.546 14.242a5.25 5.25 0 01-7.424-7.424l4.5-4.5a.75.75 0 011.061 1.06l-4.5 4.5a3.75 3.75 0 005.304 5.304l1.757-1.757a.75.75 0 011.061 1.06l-1.757 1.757z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-medium text-white truncate">{customFile.name}</div>
                          <div className="text-xs text-gray-500">{(customFile.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <button 
                        onClick={removeCustomFile}
                        className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="audio/*" 
                    onChange={handleFileUpload} 
                  />

                  {customFile && (
                    <div className="mt-auto p-3 bg-cyan-900/10 border border-cyan-900/30 rounded-lg text-xs text-cyan-200">
                      <strong>Tip:</strong> For best results, use a clear recording of a single speaker with minimal background noise.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
        </aside>
      </main>
    </div>
  );
}