// Premium skeleton loading components
import type { CSSProperties } from "react";

interface SkeletonProps {
	className?: string;
	style?: CSSProperties;
}

// Category card skeleton
export function CategoryCardSkeleton({ className = "", style }: SkeletonProps) {
	return (
		<div className={`bg-white rounded-2xl p-3 shadow-lg shadow-purple-100/50 ${className}`} style={style}>
			<div className="relative">
				{/* Icon skeleton */}
				<div className="w-full h-20 rounded-xl skeleton skeleton-shine mb-2" />
				{/* Title skeleton */}
				<div className="h-3 w-3/4 mx-auto rounded-full skeleton" />
			</div>
		</div>
	);
}

// Candidate card skeleton
export function CandidateCardSkeleton({ className = "", style }: SkeletonProps) {
	return (
		<div className={`bg-white rounded-3xl shadow-lg shadow-purple-100/50 overflow-hidden p-4 ${className}`} style={style}>
			{/* Image skeleton */}
			<div className="relative w-full aspect-square rounded-2xl skeleton skeleton-shine mb-3">
				{/* Badge skeleton */}
				<div className="absolute top-2 left-2 w-11 h-11 rounded-xl skeleton" />
			</div>
			{/* Name skeleton */}
			<div className="h-4 w-2/3 mx-auto rounded-full skeleton mb-2" />
			{/* Status skeleton */}
			<div className="h-3 w-1/2 mx-auto rounded-full skeleton" />
		</div>
	);
}

// Categories grid skeleton
export function CategoriesGridSkeleton() {
	return (
		<div className="grid grid-cols-2 gap-2.5">
			{[...Array(6)].map((_, i) => (
				<CategoryCardSkeleton 
					key={i} 
					className="animate-card-enter opacity-0"
					style={{ animationDelay: `${i * 0.08}s` }}
				/>
			))}
		</div>
	);
}

// Candidates list skeleton
export function CandidatesListSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-3">
			{[...Array(3)].map((_, i) => (
				<CandidateCardSkeleton 
					key={i} 
					className="animate-card-enter opacity-0"
					style={{ animationDelay: `${i * 0.1}s` }}
				/>
			))}
		</div>
	);
}

// Header skeleton
export function HeaderSkeleton() {
	return (
		<div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-purple-100/40 p-3 mb-5">
			<div className="flex items-center gap-3">
				{/* Back button skeleton */}
				<div className="w-9 h-9 rounded-xl skeleton" />
				{/* Title skeleton */}
				<div className="flex-1">
					<div className="h-2 w-16 rounded-full skeleton mb-2" />
					<div className="h-4 w-32 rounded-full skeleton" />
				</div>
				{/* Dropdown skeleton */}
				<div className="w-24 h-9 rounded-xl skeleton" />
			</div>
		</div>
	);
}

// Full page loading with premium animation
export function PageLoading() {
	return (
		<div className="flex flex-col items-center justify-center py-16 animate-page-enter">
			{/* Animated loader */}
			<div className="relative w-16 h-16 mb-6">
				{/* Outer ring */}
				<div className="absolute inset-0 rounded-full border-4 border-purple-100" />
				{/* Spinning ring */}
				<div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
				{/* Inner pulse */}
				<div className="absolute inset-3 rounded-full bg-purple-100 animate-pulse" />
			</div>
			<p className="text-purple-400 text-sm font-medium animate-pulse">Loading...</p>
		</div>
	);
}

// Inline loading spinner
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
	const sizeClasses = {
		sm: "w-4 h-4 border-2",
		md: "w-6 h-6 border-2",
		lg: "w-8 h-8 border-3",
	};

	return (
		<div className={`${sizeClasses[size]} rounded-full border-purple-200 border-t-purple-600 animate-spin`} />
	);
}
