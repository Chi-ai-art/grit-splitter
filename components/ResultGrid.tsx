import React, { useState } from 'react';
import { ImageSlice } from '../types';
import JSZip from 'jszip';

interface ResultGridProps {
  slices: ImageSlice[];
  onAnalyze: (id: number) => void;
}

export const ResultGrid: React.FC<ResultGridProps> = ({ slices, onAnalyze }) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isZipping, setIsZipping] = useState(false);

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === slices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(slices.map(s => s.id)));
    }
  };

  const downloadImage = (slice: ImageSlice) => {
    const url = slice.dataUrl;
    const link = document.createElement('a');
    link.href = url;
    const safeDesc = slice.description ? `_${slice.description.replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/gi, '')}` : '';
    link.download = `slice_${slice.id + 1}${safeDesc}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAndDownloadZip = async (targetSlices: ImageSlice[], filename: string) => {
    if (targetSlices.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      targetSlices.forEach((slice) => {
        const url = slice.dataUrl;
        const base64Data = url.split(',')[1];
        const safeDesc = slice.description ? `_${slice.description.replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/gi, '')}` : '';
        const name = `slice_${slice.id + 1}${safeDesc}.png`;
        zip.file(name, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate ZIP:", error);
      alert("ZIPファイルの作成に失敗しました。");
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSelected = () => {
    const targets = slices.filter(s => selectedIds.has(s.id));
    generateAndDownloadZip(targets, 'selected_slices.zip');
  };

  const handleDownloadAll = () => {
    generateAndDownloadZip(slices, 'all_slices.zip');
  };
  
  const isAllSelected = slices.length > 0 && selectedIds.size === slices.length;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      {/* Toolbar */}
      <div className="bg-slate-800/80 backdrop-blur-sm sticky top-4 z-10 p-4 rounded-xl border border-slate-700 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
            <input 
              type="checkbox" 
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800 cursor-pointer"
            />
            <span className="font-medium text-slate-200">全て選択</span>
          </label>
          <span className="text-sm text-slate-400 border-l border-slate-600 pl-3 hidden sm:inline">
            {selectedIds.size} / {slices.length} 選択中
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Selected Actions */}
          <div className="flex items-center gap-2 bg-slate-700/30 p-1.5 rounded-lg border border-slate-600/30">
              <button
                onClick={handleDownloadSelected}
                disabled={selectedIds.size === 0 || isZipping}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${
                  selectedIds.size > 0 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
                title="選択した画像を保存"
              >
                {isZipping ? (
                   <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M13.75 7h-3V3.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L6.2 4.74a.75.75 0 0 0 1.1 1.02l1.95-2.1V7h-3A2.25 2.25 0 0 0 4 9.25v7.5A2.25 2.25 0 0 0 6.25 19h7.5A2.25 2.25 0 0 0 16 16.75v-7.5A2.25 2.25 0 0 0 13.75 7Z" />
                  </svg>
                )}
                選択保存
              </button>
          </div>

          {/* All Actions */}
          <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadAll}
                disabled={isZipping}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                一括保存
              </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {slices.map((slice) => {
          const isSelected = selectedIds.has(slice.id);

          return (
            <div 
              key={slice.id} 
              onClick={() => toggleSelection(slice.id)}
              className={`bg-slate-800 rounded-lg overflow-hidden border shadow-lg flex flex-col transition-all cursor-pointer relative group ${
                isSelected 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/50' 
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              {/* Checkbox Overlay */}
              <div className="absolute top-2 right-2 z-20">
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-indigo-500 border-indigo-500 text-white' 
                    : 'bg-black/40 border-white/50 hover:bg-black/60'
                }`}>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Image Preview Area */}
              <div className="relative aspect-square bg-slate-900/50 flex items-center justify-center p-2">
                <img 
                  src={slice.dataUrl} 
                  alt={`Slice ${slice.id + 1}`} 
                  className="max-w-full max-h-full object-contain pointer-events-none select-none transition-opacity duration-300"
                />
                
                {/* Overlay number */}
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold border border-white/20">
                  {slice.id + 1}
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3 flex-grow" onClick={e => e.stopPropagation()}>
                {/* Description Area */}
                <div className="min-h-[3rem] text-sm">
                  {slice.description ? (
                    <p className="text-indigo-300 font-medium animate-fadeIn">
                      <span className="text-slate-500 text-xs block mb-1">AI解析結果:</span>
                      {slice.description}
                    </p>
                  ) : slice.isAnalyzing ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      解析中...
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">説明はまだありません</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAnalyze(slice.id)}
                    disabled={slice.isAnalyzing || !!slice.description}
                    className={`px-2 py-2 text-[10px] font-semibold rounded-md flex items-center justify-center gap-1 transition-all ${
                      slice.description 
                        ? 'bg-green-900/30 text-green-400 cursor-default border border-green-800'
                        : 'bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white'
                    }`}
                  >
                    {slice.description ? '解析完了' : 'AI解析'}
                  </button>
                  
                  <button
                    onClick={() => downloadImage(slice)}
                    className="px-3 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                    </svg>
                    保存
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};