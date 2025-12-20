interface BubbleBackgroundProps {
	animated?: boolean;
}

export function BubbleBackground({ animated = true }: BubbleBackgroundProps) {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{/* Large floating bubbles */}
			<div 
				className={`absolute -top-20 -left-20 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl ${animated ? 'animate-float' : ''}`} 
			/>
			<div 
				className={`absolute top-1/4 -right-32 w-96 h-96 bg-violet-300/25 rounded-full blur-3xl ${animated ? 'animate-float-slow' : ''}`} 
				style={{ animationDelay: '1s' }} 
			/>
			<div 
				className={`absolute bottom-0 left-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl ${animated ? 'animate-float' : ''}`} 
				style={{ animationDelay: '2s' }} 
			/>
			<div 
				className={`absolute -bottom-20 right-1/3 w-64 h-64 bg-fuchsia-200/25 rounded-full blur-3xl ${animated ? 'animate-float-slow' : ''}`} 
				style={{ animationDelay: '0.5s' }} 
			/>
			
			{/* Rising bubbles */}
			<div 
				className={`absolute bottom-0 left-[10%] w-3 h-3 bg-purple-400/60 rounded-full ${animated ? 'animate-float' : ''}`} 
				style={{ animationDuration: '4s' }} 
			/>
			<div 
				className={`absolute bottom-0 right-[15%] w-5 h-5 bg-violet-400/50 rounded-full ${animated ? 'animate-float' : ''}`} 
				style={{ animationDuration: '5s', animationDelay: '0.5s' }} 
			/>
			<div 
				className={`absolute bottom-0 left-[25%] w-4 h-4 bg-fuchsia-400/50 rounded-full ${animated ? 'animate-float' : ''}`} 
				style={{ animationDuration: '4.5s', animationDelay: '1s' }} 
			/>
			<div 
				className={`absolute bottom-0 right-[30%] w-3 h-3 bg-purple-500/60 rounded-full ${animated ? 'animate-float' : ''}`} 
				style={{ animationDuration: '5.5s', animationDelay: '1.5s' }} 
			/>
			<div 
				className={`absolute bottom-0 left-[40%] w-4 h-4 bg-violet-400/50 rounded-full ${animated ? 'animate-float' : ''}`} 
				style={{ animationDuration: '4.2s', animationDelay: '0.8s' }} 
			/>
			<div 
				className={`absolute bottom-0 right-[45%] w-5 h-5 bg-purple-400/40 rounded-full ${animated ? 'animate-float' : ''}`} 
				style={{ animationDuration: '5.8s', animationDelay: '2s' }} 
			/>
			
			{/* Floating mid-screen bubbles */}
			<div 
				className={`absolute top-1/3 left-[8%] w-6 h-6 bg-purple-400/30 rounded-full shadow-lg shadow-purple-300/20 ${animated ? 'animate-float-slow' : ''}`} 
				style={{ animationDuration: '7s' }} 
			/>
			<div 
				className={`absolute top-1/2 right-[12%] w-8 h-8 bg-violet-400/25 rounded-full shadow-lg shadow-violet-300/20 ${animated ? 'animate-float-slow' : ''}`} 
				style={{ animationDuration: '6s', animationDelay: '0.7s' }} 
			/>
			<div 
				className={`absolute top-2/3 left-[15%] w-5 h-5 bg-fuchsia-400/35 rounded-full ${animated ? 'animate-float' : ''}`} 
				style={{ animationDuration: '5s', animationDelay: '1.2s' }} 
			/>
		</div>
	);
}

