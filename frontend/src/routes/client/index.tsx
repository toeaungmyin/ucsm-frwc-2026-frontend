import { createRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
import { rootRoute } from "../__root";
import { clientCategoriesApi, clientConfigApi, clientTicketsApi, type ClientCategory } from "../../api/client";
import { 
	CountdownDialog, 
	BubbleBackground, 
	TicketScanDialog, 
	PromoVideoModal, 
	animationStyles,
	CategoriesGridSkeleton,
	ErrorState,
	EmptyState,
} from "../../components/client";
import { useVoterStore } from "../../stores/voter.store";
import ucsmLogo from "../../assets/ucsm.png";
import { HiCheckCircle } from "react-icons/hi";

function ClientHomePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const search = useSearch({ from: "/" });
	const ticketParam = (search as { ticket?: string }).ticket;

	const [showCountdown, setShowCountdown] = useState(true);
	// Only show promo video if not seen before (check localStorage)
	const [showPromoVideo, setShowPromoVideo] = useState(() => {
		return !localStorage.getItem("promo-video-seen");
	});
	const [authError, setAuthError] = useState<string | null>(null);
	const hasAttemptedAuth = useRef(false);

	const { isAuthenticated, setAuth, ticket } = useVoterStore();

	// Show scan dialog only when user clicks the scan button (not on page load)
	const [showScanDialog, setShowScanDialog] = useState(false);

	// Ticket authentication mutation
	const authenticateTicket = useMutation({
		mutationFn: clientTicketsApi.authenticate,
		onSuccess: (data) => {
			setAuth(data.token, data.ticket);
			setAuthError(null);
			setShowScanDialog(false);
			// Remove ticket param from URL after successful auth
			navigate({ to: "/", search: { ticket: undefined }, replace: true });
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			setAuthError(error.response?.data?.message || "Invalid ticket. Please check your ticket and try again.");
		},
	});

	// Handle ticket authentication on mount (from URL param)
	useEffect(() => {
		if (ticketParam && !isAuthenticated && !hasAttemptedAuth.current) {
			hasAttemptedAuth.current = true;
			authenticateTicket.mutate(ticketParam);
		}
	}, [ticketParam, isAuthenticated, authenticateTicket]);

	// Handle scan success from dialog
	const handleScanSuccess = useCallback(
		(ticketId: string) => {
			setAuthError(null);
			authenticateTicket.mutate(ticketId);
		},
		[authenticateTicket]
	);

	const {
		data: categories,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["client-categories"],
		queryFn: clientCategoriesApi.getAll,
	});

	const { data: config } = useQuery({
		queryKey: ["client-config"],
		queryFn: clientConfigApi.getConfig,
	});

	const handleCountdownEnd = useCallback(() => {
		setShowCountdown(false);
	}, []);

	const handleRetry = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["client-categories"] });
		refetch();
	}, [queryClient, refetch]);

	// Check if voting is enabled or event has started
	const isVotingEnabled = config?.votingEnabled || config?.isEventStarted;

	// Determine if dialog should be shown
	const shouldShowDialog = config && showCountdown && !isVotingEnabled;

	// Animations should only start after dialog is closed
	const animationsEnabled = !shouldShowDialog;

	// Show skeleton loader while loading (better UX than blank screen)
	const showSkeleton = isLoading || authenticateTicket.isPending;

	return (
		<div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-violet-100 relative overflow-hidden flex justify-center">
			{/* Inject custom animations */}
			<style>{animationStyles}</style>

			{/* Ticket Scan Dialog */}
			{showScanDialog && (
				<TicketScanDialog
					onScanSuccess={handleScanSuccess}
					onClose={() => setShowScanDialog(false)}
					isAuthenticating={authenticateTicket.isPending}
					authError={authError}
				/>
			)}

			{/* Promo Video Modal - Show only on first visit if video exists */}
			{showPromoVideo && config?.promoVideoUrl && (
				<PromoVideoModal
					videoUrl={config.promoVideoUrl}
					onClose={() => {
						localStorage.setItem("promo-video-seen", "true");
						setShowPromoVideo(false);
					}}
				/>
			)}

			{/* Countdown Dialog */}
			{shouldShowDialog && !showPromoVideo && (
				<CountdownDialog
					targetTime={config.eventStartTime}
					onCountdownEnd={handleCountdownEnd}
					onClose={() => setShowCountdown(false)}
				/>
			)}

			{/* Animated Bubbles Background */}
			<BubbleBackground animated={animationsEnabled} />

			{/* Content - Fixed mobile width */}
			<div className="relative z-10 w-full max-w-[430px] px-5 py-4">
				{/* Header with animations */}
				<header className="text-center mb-8">
					{/* Animated Logo */}
					<div
						className={`mb-2 ${animationsEnabled ? "animate-scale-in" : ""}`}
						style={{ opacity: animationsEnabled ? undefined : 1 }}
					>
						<div className="w-20 h-20 mx-auto rounded-full p-2.5 relative">
							<div className="absolute inset-0 rounded-full" />
							<img
								src={ucsmLogo}
								alt="UCSM Logo"
								className="w-full h-full object-contain relative z-10 drop-shadow-lg"
							/>
						</div>
					</div>
					{/* Animated title */}
					<h1
						className={`text-2xl font-bold text-purple-900 mb-3 uppercase ${
							animationsEnabled ? "animate-fade-in-up" : ""
						}`}
						style={{ animationDelay: "0.2s", opacity: animationsEnabled ? 0 : 1 }}
					>
						UCSM Fresher Welcome
					</h1>
					{/* Animated year badge */}
					<div
						className={`flex items-center justify-center gap-3 mb-2 ${
							animationsEnabled ? "animate-fade-in-up" : ""
						}`}
						style={{ animationDelay: "0.4s", opacity: animationsEnabled ? 0 : 1 }}
					>
						<div className="h-1 w-12 bg-gradient-to-r from-transparent to-purple-300" />
						<span className="text-lg font-bold tracking-[0.2em] text-purple-600 relative">
							2025 - 2026
							<span
								className={`absolute inset-0 rounded ${animationsEnabled ? "animate-shimmer" : ""}`}
							/>
						</span>
						<div className="h-1 w-12 bg-gradient-to-l from-transparent to-purple-300" />
					</div>
				</header>

				{/* Ticket Status Bar */}
				<div
					className={`mb-4 ${animationsEnabled ? "animate-fade-in-up" : ""}`}
					style={{ animationDelay: "0.5s", opacity: animationsEnabled ? 0 : 1 }}
				>
					{isAuthenticated && ticket ? (
						<div className="w-full p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg shadow-purple-100/50 border border-purple-100">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<HiCheckCircle className="w-7 h-7 text-emerald-500" />
									<div className="flex flex-col">
										<span className="text-[10px] text-gray-500 uppercase tracking-wide">
											Ticket
										</span>
										<span className="font-bold text-purple-700 text-sm tracking-wider">
											{ticket.serial}
										</span>
									</div>
								</div>
								<button
									onClick={() => setShowScanDialog(true)}
									className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 hover:text-purple-700 transition-all active:scale-95"
									title="Scan another ticket"
								>
									<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
										/>
									</svg>
								</button>
							</div>
						</div>
					) : (
						<button
							onClick={() => setShowScanDialog(true)}
							className="w-full p-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-violet-700 transition-all active:scale-[0.98]"
						>
							<div className="flex items-center justify-center gap-2">
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
									/>
								</svg>
								<span className="font-semibold">Scan Ticket to Vote</span>
							</div>
						</button>
					)}
				</div>

				{/* Loading State - Skeleton */}
				{showSkeleton && (
					<div className="animate-page-enter">
						<CategoriesGridSkeleton />
					</div>
				)}

				{/* Error State */}
				{error && !showSkeleton && (
					<ErrorState
						title="Unable to load categories"
						message="We couldn't fetch the categories. Please check your connection and try again."
						onRetry={handleRetry}
					/>
				)}

				{/* Categories Grid */}
				{!showSkeleton && !error && categories && categories.length > 0 && (
					<div className="grid grid-cols-2 gap-2.5 animate-page-enter">
						{categories.map((category, index) => (
							<CategoryCard
								key={category.id}
								category={category}
								index={index}
								animationsEnabled={animationsEnabled}
							/>
						))}
					</div>
				)}

				{/* Watch Promo Video Button - Only show if video exists */}
				{config?.promoVideoUrl && config.promoVideoUrl.length > 0 && !showPromoVideo && (
					<button
						onClick={() => setShowPromoVideo(true)}
						className={`mt-4 w-full p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-purple-100/50 border border-purple-100 hover:bg-white hover:shadow-lg hover:shadow-purple-200/50 transition-all active:scale-[0.98] ${
							animationsEnabled ? "animate-fade-in-up" : ""
						}`}
						style={{ animationDelay: "0.8s", opacity: animationsEnabled ? 0 : 1 }}
					>
						<div className="flex items-center justify-center gap-2 text-purple-700">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
							<span className="font-semibold text-sm">Watch Promo Video</span>
						</div>
					</button>
				)}

				{/* Empty State */}
				{!showSkeleton && !error && categories && categories.length === 0 && (
					<EmptyState title="No categories available" message="Voting categories will appear here soon." />
				)}

				{/* Footer */}
				<footer className="mt-6 text-center">
					<p className="text-purple-400 text-[10px] tracking-wide">© 2026 UCSM Fresher Welcome Committee</p>
				</footer>
			</div>
		</div>
	);
}

function CategoryCard({
	category,
	index,
	animationsEnabled,
}: {
	category: ClientCategory;
	index: number;
	animationsEnabled: boolean;
}) {
	const navigate = useNavigate();
	const [isPressed, setIsPressed] = useState(false);
	const [imgError, setImgError] = useState(false);

	const handleClick = () => {
		setIsPressed(true);
		// Small delay for visual feedback before navigation
		setTimeout(() => {
			navigate({ to: `/category/${category.id}` });
		}, 100);
	};

	return (
		<button
			onClick={handleClick}
			onTouchStart={() => setIsPressed(true)}
			onTouchEnd={() => setIsPressed(false)}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			onMouseLeave={() => setIsPressed(false)}
			className={`group relative cursor-pointer bg-white rounded-2xl p-3 shadow-lg shadow-purple-100/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-300/40 hover:-translate-y-1 ${
				animationsEnabled ? "animate-card-enter" : ""
			} ${isPressed ? "scale-[0.96]" : ""}`}
			style={{
				animationDelay: `${0.5 + index * 0.08}s`,
				opacity: animationsEnabled ? 0 : 1,
			}}
		>
			{/* Content wrapper */}
			<div className="relative">
				{/* Icon container with gradient background */}
				<div className="relative w-full h-20 rounded-xl bg-gradient-to-br from-purple-100 via-violet-50 to-fuchsia-100 mb-2 flex items-center justify-center overflow-hidden group-hover:from-purple-200 group-hover:via-violet-100 group-hover:to-fuchsia-200 transition-all duration-300">
					{/* Animated decorative circles */}
					<div className="absolute -top-3 -right-3 w-10 h-10 bg-purple-200/50 rounded-full group-hover:scale-150 group-hover:bg-purple-300/60 transition-all duration-500" />
					<div className="absolute -bottom-2 -left-2 w-8 h-8 bg-violet-200/50 rounded-full group-hover:scale-150 group-hover:bg-violet-300/60 transition-all duration-500 delay-75" />
					<div className="absolute top-1/2 -right-1 w-4 h-4 bg-fuchsia-200/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 delay-150" />
					<div className="absolute -top-1 left-1/3 w-3 h-3 bg-purple-300/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-400 delay-200" />

					{/* Icon with hover animation */}
					{category.iconUrl && !imgError ? (
						<img
							src={category.iconUrl}
							alt={category.name}
							className="w-12 h-12 rounded-xl object-cover shadow-md relative z-10 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3 transition-all duration-300"
							onError={() => setImgError(true)}
						/>
					) : (
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md relative z-10 group-hover:scale-110 group-hover:shadow-xl group-hover:from-purple-600 group-hover:to-violet-700 group-hover:rotate-3 transition-all duration-300">
							<span className="text-lg font-bold text-white group-hover:scale-110 transition-transform duration-300">
								{category.name.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
				</div>

				{/* Category Name with hover effect */}
				<h3 className="text-xs font-bold text-gray-800 line-clamp-1 text-center group-hover:text-purple-700 transition-colors duration-200">
					{category.name}
				</h3>
			</div>
		</button>
	);
}

export const Route = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: ClientHomePage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			ticket: typeof search.ticket === 'string' ? search.ticket : undefined,
		};
	},
});
