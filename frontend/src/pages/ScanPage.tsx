import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { ScanBarcode, Camera, Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import { useCart } from "@/contexts/CartContext";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ScanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [manualEntry, setManualEntry] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const selectedDeviceIdRef = useRef<string | null>(null);
  const { addToCart } = useCart();
  const [isScanned, setIsScanned] = useState(false);
  // Simulate scanning a barcode
  useEffect(() => {
    // if (scanning) {
      // codeReaderRef.current = new BrowserMultiFormatReader();
      // const timer = setTimeout(() => {
      //   // Simulate finding a product
      //   // const randomProduct = productDatabase[Math.floor(Math.random() * productDatabase.length)];
      //   // setProduct(randomProduct);
      //   setScanning(false);
      // }, 23000);
      return () => {
        stopScanning();
        codeReaderRef.current = null;
        // clearTimeout(timer);
      };
    // }
  }, []);

  const startScanning = () => {
    setScanning(true);
    startScanner();
    // setProduct(null);
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barcode) {
      toast({
        title: "Error",
        description: "Please enter a barcode number",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/products/products/barcode/${barcode}/`);
      setProduct(response.data);
      setBarcode("")
      toast({
        title: "Product found",
        description: `Found ${response.data.name}`,
      });
      
    } catch (error) {
      toast({
        title: "Product not found",
        description: "No product matches that barcode",
        variant: "destructive",
      });
    }
  };

  const addCart = () => {
    // In a real app, this would actually add to cart state/storage
    addToCart(product.id, quantity)
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} added to your cart`,
    });

    setProduct(null);
    setQuantity(1);
  };

  const handleScan = async (scannedBarcode: string) => {
    setBarcode(scannedBarcode);
    const response = await axios.get(`${BASE_URL}/products/products/barcode/${scannedBarcode}/`);
    setProduct(response.data)
    setQuantity(1);
    setBarcode(null);
  };

  const startScanner = async () => {
    if (!videoRef.current || !codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }

      const devices = await codeReaderRef.current.listVideoInputDevices();
      if (devices.length === 0) {
        alert("No camera found");
        return;
      }
      await codeReaderRef.current.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          handleScan(result.getText());
          stopScanning();
        }
        if (error && !(error instanceof Error)) {
          console.error(error);
        }
      });
      setScanning(true);

  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };
  

  return (
    <div className="pb-20 min-h-screen bg-paymall-light">
      <Header title="Scan Product" showBack={true} />

      <main className="max-w-md mx-auto px-4">
        <div className="mt-6">
          {!product && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                {!manualEntry ? (
                  <div className="aspect-video bg-gray-900 relative">
                    {scanning ? (
                      <>
                        <div className="flex flex-col items-center w-full h-[25rem] place-content-center">
                          <div className="w-full max-w-xs aspect-square relative border-2 border-primary rounded-lg overflow-hidden bg-black/5 mb-6">
                            <video
                              ref={videoRef}
                              className="absolute inset-0 w-full h-full object-cover"
                              playsInline
                            />

                            {scanning && (
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

                        <div className="w-full max-w-xs mx-auto pb-16">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {setManualEntry(true);stopScanning();}}
                          >
                            Enter barcode manually
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center py-10 text-white">
                        <ScanBarcode size={64} className="mb-4 opacity-70" />
                        <h2 className="text-xl font-medium">Scan Barcode</h2>
                        <p className="text-sm opacity-70 mt-2 text-center max-w-xs">
                          Position the barcode within the frame to scan
                        </p>
                        <Button
                          onClick={startScanning}
                          className="mt-6 bg-paymall-primary hover:bg-paymall-primary/90"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Start Scanning
                        </Button>
                        <button
                          className="mt-4 text-sm underline"
                          onClick={() => setManualEntry(true)}
                        >
                          Enter barcode manually
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6">
                    <h2 className="text-lg font-medium mb-4">Enter Barcode</h2>

                    <form onSubmit={handleManualSearch}>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter barcode number"
                          value={barcode || ""}
                          onChange={(e) => setBarcode(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit">Search</Button>
                      </div>

                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          className="text-sm text-paymall-primary"
                          onClick={() => setManualEntry(false)}
                        >
                          Use Camera Instead
                        </button>
                      </div>

                      <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                        <p>Hint: For demo, try these barcodes:</p>
                        <ul className="mt-2 space-y-1 list-disc pl-5">
                          <li>9788175257665</li>
                          <li>8901057310050</li>
                          <li>123456789012</li>
                        </ul>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {product && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white rounded-xl shadow-medium p-4 mt-4"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">Product Details</h3>
                  <button
                    onClick={() => {setProduct(null); setBarcode(null); if (!manualEntry) {startScanning();}}}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex gap-4 mt-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                    <div className="mt-2 font-medium">
                      ₹{product.price}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Quantity</span>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300"
                        disabled={quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-6 text-center">{quantity}</span>

                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={addCart}
                      className="w-full bg-paymall-primary hover:bg-paymall-primary/90"
                    >
                      Add to Cart • ₹{(product.price * quantity)}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Navigation />
    </div>
  );
};

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

export default ScanPage;
