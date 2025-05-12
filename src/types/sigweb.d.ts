interface External {
  GetSigImageB64(): string;
  ClearTablet(): void;
}

interface Window {
  external: External;
}
