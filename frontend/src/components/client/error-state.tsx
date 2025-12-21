// Premium error state component

interface ErrorStateProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
	onBack?: () => void;
	className?: string;
}

export function ErrorState({
	title = "Something went wrong",
	message = "We couldn't load the content. Please try again.",
	onRetry,
	onBack,
	className = "",
}: ErrorStateProps) {
	return (
		<div className={`animate-page-enter ${className}`}>
			<div className="flex flex-col items-center justify-center py-12 px-6 text-center">
				{/* Error illustration */}
				<div className="relative w-24 h-24 mb-6">
					{/* Background circle */}
					<div className="absolute inset-0 rounded-full bg-linear-to-br from-red-100 to-orange-50" />
					{/* Icon */}
					<div className="absolute inset-0 flex items-center justify-center">
						<svg 
							className="w-12 h-12 text-red-400" 
							fill="none" 
							viewBox="0 0 24 24" 
							stroke="currentColor"
						>
							<path 
								strokeLinecap="round" 
								strokeLinejoin="round" 
								strokeWidth={1.5} 
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
							/>
						</svg>
					</div>
					{/* Decorative bubbles */}
					<div className="absolute -top-2 -right-2 w-6 h-6 bg-red-200/50 rounded-full animate-float" style={{ animationDuration: '3s' }} />
					<div className="absolute -bottom-1 -left-3 w-4 h-4 bg-orange-200/50 rounded-full animate-float" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
				</div>

				{/* Title */}
				<h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
				
				{/* Message */}
				<p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">{message}</p>

				{/* Actions */}
				<div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
					{onRetry && (
						<button
							onClick={onRetry}
							className="flex-1 py-3 px-5 bg-linear-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							<span>Try Again</span>
						</button>
					)}
					{onBack && (
						<button
							onClick={onBack}
							className="flex-1 py-3 px-5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
						>
							Go Back
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

// Empty state component
interface EmptyStateProps {
	title?: string;
	message?: string;
	icon?: React.ReactNode;
	className?: string;
}

export function EmptyState({
	title = "Nothing here yet",
	message = "Check back soon for updates.",
	icon,
	className = "",
}: EmptyStateProps) {
	return (
		<div className={`animate-page-enter ${className}`}>
			<div className="flex flex-col items-center justify-center py-12 px-6 text-center">
				{/* Icon */}
				<div className="relative w-20 h-20 mb-5">
					<div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-100 to-violet-50" />
					<div className="absolute inset-0 flex items-center justify-center">
						{icon || (
							<svg 
								className="w-10 h-10 text-purple-300" 
								fill="none" 
								viewBox="0 0 24 24" 
								stroke="currentColor"
							>
								<path 
									strokeLinecap="round" 
									strokeLinejoin="round" 
									strokeWidth={1.5} 
									d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
								/>
							</svg>
						)}
					</div>
				</div>

				{/* Title */}
				<h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
				
				{/* Message */}
				<p className="text-sm text-gray-400">{message}</p>
			</div>
		</div>
	);
}

// Network error state
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
	return (
		<ErrorState
			title="Connection Problem"
			message="Please check your internet connection and try again."
			onRetry={onRetry}
		/>
	);
}
