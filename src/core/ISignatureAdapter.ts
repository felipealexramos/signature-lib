export interface ISignatureAdapter {
  init(): Promise<void>;
  capture(): Promise<string>; // Base64 string
  clear(): void;
}