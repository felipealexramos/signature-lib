import { ISignatureAdapter } from "../core/ISignatureAdapter";

export class TopazExtLiteAdapter implements ISignatureAdapter {
    private canvas?: HTMLCanvasElement;
    private wrapperLoaded = false;

    async loadWrapper(): Promise<void> {
        // Se Topaz já está disponível, não recarrega
        if ((window as any).Topaz) {
            console.log('[Topaz] Wrapper já disponível.');
            return;
        }

        const url = document.documentElement.getAttribute("SigPlusExtLiteWrapperURL");
        if (!url) {
            throw new Error("Extensão SigPlusExtLite está ativada, mas o wrapper não foi encontrado.");
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = url;
            script.onload = () => {
                console.log('[Topaz] Wrapper carregado com sucesso.');
                resolve();
            };
            script.onerror = () => reject(new Error("Erro ao carregar o wrapper da extensão Topaz."));
            document.body.appendChild(script);
        });
    }

    async init(): Promise<void> {
        await this.loadWrapper();

        this.canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
        if (!this.canvas) throw new Error("Canvas não encontrado.");

        await Topaz.Canvas.Sign.SetTabletState(1);
        await Topaz.Canvas.Sign.ClearSign(); // ← aqui a correção
        await Topaz.Canvas.Sign.StartSign(this.canvas);
    }

    async capture(): Promise<string> {
        const base64 = await Topaz.Canvas.Sign.GetSignatureImage();
        return `data:image/jpeg;base64,${base64}`;
    }

    clear(): void {
        if (typeof Topaz !== 'undefined') {
            Topaz.Canvas.Sign.ClearSign();
        }
    }


    destroy(): void {
        if (typeof Topaz !== 'undefined') {
            Topaz.Canvas.Sign.StopSign();
            Topaz.Canvas.Sign.SetTabletState(0);
        }
    }
}

