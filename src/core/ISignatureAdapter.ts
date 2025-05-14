export interface ISignatureAdapter {
  init(): Promise<void>;
  capture(): Promise<string>; // Base64 string
  clear(): void;
  destroy?(): void;
  isAvailable?(): Promise<boolean>;
  start?(): Promise<void>; // Método extra para iniciar a assinatura
}
