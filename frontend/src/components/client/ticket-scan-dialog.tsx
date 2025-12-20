import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

// Dialog animation styles
const dialogStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
.animate-slide-up {
  animation: slideUp 0.4s ease-out forwards;
}
.animate-pulse-slow {
  animation: pulse 2s ease-in-out infinite;
}
`;

interface TicketScanDialogProps {
	onScanSuccess: (ticketId: string) => void;
	onClose: () => void;
	isAuthenticating?: boolean;
	authError?: string | null;
}

// UUID validation helper (outside component to avoid recreation)
const isValidUUID = (str: string): boolean => {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
};

// Extract ticket ID from scanned URL or raw UUID
const extractTicketId = (scannedText: string): string | null => {
	// Try to extract from URL format: base-url?ticket=uuid
	try {
		const url = new URL(scannedText);
		const ticketId = url.searchParams.get("ticket");
		if (ticketId && isValidUUID(ticketId)) {
			return ticketId;
		}
	} catch {
		// Not a valid URL, check if it's a raw UUID
	}

	// Check if it's a raw UUID
	if (isValidUUID(scannedText)) {
		return scannedText;
	}

	return null;
};

export function TicketScanDialog({ onScanSuccess, onClose, isAuthenticating, authError }: TicketScanDialogProps) {
	const [isScanning, setIsScanning] = useState(false);
	const [scanError, setScanError] = useState<string | null>(null);
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Stop scanner
	const stopScanner = useCallback(async () => {
		if (scannerRef.current) {
			try {
				await scannerRef.current.stop();
				scannerRef.current.clear();
			} catch {
				// Ignore errors when stopping
			}
			scannerRef.current = null;
		}
		setIsScanning(false);
	}, []);

	// Start QR scanner
	const startScanner = useCallback(async () => {
		setScanError(null);
		setIsScanning(true);

		// Wait for container to be rendered
		await new Promise((resolve) => setTimeout(resolve, 100));

		if (!containerRef.current) {
			setScanError("Scanner container not found");
			setIsScanning(false);
			return;
		}

		try {
			const scanner = new Html5Qrcode("qr-reader");
			scannerRef.current = scanner;

			await scanner.start(
				{ facingMode: "environment" },
				{
					fps: 10,
					qrbox: { width: 250, height: 250 },
				},
				(decodedText) => {
					const ticketId = extractTicketId(decodedText);
					if (ticketId) {
						stopScanner();
						onScanSuccess(ticketId);
					} else {
						setScanError("Invalid QR code. Please scan your ticket QR code.");
					}
				},
				() => {
					// QR code not found - this is normal, keep scanning
				}
			);
		} catch (err) {
			console.error("Scanner error:", err);
			setScanError("Could not access camera. Please grant camera permission and try again.");
			setIsScanning(false);
		}
	}, [stopScanner, onScanSuccess]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopScanner();
		};
	}, [stopScanner]);

	// Handle close
	const handleClose = useCallback(() => {
		stopScanner();
		onClose();
	}, [stopScanner, onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
			onClick={handleClose}
		>
			<style>{dialogStyles}</style>
			<div
				className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl shadow-purple-500/20 overflow-hidden animate-slide-up"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="bg-linear-to-br from-purple-600 via-purple-700 to-violet-800 px-6 py-5 text-center relative overflow-hidden">
					{/* Decorative elements */}
					<div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
					<div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-400/20 rounded-full blur-xl" />
					
					{/* Close button */}
					<button
						onClick={handleClose}
						className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white/80 hover:bg-white/30 hover:text-white transition-all"
					>
						<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>

					{/* Ticket icon */}
					<div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse-slow">
						<svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
						</svg>
					</div>
					
					<h2 className="text-xl font-bold text-white relative">Scan Your Ticket</h2>
					<p className="text-purple-200 text-sm mt-1 relative">to start voting</p>
				</div>

				{/* Content */}
				<div className="px-6 py-5">
					{/* Error messages */}
					{(authError || scanError) && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
							<div className="flex items-center gap-2 text-red-600">
								<svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
								<p className="text-sm font-medium">{authError || scanError}</p>
							</div>
						</div>
					)}

					{/* Scanner view */}
					{isScanning ? (
						<div className="space-y-4">
							<div
								id="qr-reader"
								ref={containerRef}
								className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-900"
							/>
							<p className="text-center text-sm text-gray-500">
								Point your camera at the QR code on your ticket
							</p>
							<button
								onClick={stopScanner}
								className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
							>
								Cancel
							</button>
						</div>
					) : (
						<div className="space-y-4">
							{/* Instructions */}
							<div className="text-center py-2">
								<div className="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-2xl flex items-center justify-center">
									<svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
									</svg>
								</div>
								<p className="text-gray-600 text-sm leading-relaxed">
									You need to scan your ticket's QR code to authenticate before you can vote.
								</p>
							</div>

							{/* Scan button */}
							<button
								onClick={startScanner}
								disabled={isAuthenticating}
								className="w-full py-4 px-4 bg-linear-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
							>
								{isAuthenticating ? (
									<>
										<svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										<span>Authenticating...</span>
									</>
								) : (
									<>
										<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										<span>Scan Ticket QR Code</span>
									</>
								)}
							</button>

							{/* Help text */}
							<p className="text-center text-xs text-gray-400">
								Don't have a ticket? Contact the event organizers.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

