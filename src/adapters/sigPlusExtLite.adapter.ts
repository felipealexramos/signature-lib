import { ISignatureAdapter } from '../core/ISignatureAdapter';

type Mode = 'extLite' | 'sigLite' | null;

export class TopazUniversalAdapter implements ISignatureAdapter {
  private mode: Mode = null;
  private signatureImage: string | null = null;
  private signatureData: string | null = null;

  private signResponseHandler = (event: any) => {
    const str = event.target.getAttribute("msgAttribute") || event.target.getAttribute("msg-Attribute");
    const response = JSON.parse(str);
    if (response?.isSigned) {
      this.signatureImage = response.imgData;
      this.signatureData = response.sigData || '';
      this._resolve?.();
    } else {
      this._reject?.(new Error(response.errorMsg || 'Assinatura não capturada'));
    }
  };

  private _resolve?: () => void;
  private _reject?: (err: any) => void;

  async isReady(): Promise<boolean> {
    // Detecta Extensão
    if (document.documentElement.getAttribute('SigPlusExtLiteExtension-installed')) {
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
        top?.document.addEventListener('SignResponse', this.signResponseHandler, { once: true });

        const message = {
          metadata: { version: 1.0, command: 'SignatureCapture' },
          imageFormat: 2,
          imageX: 300,
          imageY: 100,
          imageTransparency: true,
          imageScaling: false,
          maxUpScalePercent: 0,
          rawDataFormat: 'ENC',
          minSigPoints: 25,
          penThickness: '2',
          penColor: '#000000',
          encryptionMode: '0',
          encryptionKey: '',
          sigCompressionMode: 1,
          customWindow: false
        };
        const messageData = JSON.stringify(message);
        const element = document.createElement("MyExtensionDataElement");
        element.setAttribute("messageAttribute", messageData);
        document.documentElement.appendChild(element);

        const evt = document.createEvent("Events");
        evt.initEvent("SignStartEvent", true, false);
        element.dispatchEvent(evt);
      });
    } else if (this.mode === 'sigLite') {
      const Topaz = (window as any).Topaz;
      Topaz.SetTabletState(1);
      Topaz.SetJustifyMode(0);
      Topaz.ClearTablet();
      // Aguarda usuário assinar (pode-se adicionar lógica de timeout se desejar)
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