import QRCode from "qrcode";

const generateQRCode = async (url) => {
  try {
    const qr = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      margin: 2,
      scale: 8,
    });

    return qr;
  } catch (error) {
    throw new Error("QR generation failed");
  }
};

export default generateQRCode;
