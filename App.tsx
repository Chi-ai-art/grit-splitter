import React, { useState, useCallback } from 'react';
import { DropZone } from './components/DropZone';
import { ResultGrid } from './components/ResultGrid';
import { splitImage } from './utils/imageProcessing';
import { analyzeImageSlice } from './services/geminiService';
import { ImageSlice } from './types';

const App: React.FC = () => {
  const [slices, setSlices] = useState<ImageSlice[]>([]);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSlices([]);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          setOriginalImage(result);
          try {
            const generatedSlices = await splitImage(result);
            setSlices(generatedSlices);
          } catch (err) {
            console.error(err);
            setError("画像の処理中にエラーが発生しました。");
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("ファイルの読み込みに失敗しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeSlice = useCallback(async (id: number) => {
    const sliceIndex = slices.findIndex(s => s.id === id);
    if (sliceIndex === -1) return;

    setSlices(prev => prev.map(s => s.id === id ? { ...s, isAnalyzing: true } : s));

    try {
      const description = await analyzeImageSlice(slices[sliceIndex].dataUrl);
      setSlices(prev => prev.map(s => s.id === id ? { 
        ...s, 
        description, 
        isAnalyzing: false 
      } : s));
    } catch (err) {
      setSlices(prev => prev.map(s => s.id === id ? { ...s, isAnalyzing: false } : s));
    }
  }, [slices]);

  const handleReset = () => {
    setSlices([]);
    setOriginalImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4">
            GridSplitter AI
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            1枚の画像を3x3（9分割）に自動カット。Gemini APIを使って、各ピースの中身を解析できます。
          </p>
        </header>

        <main>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg mb-8 text-center">
              {error}
            </div>
          )}

          {!originalImage ? (
            <div className="animate-fadeIn">
              <DropZone onFileSelect={handleFileSelect} />
              {isProcessing && (
                <div className="mt-8 text-center text-indigo-400 animate-pulse">
                  画像を処理中...
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fadeIn">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                  <h2 className="text-xl font-semibold text-slate-200">
                    分割結果 ({slices.length}枚)
                  </h2>
                  <button 
                    onClick={handleReset}
                    className="text-sm text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-all"
                  >
                    別の画像をアップロード
                  </button>
               </div>

               {isProcessing ? (
                 <div className="h-64 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
               ) : (
                 <ResultGrid 
                    slices={slices} 
                    onAnalyze={handleAnalyzeSlice} 
                 />
               )}
            </div>
          )}
        </main>

        <footer className="mt-20 text-center text-slate-600 text-sm border-t border-slate-800 pt-8">
          <p>Powered by React, Tailwind CSS & Google Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;