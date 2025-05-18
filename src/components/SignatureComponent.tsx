import { useEffect, useState } from 'react';
import { ISignatureAdapter } from '../core/ISignatureAdapter';

interface SignatureComponentProps {
  adapter: ISignatureAdapter;
}

export const SignatureComponent: React.FC<SignatureComponentProps> = ({ adapter }) => {
  const [ready, setReady] = useState(false);
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
      await adapter.startCapture();
      await new Promise((r) => setTimeout(r, 5000)); // simular tempo de captura
      const image = await adapter.getSignatureImage();
      const data = await adapter.getSignatureData();
      await adapter.completeCapture();

      setImage(image);
      setSigData(data);
    } catch (err: any) {
      setError(err.message || 'Erro na captura.');
    }
  };

  return (
    <div>
      <h2>Assinatura Digital</h2>
      {!ready && <p>Inicializando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleCapture} disabled={!ready}>
        Capturar Assinatura
      </button>

      {image && (
        <div>
          <h4>Assinatura:</h4>
          <img src={`data:image/jpeg;base64,${image}`} alt="Assinatura" />
          <textarea rows={3} value={sigData || ''} readOnly style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
};
