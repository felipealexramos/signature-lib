import { ISignatureAdapter } from "../core/ISignatureAdapter";

export class TopazExtLiteAdapter implements ISignatureAdapter {
    async waitForExtension(timeout = 3000): Promise<boolean> {
        const start = Date.now();

        return new Promise((resolve) => {
            const check = () => {
                if (typeof window.external?.SetTabletState === 'function') {
                    resolve(true);
                } else if (Date.now() - start > timeout) {
                    resolve(false);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    async isAvailable(): Promise<boolean> {
        return typeof window.external?.SetTabletState === 'function';
    }

    async init(): Promise<void> {
        const available = await this.isAvailable();
        if (!available) {
            alert('Extensão SigPlusExtLite não está ativa ou autorizada.');
            throw new Error('Topaz SigPlusExtLite não disponível.');
        }

        const sigArea = document.getElementById('sigArea');
        if (!sigArea) throw new Error('Elemento sigArea não encontrado');

        window.external.SetJustifyMode(5);
        window.external.SetTabletState(1, sigArea);
    }

    async capture(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const base64 = window.external.GetSigImageB64();
                resolve(`data:image/png;base64,${base64}`);
            } catch (err) {
                reject('Erro ao capturar assinatura via SigPlusExtLite');
            }
        });
    }

    clear(): void {
        try {
            window.external.ClearTablet();
        } catch (err) {
            console.error('Erro ao limpar tablet:', err);
        }
    }

    destroy(): void {
        try {
            window.external.SetTabletState(0, null);
        } catch (err) {
            console.warn('Erro ao encerrar tablet:', err);
        }
    }
}
