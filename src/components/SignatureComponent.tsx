import { useEffect, useState } from 'react';
import { ISignatureAdapter } from '../core/ISignatureAdapter';
import { SignaturePreview } from './SignaturePreview';

interface SignatureComponentProps {
  adapter: ISignatureAdapter;
  onCapture?: (base64: string) => void;
}

export const SignatureComponent: React.FC<SignatureComponentProps> = ({ adapter, onCapture }) => {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [sigData, setSigData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkReady = async () => {
      try {
        const isAvailable = await adapter.isReady();
        setReady(isAvailable);
        if (!isAvailable) setError('Dispositivo não está pronto.');
      } catch (err) {
        setError('Erro ao verificar disponibilidade do dispositivo.');
      }
    };
    checkReady();
  }, [adapter]);

  const handleCapture = async () => {
    try {
      setError(null);
      setLoading(true);
      await adapter.startCapture();
      await new Promise((r) => setTimeout(r, 3000)); // simula tempo de captura
      const image = await adapter.getSignatureImage();
      const data = await adapter.getSignatureData();
      await adapter.completeCapture();

      setImage(image);
      setSigData(data);
      onCapture?.(image);
    } catch (err: any) {
      setError(err.message || 'Erro na captura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Assinatura Digital</h2>

      {!ready && <p>Inicializando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleCapture} disabled={!ready || loading}>
        {loading ? 'Capturando...' : 'Capturar Assinatura'}
      </button>

      {loading && (
        <div style={{ marginTop: 12 }}>
          <span role="status">⏳ Aguardando assinatura...</span>
        </div>
      )}

      {image && <SignaturePreview image={image} sigData={sigData ?? undefined} />}
    </div>
  );
};
