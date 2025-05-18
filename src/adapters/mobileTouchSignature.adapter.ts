// import { ISignatureAdapter } from '../core/ISignatureAdapter';

// export class MobileTouchAdapter implements ISignatureAdapter {
//   private canvas?: HTMLCanvasElement;
//   private context?: CanvasRenderingContext2D;
//   private isDrawing = false;

//   setCanvas(canvas: HTMLCanvasElement) {
//     this.canvas = canvas;
//   }

//   async init(): Promise<void> {
//     if (!this.canvas) throw new Error('Canvas não atribuído');
//     this.context = this.canvas.getContext('2d')!;

//     this.canvas.addEventListener('touchstart', this.handleStart);
//     this.canvas.addEventListener('touchmove', this.handleMove);
//     this.canvas.addEventListener('touchend', this.handleEnd);
//   }

//   private handleStart = (e: TouchEvent) => {
//     if (!this.context) return;
//     this.isDrawing = true;
//     const touch = e.touches[0];
//     const rect = this.canvas!.getBoundingClientRect();
//     this.context.beginPath();
//     this.context.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
//   };

//   private handleMove = (e: TouchEvent) => {
//     if (!this.isDrawing || !this.context) return;
//     const touch = e.touches[0];
//     const rect = this.canvas!.getBoundingClientRect();
//     this.context.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
//     this.context.stroke();
//   };

//   private handleEnd = () => {
//     this.isDrawing = false;
//   };

//   async capture(): Promise<string> {
//     return this.canvas?.toDataURL('image/png') ?? '';
//   }

//   clear(): void {
//     this.context?.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
//   }

//   destroy(): void {
//     if (!this.canvas) return;
//     this.canvas.removeEventListener('touchstart', this.handleStart);
//     this.canvas.removeEventListener('touchmove', this.handleMove);
//     this.canvas.removeEventListener('touchend', this.handleEnd);
//   }
// }
