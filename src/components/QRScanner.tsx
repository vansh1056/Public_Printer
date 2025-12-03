import React, { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setError("");
    setScanning(true);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((d) => d.kind === "videoinput");

      if (cameras.length === 0) {
        setError("No camera found on this device.");
        return;
      }

      let cameraId = cameras[0].deviceId;
      const backCamera = cameras.find((c) =>
        c.label.toLowerCase().includes("back")
      );
      if (backCamera) cameraId = backCamera.deviceId;

      scannerRef.current = new Html5Qrcode("qr-reader");
      await scannerRef.current.start(
        { deviceId: { exact: cameraId } },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        (err) => console.warn("QR scan error:", err)
      );
    } catch (err) {
      console.error("Camera start failed:", err);
      setError(
        "Failed to access camera. Please allow camera permissions and reload the page."
      );
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
      scannerRef.current = null;
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {!scanning ? (
        <button
          onClick={startScanner}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Start QR Scanner
        </button>
      ) : (
        <div id="qr-reader" style={{ width: 300, height: 300 }}></div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default QRScanner;
