import { ISignatureAdapter } from "../core/ISignatureAdapter";

export class TopazExtLiteAdapter implements ISignatureAdapter {
    private canvas?: HTMLCanvasElement;
    private wrapperLoaded = false;

    async loadWrapper(): Promise<void> {
        if ((window as any).Topaz) {
            console.log('[Topaz] Wrapper já presente.');
            return;
        }

        // Aguarda o Topaz ser definido pela extensão por até 3s
        const waitForTopaz = () => new Promise<void>((resolve, reject) => {
            const timeout = 3000;
            const interval = 100;
            let elapsed = 0;

            const check = () => {
                if ((window as any).Topaz) {
                    resolve();
                } else if (elapsed >= timeout) {
                    reject(new Error('Topaz wrapper não disponível.'));
                } else {
                    elapsed += interval;
                    setTimeout(check, interval);
                }
            };

            check();
        });

        await waitForTopaz();
    }

    async init(): Promise<void> {
        await this.loadWrapper();
        this.canvas = document.getElementById("signature-canvas") as HTMLCanvasElement;
        if (!this.canvas) throw new Error("Canvas não encontrado.");

        await Topaz.Canvas.Sign.SetTabletState(1);
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

