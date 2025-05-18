import { ISignatureAdapter } from '../core/ISignatureAdapter';

export class SigPlusExtLiteAdapter implements ISignatureAdapter {
  private Topaz: any;

  async isReady(): Promise<boolean> {
    const wrapperURL = document.documentElement.getAttribute('SigPlusExtLiteWrapperURL');
    if (!wrapperURL) return false;

    if (!(window as any).Topaz) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = wrapperURL;
        script.async = true;
        script.onload = () => resolve(true);
        document.body.appendChild(script);
      });
    }

    this.Topaz = (window as any).Topaz;
    const status = await this.Topaz?.Global?.GetDeviceStatus?.();
    return status === 2;
  }

  async startCapture(): Promise<void> {
    const gemView = this.Topaz.GemView;
    const signWindow = this.Topaz.SignatureCaptureWindow.Sign;
    const customWindow = this.Topaz.SignatureCaptureWindow.CustomWindow;

    await gemView.PushCurrentTab();

    await customWindow.SetSigningWindowTitle('Assinatura Digital');
    await customWindow.SetSigningWindowSize(800, 400);
    await customWindow.Save();

    await signWindow.StartSign(false, 1, 0, '');
  }

  async getSignatureImage(): Promise<string> {
    return await this.Topaz.SignatureCaptureWindow.Sign.GetSignatureImage();
  }

  async getSignatureData(): Promise<string> {
    return await this.Topaz.SignatureCaptureWindow.Sign.GetSigString();
  }

  async completeCapture(): Promise<void> {
    await this.Topaz.SignatureCaptureWindow.Sign.SignComplete();
    await this.Topaz.GemView.RevertCurrentTab(1);
  }
}
