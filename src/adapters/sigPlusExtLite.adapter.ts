import { ISignatureAdapter } from "../core/ISignatureAdapter";

export class TopazExtLiteAdapter implements ISignatureAdapter {
  private canvas?: HTMLCanvasElement;

  async loadWrapper(): Promise<void> {
    if ((window as any).Topaz) {
      console.log('[Topaz] Wrapper já disponível.');
      return;
    }

    const url = document.documentElement.getAttribute("SigPlusExtLiteWrapperURL");
    if (!url) throw new Error("Wrapper da extensão não encontrado.");

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = () => {
        console.log('[Topaz] Wrapper carregado.');
        resolve();
      };
      script.onerror = () => reject(new Error("Erro ao carregar wrapper da extensão."));
      document.body.appendChild(script);
    });
  }

  async init(): Promise<void> {
    await this.loadWrapper();

    const canvasEl = document.getElementById("SigImg") as HTMLCanvasElement;
    if (!canvasEl) throw new Error("Canvas não encontrado.");
    this.canvas = canvasEl;

    const sign = (window as any).Topaz.Canvas.Sign;

    await sign.SetTabletState(1); // ativa a captura
    await sign.ClearSign(); // limpa canvas
    await sign.StartSign(this.canvas); // inicia captura no canvas
  }

  async capture(): Promise<string> {
    const sign = (window as any).Topaz.Canvas.Sign;
    const base64 = await sign.GetSignatureImage();
    return `data:image/jpeg;base64,${base64}`;
  }

  clear(): void {
    const sign = (window as any).Topaz.Canvas.Sign;
    sign.ClearSign?.();
  }

  destroy(): void {
    const sign = (window as any).Topaz.Canvas.Sign;
    sign.StopSign?.();
    sign.SetTabletState?.(0);
  }
}


