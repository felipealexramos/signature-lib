interface External {
  GetSigImageB64(): string;
  ClearTablet(): void;
  SetTabletState(on: number, target: HTMLElement): void;
  SetJustifyMode(mode: number): void;
}

interface Window {
  external: External;
}
