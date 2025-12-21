import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { rootRoute } from "../__root";
import { clientCandidatesApi, clientCategoriesApi, clientTicketsApi, clientVotesApi } from "../../api/client";
import { 
	CandidateCard, 
	CategoryHeader, 
	BubbleBackground, 
	TicketScanDialog, 
	animationStyles,
	CandidatesListSkeleton,
	HeaderSkeleton,
	ErrorState,
	EmptyState,
} from "../../components/client";
import { useVoterStore } from "../../stores/voter.store";
import { useToast } from "../../components/ui";

function CategoryDetailPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { categoryId } = useParams({ from: "/category/$categoryId" });
	const [showScanDialog, setShowScanDialog] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);
	const { showToast } = useToast();
	
	const { isAuthenticated, setAuth, updateVotedCategories, ticket } = useVoterStore();

	// Ticket authentication mutation
	const authenticateTicket = useMutation({
		mutationFn: clientTicketsApi.authenticate,
		onSuccess: (data) => {
			setAuth(data.token, data.ticket);
			setAuthError(null);
			setShowScanDialog(false);
		},
		onError: (error: Error & { response?: { data?: { message?: string } } }) => {
			setAuthError(error.response?.data?.message || "Invalid ticket. Please try again.");
		},
	});

	// Get vote status for this category
	const { data: voteStatus, refetch: refetchVoteStatus } = useQuery({
		queryKey: ["vote-status", categoryId],
		queryFn: () => clientVotesApi.getVoteStatus(categoryId),
		enabled: isAuthenticated,
	});

	// Helper to handle auth errors (invalid/expired ticket)
	const handleAuthError = useCallback((error: Error & { response?: { status?: number; data?: { message?: string } } }) => {
		if (error.response?.status === 401) {
			// Invalid ticket - logout and show scan dialog
			useVoterStore.getState().logout();
			setShowScanDialog(true);
			showToast("Your ticket session expired. Please scan again.", "warning");
		} else {
			showToast(error.response?.data?.message || "An error occurred. Please try again.", "error");
		}
	}, [showToast]);

	// Cast vote mutation
	const castVote = useMutation({
		mutationFn: (candidateId: string) => clientVotesApi.castVote(candidateId, categoryId),
		onSuccess: (data) => {
			updateVotedCategories(data.votedCategories);
			refetchVoteStatus();
			showToast("Vote cast successfully!", "success");
		},
		onError: handleAuthError,
	});

	// Cancel vote mutation
	const cancelVote = useMutation({
		mutationFn: () => clientVotesApi.cancelVote(categoryId),
		onSuccess: (data) => {
			updateVotedCategories(data.votedCategories);
			refetchVoteStatus();
			showToast("Vote cancelled successfully!", "success");
		},
		onError: handleAuthError,
	});

	const {
		data,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["client-candidates", categoryId],
		queryFn: () => clientCandidatesApi.getByCategoryId(categoryId),
	});

	// Fetch all categories for the dropdown
	const { data: categories } = useQuery({
		queryKey: ["client-categories"],
		queryFn: clientCategoriesApi.getAll,
	});

	const handleBack = () => {
		navigate({ to: "/", search: { ticket: undefined } });
	};

	const handleCategoryChange = (newCategoryId: string) => {
		navigate({ to: `/category/${newCategoryId}` });
	};

	const handleVote = useCallback((candidateId: string) => {
		castVote.mutate(candidateId);
	}, [castVote]);
	
	const handleCancelVote = useCallback(() => {
		cancelVote.mutate();
	}, [cancelVote]);
	
	const handleAuthRequired = useCallback(() => {
		setShowScanDialog(true);
	}, []);
	
	const handleScanSuccess = useCallback((ticketId: string) => {
		setAuthError(null);
		authenticateTicket.mutate(ticketId);
	}, [authenticateTicket]);

	const handleRetry = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["client-candidates", categoryId] });
		refetch();
	}, [queryClient, refetch, categoryId]);

	// Determine voting state
	const hasVotedInCategory = voteStatus?.hasVoted || ticket?.votedCategories.includes(categoryId) || false;
	const votedCandidateId = voteStatus?.votedCandidateId || null;
	const isVoting = castVote.isPending || cancelVote.isPending;

	return (
		<div className="min-h-screen bg-linear-to-br from-white via-purple-100 to-violet-200 relative overflow-hidden flex justify-center">
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
			
			{/* Animated Bubbles Background */}
			<BubbleBackground animated />
			
			{/* Content - Fixed mobile width */}
			<div className="relative z-10 w-full max-w-[430px] px-5 py-4">
				{/* Header - Show skeleton while loading */}
				{isLoading ? (
					<div className="animate-page-enter">
						<HeaderSkeleton />
					</div>
				) : (
					<div className="animate-page-enter">
						<CategoryHeader
							categoryName={data?.category?.name}
							categoryId={categoryId}
							categories={categories}
							onBack={handleBack}
							onCategoryChange={handleCategoryChange}
						/>
					</div>
				)}
				
				{/* Authentication prompt banner */}
				{!isAuthenticated && !isLoading && (
					<button
						onClick={() => setShowScanDialog(true)}
						className="w-full mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all active:scale-[0.98] animate-fade-in-up"
						style={{ animationDelay: '0.1s', opacity: 0 }}
					>
						<div className="flex items-center justify-center gap-2 text-amber-700">
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<span className="text-sm font-medium">Scan your ticket to vote</span>
						</div>
					</button>
				)}

				{/* Loading State - Skeleton */}
				{isLoading && (
					<div className="animate-page-enter">
						<CandidatesListSkeleton />
					</div>
				)}

				{/* Error State */}
				{error && !isLoading && (
					<ErrorState
						title="Unable to load candidates"
						message="We couldn't fetch the candidates for this category. Please try again."
						onRetry={handleRetry}
						onBack={handleBack}
					/>
				)}

				{/* Candidates Grid */}
				{!isLoading && !error && data && data.candidates.length > 0 && (
					<div className="grid grid-cols-1 gap-3 animate-page-enter">
						{data.candidates.map((candidate, index) => (
							<CandidateCard 
								key={candidate.id} 
								candidate={candidate} 
								index={index}
								isAuthenticated={isAuthenticated}
								isVoted={votedCandidateId === candidate.id}
								isVoting={isVoting}
								hasVotedInCategory={hasVotedInCategory}
								onVote={handleVote}
								onCancelVote={handleCancelVote}
								onAuthRequired={handleAuthRequired}
							/>
						))}
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && data && data.candidates.length === 0 && (
					<EmptyState
						title="No candidates yet"
						message="Candidates will appear here once they're added."
						icon={
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
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
								/>
							</svg>
						}
					/>
				)}
			</div>
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => rootRoute,
	path: "/category/$categoryId",
	component: CategoryDetailPage,
});
