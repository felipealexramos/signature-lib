interface SignaturePreviewProps {
  image: string;
  sigData?: string;
}

export const SignaturePreview: React.FC<SignaturePreviewProps> = ({ image, sigData }) => {
  return (
    <div style={{ marginTop: 16 }}>
      <h4>Assinatura:</h4>
      <img
        src={image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`}
        alt="Assinatura"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      {sigData && (
        <textarea
          rows={3}
          value={sigData}
          readOnly
          style={{ width: '100%', marginTop: 8 }}
        />
      )}
    </div>
  );
};
