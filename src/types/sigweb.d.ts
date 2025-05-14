interface External {
  GetSigImageB64(): string;
  ClearTablet(): void;
  SetTabletState(on: number, target: HTMLElement | null): void; 
  SetJustifyMode(mode: number): void;
}

interface Window {
  SetTabletState(state: number, ctxOrTimer?: CanvasRenderingContext2D | any, delay?: number): any;
  GetSigImageB64(callback: (base64: string) => void): void;
  SetJustifyMode?(mode: number): void;
  ClearTablet?(): void;
  Reset?(): void;
  NumberOfTabletPoints?(): number;
}

declare namespace Topaz {
  namespace Canvas {
    namespace Sign {
      function SetTabletState(state: number): Promise<void>;
      function StartSign(canvas: HTMLCanvasElement): Promise<void>;
      function StopSign(): void;
      function SetJustifyMode(mode: number): void;
      function GetSignatureImage(): Promise<string>;
      function ClearSign(): void;
    }
  }
}
