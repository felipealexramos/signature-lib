import { useEffect, useRef, useState } from 'react';
import { ISignatureAdapter } from '../core/ISignatureAdapter';
import { CanvasSignatureAdapter } from '../adapters/canvas.adapter';
import { TopazExtLiteAdapter } from '../adapters/sigPlusExtLite.adapter';

interface SignatureComponentProps {
  adapter: ISignatureAdapter;
  onCapture?: (base64: string) => void;
}

export function SignatureComponent({ adapter, onCapture }: SignatureComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigAreaRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Inicializando...');

  useEffect(() => {
    if (adapter instanceof CanvasSignatureAdapter && canvasRef.current) {
      adapter.setCanvas(canvasRef.current);
    }

    adapter
      .init()
      .then(() => setStatus('Pronto para assinar'))
      .catch((err) => setStatus(`Erro: ${err.message || err}`));

    return () => adapter.destroy?.();
  }, [adapter]);

  const handleStartSign = async () => {
    if ('StartSign' in adapter && typeof adapter['start'] === 'function') {
      await adapter['start'](); // chama o método extra
      setStatus('Assinatura ativada. Use a caneta.');
    }
  };


  const handleCapture = async () => {
    try {
      const data = await adapter.capture();
      setStatus('Assinatura capturada com sucesso!');
      onCapture?.(data);
    } catch (err: any) {
      setStatus(`Erro na captura: ${err.message || err}`);
    }
  };

  const handleClear = () => {
    adapter.clear();
    setStatus('Assinatura limpa');
  };

  const usesCanvas = adapter instanceof CanvasSignatureAdapter || adapter instanceof TopazExtLiteAdapter;

  return (
    <div>
      <p><strong>Status:</strong> {status}</p>

      <div style={{ position: 'relative' }}>
        {usesCanvas && (
          <canvas
            ref={canvasRef}
            id="SigImg" // mesmo ID usado pela demo oficial
            width={500}
            height={100}
            style={{ border: '1px solid black', background: '#fff' }}
          />
        )}
      </div>

      <button onClick={handleStartSign} style={{ marginRight: '10px' }}>
        Iniciar Assinatura
      </button>


      <div style={{ marginTop: '10px' }}>
        <button onClick={handleClear}>Limpar</button>
        <button onClick={handleCapture} style={{ marginLeft: '10px' }}>
          Salvar Assinatura
        </button>
      </div>
    </div>
  );
}
