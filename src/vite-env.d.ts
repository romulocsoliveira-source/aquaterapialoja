/// <reference types="vite/client" />

interface PagSeguroEncryptCardParams {
  publicKey: string;
  holder: string;
  number: string;
  expMonth: string;
  expYear: string;
  securityCode: string;
}

interface PagSeguroEncryptCardResult {
  encryptedCard: string;
  hasErrors: boolean;
  errors?: Array<{ code: string; message: string }>;
}

interface PagSeguroSDK {
  encryptCard(params: PagSeguroEncryptCardParams): PagSeguroEncryptCardResult;
}

interface Window {
  PagSeguro: PagSeguroSDK;
}
