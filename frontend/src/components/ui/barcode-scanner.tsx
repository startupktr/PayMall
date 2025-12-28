import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrowserMultiFormatReader } from "@zxing/browser";


interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  setManualEntry: Dispatch<SetStateAction<boolean>>;
}

export function BarcodeScanner({ onScan,setManualEntry }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const selectedDeviceIdRef = useRef<string | null>(null);

  const startScanning = async () => {
    if (!videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (devices.length === 0) throw new Error("No cameras found.");

      selectedDeviceIdRef.current = devices[0].deviceId;

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceIdRef.current ? { exact: selectedDeviceIdRef.current } : undefined,
          facingMode: "environment",
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      

      setScanning(true);
      codeReader.decodeFromVideoDevice(selectedDeviceIdRef.current, videoRef.current, (result, err) => {
        if (result) {
          stopScanning();
          onScan(result.getText());
        }
      });
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      // Camera access failed, show manual entry form
      // setShowManualEntry(true);
    }
  };

  const stopScanning = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream | null;
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });


    if (codeReaderRef.current) {
      // window.clearInterval(codeReaderRef.current);
      // codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    
    videoRef.current.srcObject = null;
    setScanning(false);
  };

  useEffect(() => {
    // Start scanning when component mounts
    startScanning();

    // Cleanup when component unmounts
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-[25rem] place-content-center">
      <div className="w-full max-w-xs aspect-square relative border-2 border-primary rounded-lg overflow-hidden bg-black/5 mb-6">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
        />

        {scanning && videoRef.current?.srcObject && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p>Camera preview</p>
            </div>
          </div>
        )}

        {/* Scan line animation */}
        <div className="scanner-line absolute left-0 right-0 h-0.5 bg-primary opacity-75"></div>

        {/* Focus corners */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary"></div>
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary"></div>
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary"></div>
      </div>
    </div>
  );
}

// Add the CSS for the scanner line animation
const style = document.createElement("style");
style.textContent = `
  .scanner-line {
    animation: scan 1.5s linear infinite;
  }
  @keyframes scan {
    0% { top: 0; }
    50% { top: calc(100% - 2px); }
    100% { top: 0; }
  }
`;
document.head.appendChild(style);
