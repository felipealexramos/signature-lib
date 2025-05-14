import { ISignatureAdapter } from "../core/ISignatureAdapter";

export class TopazExtLiteAdapter implements ISignatureAdapter {
    private canvas?: HTMLCanvasElement;

    async start(): Promise<void> {
        if (!this.canvas) return;
        await Topaz.Canvas.Sign.StartSign(this.canvas);
    }

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
        this.canvas = document.getElementById("SigImg") as HTMLCanvasElement;
        if (!this.canvas) throw new Error("Canvas não encontrado.");

        await Topaz.Canvas.Sign.SetTabletState(1);
        await Topaz.Canvas.Sign.ClearSign();
        // await Topaz.Canvas.Sign.StartSign(this.canvas);
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
        const TopazGlobal = (window as any).Topaz;
        const sign = TopazGlobal?.Canvas?.Sign;

        if (sign?.StopSign) {
            sign.StopSign();
        }

        if (sign?.SetTabletState) {
            sign.SetTabletState(0);
        }
    }
}


