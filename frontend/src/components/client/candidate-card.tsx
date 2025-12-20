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
	50% {
		transform: scale(1.2) rotate(10deg);
		opacity: 1;
	}
	70% {
		transform: scale(0.9) rotate(-5deg);
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
.glass-shimmer {
	animation: shimmer 3s ease-in-out infinite;
}
.heart-burst {
	animation: heartBurst 0.8s ease-out forwards;
}
.heart-pop {
	animation: heartPop 1s ease-out forwards;
}
.heart-break {
	animation: heartBreak 0.8s ease-out forwards;
}
.lock-shake {
	animation: lockShake 0.5s ease-in-out;
}
`;

interface CandidateCardProps {
	candidate: ClientCandidate;
	index: number;
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
	index, 
	isAuthenticated = false, 
	isVoted = false,
	isVoting = false,
	hasVotedInCategory = false,
	onVote, 
	onCancelVote, 
	onAuthRequired 
}: CandidateCardProps) {
	const [showHeart, setShowHeart] = useState(false);
	const [showBrokenHeart, setShowBrokenHeart] = useState(false);
	const [showLockShake, setShowLockShake] = useState(false);
	const lastTapRef = useRef<number>(0);

	const handleDoubleTap = () => {
		// Prevent actions while voting is in progress
		if (isVoting) return;

		const now = Date.now();
		const DOUBLE_TAP_DELAY = 300;

		if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
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
				setTimeout(() => setShowHeart(false), 1000);
				
				if (onVote) {
					onVote(candidate.id);
				}
			}
		}
		
		lastTapRef.current = now;
	};

	return (
		<div
			className="group bg-white rounded-3xl shadow-lg shadow-purple-100/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-200/60 animate-fade-in-up p-4"
			style={{ 
				animationDelay: `${0.1 + index * 0.08}s`,
				opacity: 0,
			}}
		>
			<style>{cardStyles}</style>
			
			{/* Photo Section - Tappable */}
			<div 
				className="relative cursor-pointer select-none"
				onClick={handleDoubleTap}
			>
				{/* Image Container */}
				<div className="relative w-full aspect-square bg-linear-to-br from-purple-100 via-violet-50 to-fuchsia-100 overflow-hidden rounded-2xl">
					{candidate.image ? (
						<img
							src={candidate.image}
							alt={candidate.name}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							draggable={false}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							{/* Decorative bubbles */}
							<div className="absolute top-1/4 right-1/4 w-16 h-16 bg-purple-200/40 rounded-full blur-xl" />
							<div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-violet-200/40 rounded-full blur-xl" />
							<div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-xl">
								<span className="text-4xl font-bold text-white">
									{candidate.name.charAt(0).toUpperCase()}
								</span>
							</div>
						</div>
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
									<path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
								</svg>
							</div>
						</div>
					)}
					
					{/* Bottom gradient overlay */}
					<div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/50 to-transparent rounded-b-2xl" />
					
					{/* Double tap hint */}
					<div className="absolute inset-x-0 bottom-2 flex justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<span className="text-[10px] text-white/80 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
							{!isAuthenticated 
								? '🔒 Scan ticket to vote' 
								: isVoted 
									? 'Double tap to cancel'
									: hasVotedInCategory
										? 'Already voted'
										: 'Double tap to vote'
							}
						</span>
					</div>
				</div>

				{/* Glass Badge - Nominee ID */}
				<div className="absolute top-2 left-2 z-20">
					<div className="relative w-11 h-11 flex items-center justify-center">
						{/* Shadow */}
						<div className="absolute inset-0 rounded-xl bg-purple-900/25 blur-md translate-y-1 scale-95" />
						{/* Glass background */}
						<div className="absolute inset-0 rounded-xl bg-linear-to-br from-purple-500 via-purple-600 to-violet-700 border border-white/30 shadow-lg" />
						{/* Inner highlight */}
						<div className="absolute inset-[2px] rounded-lg bg-linear-to-br from-white/30 via-transparent to-transparent" />
						{/* Shimmer */}
						<div className="absolute inset-0 rounded-xl overflow-hidden">
							<div className="glass-shimmer absolute -inset-full w-[200%] h-[200%] bg-linear-to-r from-transparent via-white/25 to-transparent" />
						</div>
						{/* Number */}
						<span className="relative text-white text-xl font-black drop-shadow-md">
							{candidate.nomineeId}
						</span>
					</div>
				</div>

				{/* Voted indicator */}
				{isVoted && (
					<div className="absolute top-2 right-2 z-20">
						<div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
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
				<p className={`text-xs text-center mt-1 transition-colors ${
					!isAuthenticated 
						? 'text-gray-400' 
						: isVoted 
							? 'text-red-500 font-medium' 
							: hasVotedInCategory
								? 'text-gray-400'
								: 'text-purple-400'
				}`}>
					{isVoting 
						? '⏳ Processing...'
						: !isAuthenticated 
							? '🔒 Scan ticket to vote' 
							: isVoted 
								? '❤️ Voted! (double tap to cancel)' 
								: hasVotedInCategory
									? '— Already voted in this category'
									: 'Double tap to vote'
					}
				</p>
			</div>
		</div>
	);
}
