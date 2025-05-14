import { ISignatureAdapter } from "../core/ISignatureAdapter";

export class TopazExtLiteAdapter implements ISignatureAdapter {
  private canvas?: HTMLCanvasElement;

  async loadWrapper(): Promise<void> {
    if ((window as any).Topaz) return;

    const url = document.documentElement.getAttribute("SigPlusExtLiteWrapperURL");
    if (!url) throw new Error("Wrapper da extensão não encontrado.");

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Erro ao carregar wrapper da extensão."));
      document.body.appendChild(script);
    });
  }

  async init(): Promise<void> {
    await this.loadWrapper();

    this.canvas = document.getElementById("SigImg") as HTMLCanvasElement;
    if (!this.canvas) throw new Error("Canvas não encontrado.");

    await Topaz.GemView.PushCurrentTab();
    await Topaz.Canvas.Sign.SetTabletState(1);
    await Topaz.Canvas.Sign.ClearSign();
  }

  async start(): Promise<void> {
    if (!this.canvas) throw new Error("Canvas não disponível.");
    await Topaz.Canvas.Sign.StartSign(this.canvas);
  }

  async capture(): Promise<string> {
    return `data:image/jpeg;base64,${await Topaz.Canvas.Sign.GetSignatureImage()}`;
  }

  clear(): void {
    Topaz.Canvas.Sign.ClearSign?.();
  }

  destroy(): void {
    const TopazGlobal = (window as any).Topaz;
    const sign = TopazGlobal?.Canvas?.Sign;
    const gem = TopazGlobal?.GemView;

    sign?.StopSign?.();
    sign?.SetTabletState?.(0);
    gem?.RevertCurrentTab?.(1);
  }
}
