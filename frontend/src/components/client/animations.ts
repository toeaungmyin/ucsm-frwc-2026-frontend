// Shared animation styles for client pages - Premium Edition
export const animationStyles = `
	/* Base animations */
	@keyframes float {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-20px) rotate(5deg); }
	}
	@keyframes floatSlow {
		0%, 100% { transform: translateY(0px) translateX(0px); }
		33% { transform: translateY(-15px) translateX(10px); }
		66% { transform: translateY(-8px) translateX(-8px); }
	}
	@keyframes shimmer {
		0% { background-position: -200% center; }
		100% { background-position: 200% center; }
	}
	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes scaleIn {
		from { opacity: 0; transform: scale(0.8); }
		to { opacity: 1; transform: scale(1); }
	}
	@keyframes glow {
		0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
		50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
	}
	@keyframes ripple {
		0% { transform: scale(1); opacity: 0.4; }
		100% { transform: scale(2.5); opacity: 0; }
	}

	/* Premium page transitions */
	@keyframes pageEnter {
		from { 
			opacity: 0; 
			transform: translateY(12px);
		}
		to { 
			opacity: 1; 
			transform: translateY(0);
		}
	}
	@keyframes pageExit {
		from { 
			opacity: 1; 
			transform: translateY(0);
		}
		to { 
			opacity: 0; 
			transform: translateY(-8px);
		}
	}
	@keyframes slideInRight {
		from { 
			opacity: 0; 
			transform: translateX(30px);
		}
		to { 
			opacity: 1; 
			transform: translateX(0);
		}
	}
	@keyframes slideOutLeft {
		from { 
			opacity: 1; 
			transform: translateX(0);
		}
		to { 
			opacity: 0; 
			transform: translateX(-30px);
		}
	}

	/* Skeleton loading animations */
	@keyframes skeletonPulse {
		0%, 100% { 
			background-position: 200% center;
		}
		50% { 
			background-position: -200% center;
		}
	}
	@keyframes skeletonShine {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(100%);
		}
	}

	/* Staggered card animations */
	@keyframes cardEnter {
		from { 
			opacity: 0; 
			transform: translateY(24px) scale(0.96);
		}
		to { 
			opacity: 1; 
			transform: translateY(0) scale(1);
		}
	}

	/* Success/Error state animations */
	@keyframes successPop {
		0% { transform: scale(0); opacity: 0; }
		50% { transform: scale(1.1); opacity: 1; }
		70% { transform: scale(0.95); }
		100% { transform: scale(1); opacity: 1; }
	}
	@keyframes errorShake {
		0%, 100% { transform: translateX(0); }
		20% { transform: translateX(-10px); }
		40% { transform: translateX(10px); }
		60% { transform: translateX(-8px); }
		80% { transform: translateX(8px); }
	}
	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}

	/* Micro-interactions */
	@keyframes buttonPress {
		0% { transform: scale(1); }
		50% { transform: scale(0.96); }
		100% { transform: scale(1); }
	}
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	/* Base animation classes */
	.animate-float { animation: float 6s ease-in-out infinite; }
	.animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
	.animate-shimmer { 
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}
	.animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
	.animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }
	.animate-glow { animation: glow 2s ease-in-out infinite; }

	/* Premium transition classes */
	.animate-page-enter { 
		animation: pageEnter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	.animate-page-exit { 
		animation: pageExit 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	.animate-slide-in-right { 
		animation: slideInRight 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	.animate-card-enter {
		animation: cardEnter 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}

	/* Skeleton classes */
	.skeleton {
		background: linear-gradient(
			90deg,
			rgba(139, 92, 246, 0.08) 0%,
			rgba(139, 92, 246, 0.15) 50%,
			rgba(139, 92, 246, 0.08) 100%
		);
		background-size: 200% 100%;
		animation: skeletonPulse 1.8s ease-in-out infinite;
		border-radius: 12px;
	}
	.skeleton-shine {
		position: relative;
		overflow: hidden;
	}
	.skeleton-shine::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.4),
			transparent
		);
		animation: skeletonShine 1.5s ease-in-out infinite;
	}

	/* State animations */
	.animate-success { animation: successPop 0.5s ease-out forwards; }
	.animate-error { animation: errorShake 0.5s ease-out; }
	.animate-bounce { animation: bounce 0.6s ease-in-out; }
	.animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
	.animate-button-press { animation: buttonPress 0.15s ease-out; }

	/* Stagger delays for lists */
	.stagger-1 { animation-delay: 0.05s; }
	.stagger-2 { animation-delay: 0.1s; }
	.stagger-3 { animation-delay: 0.15s; }
	.stagger-4 { animation-delay: 0.2s; }
	.stagger-5 { animation-delay: 0.25s; }
	.stagger-6 { animation-delay: 0.3s; }
	.stagger-7 { animation-delay: 0.35s; }
	.stagger-8 { animation-delay: 0.4s; }
`;

// Bubble background component props
export interface BubbleBackgroundProps {
	variant?: "default" | "minimal";
}
