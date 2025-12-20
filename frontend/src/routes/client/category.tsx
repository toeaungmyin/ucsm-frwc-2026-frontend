import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { rootRoute } from "../__root";
import { clientCandidatesApi, clientCategoriesApi, clientTicketsApi, clientVotesApi } from "../../api/client";
import { CandidateCard, CategoryHeader, BubbleBackground, TicketScanDialog, animationStyles } from "../../components/client";
import { useVoterStore } from "../../stores/voter.store";
import { useToast } from "../../components/ui";

function CategoryDetailPage() {
	const navigate = useNavigate();
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
		navigate({ to: "/" });
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

	// Determine voting state
	const hasVotedInCategory = voteStatus?.hasVoted || ticket?.votedCategories.includes(categoryId) || false;
	const votedCandidateId = voteStatus?.votedCandidateId || null;
	const isVoting = castVote.isPending || cancelVote.isPending;

	// Initial load handled by HTML loader
	if (isLoading) {
		return null;
	}

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
				{/* Header */}
				<CategoryHeader
					categoryName={data?.category?.name}
					categoryId={categoryId}
					categories={categories}
					onBack={handleBack}
					onCategoryChange={handleCategoryChange}
				/>
				
				{/* Authentication prompt banner */}
				{!isAuthenticated && (
					<button
						onClick={() => setShowScanDialog(true)}
						className="w-full mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
					>
						<div className="flex items-center justify-center gap-2 text-amber-700">
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<span className="text-sm font-medium">Scan your ticket to vote</span>
						</div>
					</button>
				)}

				{/* Error State */}
				{error && (
					<div className="text-center py-12">
						<p className="text-purple-600/60 text-sm mb-4">
							Unable to load candidates. Please try again.
						</p>
						<button
							onClick={handleBack}
							className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors"
						>
							Go Back
						</button>
					</div>
				)}

				{/* Candidates Grid */}
				{data && data.candidates.length > 0 && (
					<div className="grid grid-cols-1 gap-3">
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
				{data && data.candidates.length === 0 && (
					<div className="text-center py-12">
						<p className="text-purple-600/60 text-sm mb-1">No candidates available</p>
						<p className="text-purple-400 text-xs">Check back soon</p>
					</div>
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
