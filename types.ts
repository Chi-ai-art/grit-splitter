export interface ImageSlice {
  id: number;
  dataUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
  description?: string;
  isAnalyzing: boolean;
}

export enum SliceStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
}