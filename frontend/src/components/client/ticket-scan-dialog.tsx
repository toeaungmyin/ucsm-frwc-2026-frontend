import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

// Dialog animation styles
const dialogStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes scanLine {
  0% { top: 20px; }
  50% { top: calc(100% - 20px); }
  100% { top: 20px; }
}
@keyframes borderGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
  50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.5); }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
.animate-slide-up {
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}
.animate-scan-line {
  animation: scanLine 2s ease-in-out infinite;
}
.animate-border-glow {
  animation: borderGlow 2s ease-in-out infinite;
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
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in"
			onClick={handleClose}
		>
			<style>{dialogStyles}</style>
			<div
				className="relative bg-white rounded-[28px] w-full max-w-[360px] shadow-2xl animate-slide-up overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close button - floating */}
				<button
					onClick={handleClose}
					className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/5 text-gray-500 hover:bg-black/10 hover:text-gray-700 transition-all"
				>
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				{/* Content */}
				<div className="p-6 pt-8">
					{/* Error messages */}
					{(authError || scanError) && (
						<div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-2xl">
							<div className="flex items-start gap-3 text-red-600">
								<div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
									<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<p className="text-sm font-medium leading-snug">{authError || scanError}</p>
							</div>
						</div>
					)}

					{/* Scanner view */}
					{isScanning ? (
						<div className="space-y-5">
							{/* Scanner container */}
							<div className="relative rounded-2xl overflow-hidden bg-gray-900 animate-border-glow">
								<div id="qr-reader" ref={containerRef} className="w-full aspect-square" />
								{/* Scan line overlay */}
								<div className="absolute inset-0 pointer-events-none">
									<div className="absolute left-6 right-6 h-0.5 bg-violet-500 animate-scan-line shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
								</div>
								{/* Corner brackets */}
								<div className="absolute inset-0 pointer-events-none">
									<div className="absolute top-4 left-4 w-8 h-8 border-l-3 border-t-3 border-white/60 rounded-tl-lg" />
									<div className="absolute top-4 right-4 w-8 h-8 border-r-3 border-t-3 border-white/60 rounded-tr-lg" />
									<div className="absolute bottom-4 left-4 w-8 h-8 border-l-3 border-b-3 border-white/60 rounded-bl-lg" />
									<div className="absolute bottom-4 right-4 w-8 h-8 border-r-3 border-b-3 border-white/60 rounded-br-lg" />
								</div>
							</div>

							{/* Instructions */}
							<p className="text-center text-sm text-gray-500 font-medium">
								Align the QR code within the frame
							</p>

							{/* Cancel button */}
							<button
								onClick={stopScanner}
								className="w-full py-3.5 px-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98]"
							>
								Cancel Scanning
							</button>
						</div>
					) : (
						<div className="space-y-6">
							{/* Icon and title */}
							<div className="text-center">
								<div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-3xl flex items-center justify-center animate-float">
									<svg
										className="w-10 h-10 text-purple-600"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
										/>
									</svg>
								</div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">Scan Your Ticket</h2>
								<p className="text-gray-500 text-sm leading-relaxed max-w-[260px] mx-auto">
									Use your camera to scan the QR code on your ticket to start voting
								</p>
							</div>

							{/* Scan button */}
							<button
								onClick={startScanner}
								disabled={isAuthenticating}
								className="group w-full py-4 px-5 bg-purple-600 text-white font-semibold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-3"
							>
								{isAuthenticating ? (
									<>
										<svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										<span>Verifying ticket...</span>
									</>
								) : (
									<>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											className="lucide lucide-scan-line-icon lucide-scan-line"
										>
											<path d="M3 7V5a2 2 0 0 1 2-2h2" />
											<path d="M17 3h2a2 2 0 0 1 2 2v2" />
											<path d="M21 17v2a2 2 0 0 1-2 2h-2" />
											<path d="M7 21H5a2 2 0 0 1-2-2v-2" />
											<path d="M7 12h10" />
										</svg>
										<span>Scan QR Code</span>
									</>
								)}
							</button>

							{/* Help text */}
							<p className="text-center text-xs text-gray-400">
								Don't have a ticket?{" "}
								<span className="text-purple-600 font-medium">Contact organizers</span>
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
