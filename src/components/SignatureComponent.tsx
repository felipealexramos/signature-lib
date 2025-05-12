import { useEffect, useRef } from 'react';
import { ISignatureAdapter } from '../core/ISignatureAdapter';
import { CanvasSignatureAdapter } from '../adapters/canvas.adapter';

interface SignatureComponentProps {
  adapter: ISignatureAdapter;
  onCapture?: (base64: string) => void;
}

export function SignatureComponent({ adapter, onCapture }: SignatureComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (adapter instanceof CanvasSignatureAdapter && canvasRef.current) {
      adapter.setCanvas(canvasRef.current);
    }
    adapter.init();
  }, [adapter]);

  const handleCapture = async () => {
    const data = await adapter.capture();
    onCapture?.(data);
  };

  const handleClear = () => {
    adapter.clear();
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        style={{ border: '1px solid black', background: '#fff' }}
      />
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleClear}>Limpar</button>
        <button onClick={handleCapture} style={{ marginLeft: '10px' }}>
          Salvar Assinatura
        </button>
      </div>
    </div>
  );
}