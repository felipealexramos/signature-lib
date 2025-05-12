import { ISignatureAdapter } from "../core/ISignatureAdapter";

export class TopazSignatureAdapter implements ISignatureAdapter {
  async init(): Promise<void> {
    if (!window || !window.external) {
      throw new Error("SigWeb is not available");
    }
  }

  async capture(): Promise<string> {
    try {
      const imgData = window.external.GetSigImageB64();
      return `data:image/png;base64,${imgData}`;
    } catch (error) {
      throw new Error("Failed to capture signature from Topaz device");
    }
  }

  clear(): void {
    try {
      window.external.ClearTablet();
    } catch (error) {
      console.error("Failed to clear Topaz tablet");
    }
  }
}
