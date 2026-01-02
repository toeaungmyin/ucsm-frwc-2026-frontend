import { useState, useRef } from "react";
import type { ClientCandidate } from "../../api/client";

// Animations
const cardStyles = `
@keyframes shimmer {
	0%, 100% { 
		opacity: 0;
		transform: translateX(-100%) rotate(45deg);
	}
	50% { 
		opacity: 1;
		transform: translateX(100%) rotate(45deg);
	}
}
@keyframes heartBurst {
	0% {
		transform: scale(0);
		opacity: 1;
	}
	50% {
		transform: scale(1.3);
		opacity: 1;
	}
	100% {
		transform: scale(1);
		opacity: 0;
	}
}
@keyframes heartPop {
	0% {
		transform: scale(0) rotate(-15deg);
		opacity: 0;
	}
	40% {
		transform: scale(1.25) rotate(8deg);
		opacity: 1;
	}
	60% {
		transform: scale(0.95) rotate(-3deg);
		opacity: 1;
	}
	80% {
		transform: scale(1.05) rotate(2deg);
		opacity: 1;
	}
	100% {
		transform: scale(1) rotate(0deg);
		opacity: 0;
	}
}
@keyframes heartBreak {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	30% {
		transform: scale(1.1);
		opacity: 1;
	}
	50% {
		transform: scale(0.8);
		opacity: 0.8;
	}
	100% {
		transform: scale(0) rotate(20deg);
		opacity: 0;
	}
}
@keyframes lockShake {
	0%, 100% { transform: translateX(0) rotate(0); }
	20% { transform: translateX(-8px) rotate(-5deg); }
	40% { transform: translateX(8px) rotate(5deg); }
	60% { transform: translateX(-6px) rotate(-3deg); }
	80% { transform: translateX(6px) rotate(3deg); }
}
@keyframes cardPulse {
	0%, 100% { box-shadow: 0 10px 40px -10px rgba(139, 92, 246, 0.3); }
	50% { box-shadow: 0 20px 50px -10px rgba(139, 92, 246, 0.5); }
}
@keyframes votedGlow {
	0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
	50% { box-shadow: 0 0 20px 4px rgba(239, 68, 68, 0.3); }
}
@keyframes rippleEffect {
	0% { transform: scale(0); opacity: 0.5; }
	100% { transform: scale(4); opacity: 0; }
}
.glass-shimmer {
	animation: shimmer 3s ease-in-out infinite;
}
.heart-burst {
	animation: heartBurst 0.8s ease-out forwards;
}
.heart-pop {
	animation: heartPop 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.heart-break {
	animation: heartBreak 0.8s ease-out forwards;
}
.lock-shake {
	animation: lockShake 0.5s ease-in-out;
}
.card-voted {
	animation: votedGlow 2s ease-in-out infinite;
}
`;

interface CandidateCardProps {
	candidate: ClientCandidate;
	isAuthenticated?: boolean;
	isVoted?: boolean;
	isVoting?: boolean;
	hasVotedInCategory?: boolean;
	onVote?: (candidateId: string) => void;
	onCancelVote?: (candidateId: string) => void;
	onAuthRequired?: () => void;
}

export function CandidateCard({
	candidate,
	isAuthenticated = false,
	isVoted = false,
	isVoting = false,
	hasVotedInCategory = false,
	onVote,
	onCancelVote,
	onAuthRequired,
}: CandidateCardProps) {
	const [showHeart, setShowHeart] = useState(false);
	const [showBrokenHeart, setShowBrokenHeart] = useState(false);
	const [showLockShake, setShowLockShake] = useState(false);
	const [ripplePos, setRipplePos] = useState<{ x: number; y: number } | null>(null);
	const [imgLoading, setImgLoading] = useState(true);
	const [imgError, setImgError] = useState(false);
	const lastTapRef = useRef<number>(0);
	const cardRef = useRef<HTMLDivElement>(null);

	const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
		// Prevent actions while voting is in progress
		if (isVoting) return;

		const now = Date.now();
		const DOUBLE_TAP_DELAY = 300;

		if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
			// Get ripple position
			if (cardRef.current) {
				const rect = cardRef.current.getBoundingClientRect();
				const clientX = "touches" in e ? e.touches[0]?.clientX ?? rect.left + rect.width / 2 : e.clientX;
				const clientY = "touches" in e ? e.touches[0]?.clientY ?? rect.top + rect.height / 2 : e.clientY;
				setRipplePos({
					x: clientX - rect.left,
					y: clientY - rect.top,
				});
				setTimeout(() => setRipplePos(null), 600);
			}

			// Double tap detected - check authentication first
			if (!isAuthenticated) {
				// Show lock animation and trigger auth required
				setShowLockShake(true);
				setTimeout(() => setShowLockShake(false), 600);
				if (onAuthRequired) {
					onAuthRequired();
				}
				return;
			}

			// If already voted for this candidate, cancel vote
			if (isVoted) {
				setShowBrokenHeart(true);
				setTimeout(() => setShowBrokenHeart(false), 1000);

				if (onCancelVote) {
					onCancelVote(candidate.id);
				}
			} else if (!hasVotedInCategory) {
				// Only allow voting if hasn't voted in this category yet
				setShowHeart(true);
				setTimeout(() => setShowHeart(false), 1200);

				if (onVote) {
					onVote(candidate.id);
				}
			}
		}

		lastTapRef.current = now;
	};

	return (
		<div
			ref={cardRef}
			className={`group bg-white rounded-3xl shadow-lg shadow-purple-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-200/60 p-4 ${
				isVoted ? "ring-2 ring-red-200" : ""
			}`}
		>
			<style>{cardStyles}</style>

			{/* Photo Section - Tappable */}
			<div className="relative cursor-pointer select-none" onClick={handleDoubleTap}>
				{/* Image Container */}
				<div className="relative w-full aspect-3/4 bg-gradient-to-br from-purple-100 via-violet-50 to-fuchsia-100 overflow-hidden rounded-2xl">
					{candidate.imageUrl && !imgError ? (
						<>
							{/* Loading skeleton */}
							{imgLoading && (
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-full h-full bg-gradient-to-br from-purple-100 via-violet-50 to-fuchsia-100 animate-pulse" />
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-12 h-12 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
									</div>
								</div>
							)}
							<img
								src={candidate.imageUrl}
								alt={candidate.name}
								className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
									imgLoading ? "opacity-0" : "opacity-100"
								}`}
								draggable={false}
								onLoad={() => setImgLoading(false)}
								onError={() => {
									setImgLoading(false);
									setImgError(true);
								}}
							/>
						</>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							{/* Decorative bubbles */}
							<div className="absolute top-1/4 right-1/4 w-16 h-16 bg-purple-200/40 rounded-full blur-xl" />
							<div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-violet-200/40 rounded-full blur-xl" />
							<div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-xl">
								<span className="text-4xl font-bold text-white">
									{candidate.name.charAt(0).toUpperCase()}
								</span>
							</div>
						</div>
					)}

					{/* Ripple effect on double tap */}
					{ripplePos && (
						<div
							className="absolute w-16 h-16 bg-white/40 rounded-full pointer-events-none"
							style={{
								left: ripplePos.x - 32,
								top: ripplePos.y - 32,
								animation: "rippleEffect 0.6s ease-out forwards",
							}}
						/>
					)}

					{/* Double tap heart animation - Vote */}
					{showHeart && (
						<div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-24 h-24 text-red-500 heart-pop drop-shadow-2xl"
							>
								<path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
							</svg>
						</div>
					)}

					{/* Double tap animation - Cancel Vote */}
					{showBrokenHeart && (
						<div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-24 h-24 text-gray-400 heart-break drop-shadow-2xl"
							>
								<path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
							</svg>
						</div>
					)}

					{/* Lock shake animation - Auth required */}
					{showLockShake && (
						<div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
							<div className="w-24 h-24 rounded-full bg-gray-900/60 backdrop-blur-sm flex items-center justify-center lock-shake">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="w-12 h-12 text-white"
								>
									<path
										fillRule="evenodd"
										d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					)}

					{/* Bottom gradient overlay */}
					<div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/50 to-transparent rounded-b-2xl" />

					{/* Double tap hint */}
					<div className="absolute inset-x-0 bottom-2 flex justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<span className="text-[10px] text-white/90 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
							{!isAuthenticated
								? "Scan ticket to vote"
								: isVoted
								? "Tap twice to cancel"
								: hasVotedInCategory
								? "✓ Already voted"
								: "Tap twice to vote"}
						</span>
					</div>
				</div>

				{/* Bubble Badge - Nominee ID */}
				<div className="absolute top-2.5 left-2.5 z-20">
					<div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
						<span className="text-purple-50 text-2xl font-bold">{candidate.nomineeId}</span>
					</div>
				</div>

				{/* Voted indicator */}
				{isVoted && (
					<div className="absolute top-2 right-2 z-20">
						<div className="w-9 h-9 rounded-full bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30 animate-scale-in">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-5 h-5 text-white"
							>
								<path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
							</svg>
						</div>
					</div>
				)}
			</div>

			{/* Info Section */}
			<div className="pt-3">
				{/* Name */}
				<h3 className="text-base font-bold text-gray-800 line-clamp-1 group-hover:text-purple-700 transition-colors text-center">
					{candidate.name}
				</h3>

				{/* Vote status */}
				<p
					className={`text-xs text-center mt-1.5 transition-all ${
						!isAuthenticated
							? "text-gray-400"
							: isVoted
							? "text-red-500 font-semibold"
							: hasVotedInCategory
							? "text-gray-400"
							: "text-purple-400"
					}`}
				>
					{isVoting ? (
						<span className="inline-flex items-center gap-1.5">
							<span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
							Processing...
						</span>
					) : !isAuthenticated ? (
						"Scan ticket to vote"
					) : isVoted ? (
						"You voted for this candidate"
					) : hasVotedInCategory ? (
						"Already voted in this category"
					) : (
						"Double tap photo to vote"
					)}
				</p>
			</div>
		</div>
	);
}
