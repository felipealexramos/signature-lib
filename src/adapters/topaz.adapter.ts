import { ISignatureAdapter } from '../core/ISignatureAdapter';

export class TopazSignatureAdapter implements ISignatureAdapter {
  async init(): Promise<void> {
    if (!window || !window.external) {
      throw new Error('SigWeb não detectado');
    }

    try {
      const sigArea = document.getElementById('sigArea');
      if (!sigArea) throw new Error('Elemento sigArea não encontrado');

      // Inicializa o pad no elemento alvo
      window.external.SetTabletState(1, sigArea);
      window.external.SetJustifyMode(5);
    } catch (e) {
      console.error('Erro ao iniciar SigWeb:', e);
    }
  }

  async capture(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          const sigImage = window.external.GetSigImageB64();
          resolve(`data:image/png;base64,${sigImage}`);
        }, 500);
      } catch (e) {
        reject('Erro ao capturar assinatura Topaz');
      }
    });
  }

  clear(): void {
    try {
      window.external.ClearTablet();
    } catch (err) {
      console.error('Erro ao limpar tablet Topaz:', err);
    }
  }
}