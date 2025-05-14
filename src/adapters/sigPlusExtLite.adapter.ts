import { ISignatureAdapter } from "../core/ISignatureAdapter";

export class TopazExtLiteAdapter implements ISignatureAdapter {
    private wrapperLoaded = false;

    private async waitForTopaz(timeout = 3000): Promise<void> {
        const interval = 100;
        let waited = 0;

        while (!(window as any).Topaz) {
            if (waited >= timeout) throw new Error("Wrapper Topaz não carregado pela extensão.");
            await new Promise((r) => setTimeout(r, interval));
            waited += interval;
        }
    }


    async init(): Promise<void> {
        await this.waitForTopaz();

        await Topaz.Global.Connect();
        const status = await Topaz.Global.GetDeviceStatus();
        if (status !== 2) throw new Error("Dispositivo GemView não detectado.");

        const custom = Topaz.SignatureCaptureWindow.CustomWindow;
        custom.SetSigningWindowState(0);
        custom.SetSigningWindowSize(785, 340);
        custom.SetSigningWindowLocation(0, 0);
        custom.SetSigningAreaSize(785, 240);
        custom.SetSigningAreaDock(0);
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