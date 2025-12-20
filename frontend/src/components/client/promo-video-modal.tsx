import { useState, useRef, useEffect } from "react";
import { HiPlay } from "react-icons/hi2";
import ucsmLogo from "../../assets/ucsm.png";

interface PromoVideoModalProps {
	videoUrl: string;
	onClose: () => void;
}

export function PromoVideoModal({ videoUrl, onClose }: PromoVideoModalProps) {
	const [hasStarted, setHasStarted] = useState(false);
	const [countdown, setCountdown] = useState(15);
	const [isMuted, setIsMuted] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);

	// Derive canSkip from countdown
	const canSkip = countdown <= 0;

	// Start countdown timer only after video has started
	useEffect(() => {
		if (!hasStarted || countdown <= 0) return;
		
		const timer = setTimeout(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);
		return () => clearTimeout(timer);
	}, [countdown, hasStarted]);

	// Play video when hasStarted becomes true
	useEffect(() => {
		if (hasStarted && videoRef.current) {
			videoRef.current.muted = false;
			videoRef.current.play().catch(() => {
				// Fallback to muted if still blocked
				if (videoRef.current) {
					videoRef.current.muted = true;
					setIsMuted(true);
					videoRef.current.play();
				}
			});
		}
	}, [hasStarted]);

	// Handle user tap to start
	const handleStart = () => {
		setHasStarted(true);
	};

	// Auto-close when video ends
	const handleVideoEnd = () => {
		onClose();
	};

	// Toggle mute/unmute
	const toggleMute = () => {
		if (videoRef.current) {
			videoRef.current.muted = !videoRef.current.muted;
			setIsMuted(videoRef.current.muted);
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-black">
			{/* Full Screen Video - Always rendered */}
			<video
				ref={videoRef}
				src={videoUrl}
				className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}
				playsInline
				preload="auto"
				onEnded={handleVideoEnd}
			>
				Your browser does not support the video tag.
			</video>

			{/* Splash Screen Overlay - Shows before video starts */}
			{!hasStarted && (
				<div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
					{/* Content */}
					<div className="text-center px-8">
						{/* UCSM Logo */}
						<div className="mb-6">
							<img 
								src={ucsmLogo} 
								alt="UCSM Logo" 
								className="w-28 h-28 mx-auto object-contain drop-shadow-2xl"
							/>
						</div>

						{/* Title */}
						<h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide mb-2">
							FRESHER WELCOME
						</h1>
						
						{/* Subtitle */}
						<p className="text-xl md:text-2xl text-white/70 font-light tracking-widest mb-10">
							2025 - 2026
						</p>

						{/* Play Button */}
						<button
							onClick={handleStart}
							className="group flex items-center gap-3 px-8 py-4 mx-auto bg-white text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
						>
							<HiPlay className="w-6 h-6" />
							<span>Play Video</span>
						</button>
					</div>
				</div>
			)}

			{/* Video Controls - Only show after video starts */}
			{hasStarted && (
				<>
					{/* Gradient overlay at top for button visibility */}
					<div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-black/60 to-transparent pointer-events-none" />
					
					{/* Gradient overlay at bottom for branding visibility */}
					<div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />

					{/* Sound Toggle Button - Bottom Right */}
					<button
						onClick={toggleMute}
						className="absolute bottom-6 right-6 z-10 p-4 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all border border-white/30 active:scale-95"
						aria-label={isMuted ? "Unmute" : "Mute"}
					>
						{isMuted ? (
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
							</svg>
						) : (
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
							</svg>
						)}
					</button>

					{/* Skip Button - Top Right */}
					<div className="absolute top-4 right-4 z-10">
						{canSkip ? (
							<button
								onClick={onClose}
								className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg backdrop-blur-md transition-all border border-white/30 active:scale-95"
							>
								<span>Skip</span>
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
								</svg>
							</button>
						) : (
							<div className="flex items-center gap-3 px-5 py-2.5 bg-black/40 text-white/80 font-medium rounded-lg backdrop-blur-md border border-white/20">
								<div className="relative w-8 h-8">
									<svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
										<circle
											cx="16"
											cy="16"
											r="14"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											className="text-white/20"
										/>
										<circle
											cx="16"
											cy="16"
											r="14"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeDasharray={88}
											strokeDashoffset={88 - (88 * (15 - countdown)) / 15}
											className="text-white transition-all duration-1000 ease-linear"
											strokeLinecap="round"
										/>
									</svg>
									<span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
										{countdown}
									</span>
								</div>
								<span>Skip in {countdown}s</span>
							</div>
						)}
					</div>

					{/* Branding - Bottom Left */}
					<div className="absolute bottom-6 left-6 z-10">
						<p className="text-white/50 text-xs tracking-wider uppercase mb-1">
							UCSM Fresher Welcome
						</p>
						<p className="text-white font-bold text-lg">2025 - 2026</p>
					</div>

					{/* Ad indicator - Top Left */}
					<div className="absolute top-4 left-4 z-10">
						<div className="px-3 py-1.5 bg-black/50 text-white/70 text-xs font-medium rounded backdrop-blur-sm border border-white/10">
							Promo Video
						</div>
					</div>
				</>
			)}
		</div>
	);
}
