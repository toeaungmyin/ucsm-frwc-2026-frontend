// Shared animation styles for client pages
export const animationStyles = `
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
`;

// Bubble background component props
export interface BubbleBackgroundProps {
	variant?: "default" | "minimal";
}

