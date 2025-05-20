import '../styles/signature.css';

interface SignaturePreviewProps {
  image: string;
  sigData?: string;
}

export const SignaturePreview: React.FC<SignaturePreviewProps> = ({ image, sigData }) => {
  return (
    <div className="signature-preview">
      <img
        src={image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`}
        alt="Assinatura"
      />
      {sigData && <textarea style={{width: '100%'}} rows={3} value={sigData} readOnly />}
    </div>
  );
};
