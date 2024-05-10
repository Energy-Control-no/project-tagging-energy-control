import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props) => {
    return {
        fps: props.fps,
        qrbox: props.qrbox,
        aspectRatio: props.aspectRatio,
        disableFlip: props.disableFlip !== undefined ? props.disableFlip : false,
    };
};

const Html5QrcodePlugin = (props) => {
    const scannerRef = useRef(null);

    useEffect(() => {
        // Initialize the scanner only if it has not been initialized yet
        if (!scannerRef.current) {
            const config = createConfig(props);
            const verbose = props.verbose === true;

            // Check if qrCodeSuccessCallback is provided
            if (!props.qrCodeSuccessCallback) {
                throw new Error("qrCodeSuccessCallback is required callback.");
            }

            // Instantiate the scanner
            scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
            scannerRef.current.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);
        }

        // Cleanup function to clear the scanner when component unmounts
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner.", error);
                });
                scannerRef.current = null; // Reset the ref post-cleanup
            }
        };
    }, []); // Empty dependency array ensures effect runs only once on mount

    return (
        <div id={qrcodeRegionId} />
    );
};

export default Html5QrcodePlugin;
