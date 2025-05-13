import { ISignatureAdapter } from '../core/ISignatureAdapter';

export class TopazSignatureAdapter implements ISignatureAdapter {
  private tmr: any;

  async isAvailable(): Promise<boolean> {
    return typeof window.SetTabletState === 'function' && typeof window.GetSigImageB64 === 'function';
  }

  async init(): Promise<void> {
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas não encontrado');

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Contexto do canvas inválido');

    if (!(await this.isAvailable())) {
      alert('Tablet Topaz indisponível. Verifique se a extensão SigWeb está instalada e autorizada para este site.');
      throw new Error('Tablet Topaz não disponível');
    }

    this.tmr = window.SetTabletState(1, ctx, 50);
    window.SetJustifyMode?.(5);
  }

  async capture(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        window.GetSigImageB64((base64: string) => {
          resolve(`data:image/png;base64,${base64}`);
        });
      } catch (err) {
        reject('Erro ao capturar imagem da assinatura');
      }
    });
  }

  clear(): void {
    try {
      if (typeof window.ClearTablet === 'function') {
        window.ClearTablet();
      }
    } catch (err) {
      console.error('Erro ao limpar tablet:', err);
    }
  }

  destroy(): void {
    if (typeof window.SetTabletState === 'function' && this.tmr) {
      window.SetTabletState(0, this.tmr);
    }
    if (typeof window.Reset === 'function') {
      window.Reset();
    }
  }
}