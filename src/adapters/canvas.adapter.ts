import { ISignatureAdapter } from '../core/ISignatureAdapter';

export class CanvasSignatureAdapter implements ISignatureAdapter {
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async init() {
    if (!this.canvas) throw new Error('Canvas not set');
    this.context = this.canvas.getContext('2d')!;

    this.canvas.onmousedown = (e) => {
      this.context!.beginPath();
      this.context!.moveTo(e.offsetX, e.offsetY);
      this.canvas!.onmousemove = (ev) => {
        this.context!.lineTo(ev.offsetX, ev.offsetY);
        this.context!.stroke();
      };
    };

    this.canvas.onmouseup = () => {
      this.canvas!.onmousemove = null;
    };
  }

  async capture(): Promise<string> {
    return this.canvas?.toDataURL('image/png') ?? '';
  }

  clear(): void {
    this.context?.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
  }
}
