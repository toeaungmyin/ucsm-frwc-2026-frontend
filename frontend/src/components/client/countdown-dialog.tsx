import { useState, useEffect, useRef, useCallback } from "react";

// Flip animation styles
const flipStyles = `
@keyframes flipTop {
  0% { transform: rotateX(0deg); }
  100% { transform: rotateX(-90deg); }
}
@keyframes flipBottom {
  0% { transform: rotateX(90deg); }
  100% { transform: rotateX(0deg); }
}
@keyframes bubbleFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(10px, -15px) scale(1.05); }
  50% { transform: translate(-5px, -25px) scale(1.1); }
  75% { transform: translate(-15px, -10px) scale(1.02); }
}
@keyframes bubbleFloatSlow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-12px, 18px) scale(1.08); }
  66% { transform: translate(8px, 8px) scale(0.95); }
}
@keyframes bubblePulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.15); }
}
.flip-card-top {
  animation: flipTop 0.3s ease-in forwards;
  transform-origin: bottom center;
}
.flip-card-bottom {
  animation: flipBottom 0.3s ease-out 0.3s forwards;
  transform-origin: top center;
}
.bubble-float {
  animation: bubbleFloat 6s ease-in-out infinite;
}
.bubble-float-slow {
  animation: bubbleFloatSlow 8s ease-in-out infinite;
}
.bubble-pulse {
  animation: bubblePulse 3s ease-in-out infinite;
}
`;

interface CountdownDialogProps {
	targetTime: string;
	onCountdownEnd: () => void;
	onClose: () => void;
}

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

export function CountdownDialog({ targetTime, onCountdownEnd, onClose }: CountdownDialogProps) {
	const calculateTimeLeft = useCallback((): TimeLeft | null => {
		const target = new Date(targetTime).getTime();
		const now = new Date().getTime();
		const difference = target - now;

		if (difference <= 0) {
			return null;
		}

		return {
			days: Math.floor(difference / (1000 * 60 * 60 * 24)),
			hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
			minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
			seconds: Math.floor((difference % (1000 * 60)) / 1000),
		};
	}, [targetTime]);

	const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft());
	const [isExpired, setIsExpired] = useState(() => calculateTimeLeft() === null);

	useEffect(() => {
		// Update every second
		const timer = setInterval(() => {
			const newTimeLeft = calculateTimeLeft();
			if (newTimeLeft === null) {
				setIsExpired(true);
				onCountdownEnd();
			}
			setTimeLeft(newTimeLeft);
		}, 1000);

		return () => clearInterval(timer);
	}, [calculateTimeLeft, onCountdownEnd]);

	if (isExpired) return null;

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 cursor-pointer"
			onClick={onClose}
		>
			<style>{flipStyles}</style>
			<div 
				className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 w-full max-w-sm shadow-xl shadow-purple-300/30 animate-scale-in overflow-hidden cursor-default"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Extra large animated bubbles */}
				<div className="bubble-float absolute -top-32 -right-24 w-72 h-72 bg-purple-300/60 rounded-full blur-3xl" />
				<div className="bubble-float-slow absolute -bottom-28 -left-20 w-64 h-64 bg-violet-300/55 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
				<div className="bubble-float absolute -top-20 -left-16 w-56 h-56 bg-fuchsia-200/45 rounded-full blur-3xl" style={{ animationDelay: '1.5s' }} />
				<div className="bubble-float-slow absolute -bottom-16 -right-12 w-52 h-52 bg-purple-200/50 rounded-full blur-3xl" style={{ animationDelay: '2.5s' }} />
				
				{/* Large animated bubbles */}
				<div className="bubble-float absolute top-1/4 -right-12 w-40 h-40 bg-fuchsia-300/45 rounded-full blur-2xl" style={{ animationDelay: '2s' }} />
				<div className="bubble-float-slow absolute bottom-1/4 -left-10 w-36 h-36 bg-purple-400/40 rounded-full blur-2xl" style={{ animationDelay: '0.5s' }} />
				
				{/* Medium animated bubbles */}
				<div className="bubble-pulse absolute top-4 left-1/4 w-20 h-20 bg-violet-400/35 rounded-full blur-xl" style={{ animationDelay: '0.3s' }} />
				<div className="bubble-pulse absolute bottom-10 right-1/4 w-16 h-16 bg-purple-400/30 rounded-full blur-xl" style={{ animationDelay: '1.5s' }} />
				
				{/* Small floating dots */}
				<div className="bubble-float absolute top-10 right-10 w-4 h-4 bg-purple-500/60 rounded-full" style={{ animationDelay: '0.2s' }} />
				<div className="bubble-float-slow absolute top-20 right-16 w-3 h-3 bg-violet-500/50 rounded-full" style={{ animationDelay: '0.8s' }} />
				<div className="bubble-float absolute bottom-28 left-14 w-4 h-4 bg-fuchsia-500/50 rounded-full" style={{ animationDelay: '1.2s' }} />
				<div className="bubble-float-slow absolute bottom-16 left-8 w-3 h-3 bg-purple-500/60 rounded-full" style={{ animationDelay: '0.4s' }} />
				<div className="bubble-pulse absolute top-1/2 right-8 w-3 h-3 bg-violet-400/50 rounded-full" style={{ animationDelay: '2.5s' }} />
				<div className="bubble-pulse absolute top-1/3 left-10 w-2.5 h-2.5 bg-fuchsia-400/45 rounded-full" style={{ animationDelay: '1.8s' }} />
				
				{/* Event name */}
				<div className="relative text-center mb-6">
					<h2 className="text-xl font-bold text-purple-900 uppercase tracking-wide">UCSM Fresher Welcome</h2>
					<div className="flex items-center justify-center gap-2 mt-3">
						<div className="h-px w-8 bg-linear-to-r from-transparent to-purple-300" />
						<span className="text-xs font-medium text-purple-500 tracking-widest uppercase">
							2025 - 2026
						</span>
						<div className="h-px w-8 bg-linear-to-l from-transparent to-purple-300" />
					</div>
					<p className="text-sm text-purple-600 mt-3 font-medium">Get ready to celebrate!</p>
					<p className="text-xs text-purple-400 mt-1">Event starts in</p>
				</div>

				{/* Countdown - Calendar Style with Flip Animation */}
				{timeLeft && (
					<div className="relative flex justify-center gap-2 mb-4">
						<CalendarBlock value={timeLeft.days} label="Days" />
						<div className="flex items-center text-purple-400/60 font-bold text-xl pt-4">:</div>
						<CalendarBlock value={timeLeft.hours} label="Hours" />
						<div className="flex items-center text-purple-400/60 font-bold text-xl pt-4">:</div>
						<CalendarBlock value={timeLeft.minutes} label="Mins" />
						<div className="flex items-center text-purple-400/60 font-bold text-xl pt-4">:</div>
						<CalendarBlock value={timeLeft.seconds} label="Secs" />
					</div>
				)}

				{/* Loading state */}
				{!timeLeft && !isExpired && (
					<div className="relative flex justify-center py-4">
						<div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
					</div>
				)}
			</div>
		</div>
	);
}

function CalendarBlock({ value, label }: { value: number; label: string }) {
	const [flip, setFlip] = useState(false);
	const [displayValue, setDisplayValue] = useState(value);
	const [prevValue, setPrevValue] = useState(value);
	const prevValueRef = useRef(value);

	useEffect(() => {
		if (value !== prevValueRef.current) {
			setPrevValue(prevValueRef.current);
			setFlip(true);
			
			// Update display value after top card flips away
			const timer1 = setTimeout(() => {
				setDisplayValue(value);
			}, 300);
			
			// Reset flip state after animation completes
			const timer2 = setTimeout(() => {
				setFlip(false);
				prevValueRef.current = value;
			}, 600);
			
			return () => {
				clearTimeout(timer1);
				clearTimeout(timer2);
			};
		}
	}, [value]);

	const currentDisplay = String(displayValue).padStart(2, "0");
	const prevDisplay = String(prevValue).padStart(2, "0");
	const newDisplay = String(value).padStart(2, "0");

	return (
		<div className="flex flex-col items-center">
			{/* Label - like calendar header */}
			<span className="text-[9px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
				{label}
			</span>
			
			{/* Flip card container */}
			<div className="relative w-14 h-16" style={{ perspective: "200px" }}>
				{/* Static top half - shows new value (revealed as flipping top falls away) */}
				<div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-purple-500 to-purple-600 rounded-t-lg overflow-hidden z-10">
					<div className="absolute inset-0 bg-linear-to-b from-white/15 to-transparent" />
					<div className="absolute inset-0 flex items-end justify-center pb-0">
						<span className="text-2xl font-bold text-white drop-shadow-md font-mono tracking-tight" style={{ transform: "translateY(50%)" }}>
							{flip ? newDisplay : currentDisplay}
						</span>
					</div>
				</div>
				
				{/* Static bottom half - shows current value (old value during flip) */}
				<div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-b from-purple-700 to-purple-800 rounded-b-lg overflow-hidden">
					<div className="absolute inset-0 bg-linear-to-t from-black/15 to-transparent" />
					<div className="absolute inset-0 flex items-start justify-center pt-0">
						<span className="text-2xl font-bold text-white/90 drop-shadow-md font-mono tracking-tight" style={{ transform: "translateY(-50%)" }}>
							{currentDisplay}
						</span>
					</div>
				</div>
				
				{/* Flipping top card - falls down showing old value */}
				{flip && (
					<div 
						className="flip-card-top absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-purple-500 to-purple-600 rounded-t-lg overflow-hidden z-20"
						style={{ backfaceVisibility: "hidden" }}
					>
						<div className="absolute inset-0 bg-linear-to-b from-white/15 to-transparent" />
						<div className="absolute inset-0 flex items-end justify-center pb-0">
							<span className="text-2xl font-bold text-white drop-shadow-md font-mono tracking-tight" style={{ transform: "translateY(50%)" }}>
								{prevDisplay}
							</span>
						</div>
					</div>
				)}
				
				{/* Flipping bottom card - unfolds to show new value */}
				{flip && (
					<div 
						className="flip-card-bottom absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-b from-purple-700 to-purple-800 rounded-b-lg overflow-hidden z-20"
						style={{ backfaceVisibility: "hidden", transform: "rotateX(90deg)" }}
					>
						<div className="absolute inset-0 bg-linear-to-t from-black/15 to-transparent" />
						<div className="absolute inset-0 flex items-start justify-center pt-0">
							<span className="text-2xl font-bold text-white drop-shadow-md font-mono tracking-tight" style={{ transform: "translateY(-50%)" }}>
								{newDisplay}
							</span>
						</div>
					</div>
				)}
				
				{/* Center divider line */}
				<div className="absolute left-0 right-0 top-1/2 h-px bg-purple-900/40 z-30" />
				<div className="absolute left-0 right-0 top-1/2 translate-y-px h-px bg-purple-400/20 z-30" />
				
				{/* Side notches */}
				<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-purple-900/30 rounded-r-full z-30" />
				<div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-purple-900/30 rounded-l-full z-30" />
				
				{/* Glossy reflection on top */}
				<div className="absolute top-0.5 left-1 right-1 h-3 bg-linear-to-b from-white/25 to-transparent rounded-t-md pointer-events-none z-30" />
				
				{/* Shadow under card */}
				<div className="absolute -bottom-1 left-1 right-1 h-2 bg-purple-900/20 rounded-full blur-sm -z-10" />
			</div>
		</div>
	);
}

