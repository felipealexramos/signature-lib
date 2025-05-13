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
