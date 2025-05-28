import { ISignatureAdapter } from '../core/ISignatureAdapter';

export class TopazUniversalAdapter implements ISignatureAdapter {
  private signatureImage: string | null = null;
  private signatureData: string | null = null;

  async isReady(): Promise<boolean> {
    let waited = 0;
    while (!(window as any).Topaz && waited < 3000) {
      await new Promise((r) => setTimeout(r, 100));
      waited += 100;
    }

    return !!(window as any).Topaz;
  }

  async startCapture(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.signatureImage = null;
      this.signatureData = null;

      const onResponse = (event: any) => {
        const str =
          event.target.getAttribute("msgAttribute") ||
          event.target.getAttribute("msg-Attribute");
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
    if (!this.signatureImage) throw new Error('Assinatura não capturada');
    return `data:image/png;base64,${this.signatureImage}`;
  }

  async getSignatureData(): Promise<string> {
    if (!this.signatureData) throw new Error('Dados da assinatura não disponíveis');
    return this.signatureData;
  }

  async completeCapture(): Promise<void> {
    const Topaz = (window as any).Topaz;
    if (Topaz) {
      Topaz.SetTabletState(0);
    }
  }
}
