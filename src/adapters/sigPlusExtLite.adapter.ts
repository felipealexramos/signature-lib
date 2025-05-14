import { ISignatureAdapter } from "../core/ISignatureAdapter";

export class TopazExtLiteAdapter implements ISignatureAdapter {
  private wrapperLoaded = false;

  private async loadWrapper(): Promise<void> {
    if ((window as any).Topaz) return;

    const url = document.documentElement.getAttribute("SigPlusExtLiteWrapperURL");
    if (!url) throw new Error("Wrapper da extensão não encontrado.");

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Erro ao carregar o wrapper da extensão."));
      document.body.appendChild(script);
    });
  }

  async init(): Promise<void> {
    await this.loadWrapper();

    const status = await Topaz.Global.GetDeviceStatus();
    if (status !== 2) {
      throw new Error("Dispositivo GemView não detectado.");
    }

    // Configuração da janela
    const custom = Topaz.SignatureCaptureWindow.CustomWindow;
    custom.SetSigningWindowState(0); // Normal
    custom.SetSigningWindowSize(785, 340); // Ajuste para GemView 7
    custom.SetSigningWindowLocation(0, 0); // posição
    custom.SetSigningAreaSize(785, 240);
    custom.SetSigningAreaDock(0); // None
    custom.Save();
  }

  async start(): Promise<void> {
    // Mostra janela de assinatura
    await Topaz.SignatureCaptureWindow.Sign.StartSign(false);
  }

  async capture(): Promise<string> {
    const isSigned = await Topaz.SignatureCaptureWindow.Sign.IsSigned();
    if (!isSigned) {
      throw new Error("Nenhuma assinatura capturada.");
    }

    const base64 = await Topaz.SignatureCaptureWindow.Sign.GetSignatureImage();
    await Topaz.SignatureCaptureWindow.Sign.SignComplete();

    return `data:image/jpeg;base64,${base64}`;
  }

  clear(): void {
    // Nada a fazer aqui, pois a janela nativa tem o botão “Clear”
  }

  destroy(): void {
    // Não há recursos a destruir neste modo
  }
}