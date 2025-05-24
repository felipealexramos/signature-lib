import { ISignatureAdapter } from '../core/ISignatureAdapter';

// This adapter is for the Topaz SigPlusSigLite signature capture device.
// It uses the Topaz SigPlusSigLite JavaScript library to capture signatures.
// The library must be included in the HTML page as a script tag:
// <script src="https://www.topazsystems.com/Downloads/SigPlusSigLiteWeb.js"></script>
// The library must be loaded before this adapter is used.
// The library must be loaded in the global scope, so it can be accessed as window.Topaz.
// The model that uses this adapter is the T-S460-HSB-R.
declare global {
  interface Window {
    Topaz: any;
  }
}

export class SigPlusSigLiteAdapter implements ISignatureAdapter {
  private isCapturing = false;

  async isReady(): Promise<boolean> {
    try {
      await this.waitForTopaz();
      return true;
    } catch {
      return false;
    }
  }

  async startCapture(): Promise<void> {
    await this.waitForTopaz();
    const sigCtl = window.Topaz;
    sigCtl.SetTabletState(1);
    sigCtl.SetJustifyMode(0);
    sigCtl.ClearTablet();
    this.isCapturing = true;
  }

  async getSignatureImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const sigCtl = window.Topaz;
        sigCtl.SetImageXSize(500);
        sigCtl.SetImageYSize(100);
        sigCtl.SetImagePenWidth(3);
        sigCtl.SetImageFileFormat(1); // PNG
        const base64 = sigCtl.GetSigImageB64();
        if (!base64) reject('Assinatura não capturada');
        else resolve(`data:image/png;base64,${base64}`);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getSignatureData(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const sigCtl = window.Topaz;
        const sigData = sigCtl.GetSigString();
        if (!sigData) reject('Dados da assinatura não disponíveis');
        else resolve(sigData);
      } catch (err) {
        reject(err);
      }
    });
  }

  async completeCapture(): Promise<void> {
    if (this.isCapturing && window.Topaz) {
      window.Topaz.SetTabletState(0);
      this.isCapturing = false;
    }
  }

  private async waitForTopaz(timeout = 3000): Promise<void> {
    const interval = 100;
    let waited = 0;
    while (!window.Topaz) {
      if (waited >= timeout) throw new Error('SigPlusExtLite não carregado');
      await new Promise((r) => setTimeout(r, interval));
      waited += interval;
    }
  }
}
