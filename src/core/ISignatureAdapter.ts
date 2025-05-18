export interface ISignatureAdapter {
  isReady(): Promise<boolean>;
  startCapture(): Promise<void>;
  getSignatureImage(): Promise<string>;
  getSignatureData(): Promise<string>;
  completeCapture(): Promise<void>;
}