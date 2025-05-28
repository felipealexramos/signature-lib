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
    let waited = 0;
    while (!(window as any).Topaz && waited < 3000) {
      await new Promise((r) => setTimeout(r, 100));
      waited += 100;
    }

    if ((window as any).Topaz) {
      this.mode = 'sigLite';
      return true;
    }

    return false;
  }

  async startCapture(): Promise<void> {
    if (this.mode !== 'sigLite') throw new Error('Modo não suportado');

    return new Promise((resolve, reject) => {
      this.signatureImage = null;
      this.signatureData = null;

      const onResponse = (event: any) => {
        const str = event.target.getAttribute("msgAttribute") || event.target.getAttribute("msg-Attribute");
        if (!str) return;

        try {
          const data = JSON.parse(str);
          if (data?.isSigned) {
            this.signatureImage = data.imgData || '';
            this.signatureData = data.sigData || data.signatureData || '';
            resolve();
          } else {
            reject(new Error(data.errorMsg || 'Assinatura cancelada'));
          }
        } catch (err) {
          reject(err);
        }

        document.removeEventListener('SignResponse', onResponse);
      };

      document.addEventListener('SignResponse', onResponse);

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
      const el = document.createElement("MyExtensionDataElement");
      el.setAttribute("messageAttribute", messageData);
      document.documentElement.appendChild(el);

      const evt = document.createEvent("Events");
      evt.initEvent("SignStartEvent", true, false);
      el.dispatchEvent(evt);
    });
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