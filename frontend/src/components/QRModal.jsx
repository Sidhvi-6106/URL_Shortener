const QRModal = ({
  qrCode,
  onClose,
}) => {
  if (!qrCode) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-zinc-900 p-8 rounded-2xl">

        <img
          src={qrCode}
          alt="QR Code"
          className="w-64 h-64"
        />



        <button
          onClick={onClose}
          className="mt-5 w-full bg-white text-black py-3 rounded-xl"
        >
          Close
        </button>

      </div>

    </div>
  );
};

export default QRModal;