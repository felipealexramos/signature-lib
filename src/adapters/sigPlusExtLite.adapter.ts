import { ISignatureAdapter } from '../core/ISignatureAdapter';

type Mode = 'extLite' | 'sigLite' | null;

export class TopazUniversalAdapter implements ISignatureAdapter {
  private mode: Mode = null;
  private signatureImage: string | null = null;
  private signatureData: string | null = null;
  private _resolve?: () => void;
  private _reject?: (err: any) => void;
  private iframeWindow: Window | null = null;

  // Novo: handler para postMessage
  private postMessageHandler = (event: MessageEvent) => {
    // Você pode validar a origem aqui se quiser mais segurança
    if (!event.data || event.data.type !== 'TOPAZ_SIGNATURE_RESULT') return;

    const response = event.data.payload;
    if (response?.isSigned && response.imageData) {
      this.signatureImage = response.imageData;
      this.signatureData = response.sigData || response.signatureData || '';
      this._resolve?.();
    } else {
      this._reject?.(new Error(response?.errorMsg || 'Assinatura não capturada'));
    }
    window.removeEventListener('message', this.postMessageHandler);
  };

  async isReady(): Promise<boolean> {
    // Detecta Extensão no iframe
    const iframe = document.getElementById('signature-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      this.iframeWindow = iframe.contentWindow;
      this.mode = 'extLite';
      return true;
    }
    // Detecta Biblioteca JS
    if ((window as any).Topaz) {
      this.mode = 'sigLite';
      return true;
    }
    // Tenta carregar biblioteca JS se wrapperURL estiver presente
    const wrapperURL = document.documentElement.getAttribute('SigPlusExtLiteWrapperURL');
    if (wrapperURL) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = wrapperURL;
        script.async = true;
        script.onload = () => resolve(true);
        document.body.appendChild(script);
      });
      if ((window as any).Topaz) {
        this.mode = 'sigLite';
        return true;
      }
    }
    return false;
  }

  async startCapture(): Promise<void> {
    if (this.mode === 'extLite') {
      return new Promise<void>((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
        this.signatureImage = null;
        this.signatureData = null;
        window.addEventListener('message', this.postMessageHandler);

        // Envia mensagem para o iframe iniciar a captura
        if (this.iframeWindow) {
          this.iframeWindow.postMessage(
            {
              type: 'TOPAZ_SIGNATURE_REQUEST',
              payload: {
                // Parâmetros de captura, se necessário
                imageFormat: 2,
                imageX: 300,
                imageY: 100,
                penThickness: '2',
                penColor: '#000000',
          encryptionMode: '0',
          encryptionKey: '',
          sigCompressionMode: 1,
          customWindow: false
       }
            },
            '*'
          );
        } else {
          window.removeEventListener('message', this.postMessageHandler);
          reject(new Error('Janela de assinatura não encontrada'));
        }
      });
    } else if (this.mode === 'sigLite') {
      const Topaz = (window as any).Topaz;
      Topaz.SetTabletState(1);
      Topaz.SetJustifyMode(0);
      Topaz.ClearTablet();
      await new Promise((r) => setTimeout(r, 5000));
    } else {
      throw new Error('Nenhum modo de captura disponível');
    }
  }

  async getSignatureImage(): Promise<string> {
    if (this.mode === 'extLite') {
      if (!this.signatureImage) throw new Error('Assinatura não capturada');
      return `data:image/png;base64,${this.signatureImage}`;
    } else if (this.mode === 'sigLite') {
      const Topaz = (window as any).Topaz;
      Topaz.SetImageXSize(500);
      Topaz.SetImageYSize(100);
      Topaz.SetImagePenWidth(3);
      Topaz.SetImageFileFormat(1); // PNG
      const base64 = Topaz.GetSigImageB64();
      if (!base64) throw new Error('Assinatura não capturada');
      return `data:image/png;base64,${base64}`;
    }
    throw new Error('Modo de captura não inicializado');
  }

  async getSignatureData(): Promise<string> {
    if (this.mode === 'extLite') {
      return this.signatureData || '';
    } else if (this.mode === 'sigLite') {
      const Topaz = (window as any).Topaz;
      const sigData = Topaz.GetSigString();
      if (!sigData) throw new Error('Dados da assinatura não disponíveis');
      return sigData;
    }
    throw new Error('Modo de captura não inicializado');
  }

  async completeCapture(): Promise<void> {
    if (this.mode === 'sigLite') {
      const Topaz = (window as any).Topaz;
      Topaz.SetTabletState(0);
    }
    // No modo extLite não é necessário finalizar explicitamente
  }
}