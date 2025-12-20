import { createRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HiChartBar, HiRefresh, HiUsers, HiTicket, HiStar, HiBadgeCheck } from "react-icons/hi";
import { Route as dashboardRoute } from "../dashboard";
import {
	dashboardApi,
	type CategoryVoteStats,
	type CandidateVoteStats,
} from "../../api/dashboard.api";

function CandidateRow({ candidate, rank }: { candidate: CandidateVoteStats; rank: number }) {
	const rankColors = {
		1: "bg-yellow-100 text-yellow-700 border-yellow-300",
		2: "bg-gray-100 text-gray-600 border-gray-300",
		3: "bg-amber-100 text-amber-700 border-amber-300",
	};

	return (
		<div
			className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
				candidate.isWinner
					? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm"
					: "bg-white border-gray-200 hover:border-gray-300"
			}`}
		>
			{/* Rank Badge */}
			<div
				className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
					rankColors[rank as keyof typeof rankColors] || "bg-gray-50 text-gray-500 border-gray-200"
				}`}
			>
				{rank}
			</div>

			{/* Candidate Image */}
			<div className="flex-shrink-0">
				{candidate.image ? (
					<img
						src={candidate.image}
						alt={candidate.name}
						className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
					/>
				) : (
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
						<HiUsers className="h-6 w-6 text-gray-400" />
					</div>
				)}
			</div>

			{/* Candidate Info */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<h4 className="font-semibold text-gray-900 truncate">{candidate.name}</h4>
					{candidate.isWinner && (
						<span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
							<HiStar className="h-3 w-3" />
							Leading
						</span>
					)}
				</div>
				<p className="text-sm text-gray-500">ID: {candidate.nomineeId}</p>
			</div>

			{/* Vote Stats */}
			<div className="flex-shrink-0 text-right">
				<p className="text-2xl font-bold text-gray-900">{candidate.voteCount}</p>
				<p className="text-sm text-gray-500">{candidate.percentage}%</p>
			</div>

			{/* Progress Bar */}
			<div className="flex-shrink-0 w-32 hidden sm:block">
				<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
					<div
						className={`h-full rounded-full transition-all duration-500 ${
							candidate.isWinner
								? "bg-gradient-to-r from-yellow-400 to-amber-500"
								: "bg-blue-500"
						}`}
						style={{ width: `${candidate.percentage}%` }}
					/>
				</div>
			</div>
		</div>
	);
}

function CategoryCard({ category }: { category: CategoryVoteStats }) {
	const winner = category.candidates.find((c) => c.isWinner);

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
			{/* Category Header */}
			<div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{category.icon ? (
							<img src={category.icon} alt="" className="w-10 h-10 rounded-lg" />
						) : (
							<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
								<HiChartBar className="h-5 w-5 text-blue-600" />
							</div>
						)}
						<div>
							<h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
							<p className="text-sm text-gray-500">
								{category.totalVotes} total vote{category.totalVotes !== 1 ? "s" : ""}
							</p>
						</div>
					</div>
					{winner && (
						<div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full">
							<HiStar className="h-4 w-4" />
							<span className="text-sm font-medium">{winner.name}</span>
						</div>
					)}
				</div>
			</div>

			{/* Candidates List */}
			<div className="p-4 space-y-3">
				{category.candidates.length === 0 ? (
					<div className="text-center py-8">
						<HiUsers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
						<p className="text-gray-500">No candidates in this category</p>
					</div>
				) : (
					category.candidates.map((candidate, index) => (
						<CandidateRow key={candidate.id} candidate={candidate} rank={index + 1} />
					))
				)}
			</div>
		</div>
	);
}

function VotingStatsPage() {
	const { data, isLoading, isError, refetch, isFetching } = useQuery({
		queryKey: ["voting-statistics"],
		queryFn: async () => {
			const response = await dashboardApi.getVotingStatistics();
			return response.data;
		},
		refetchInterval: 10000, // Refresh every 10 seconds for live updates
	});

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Voting Statistics</h1>
					<p className="text-gray-500 mt-1">Real-time voting results and winner tracking</p>
				</div>
				<button
					onClick={() => refetch()}
					disabled={isFetching}
					className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
				>
					<HiRefresh className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
					Refresh
				</button>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-orange-100 rounded-xl">
							<HiChartBar className="h-6 w-6 text-orange-600" />
						</div>
						<div>
							<p className="text-sm text-gray-500">Total Votes</p>
							{isLoading ? (
								<div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
							) : (
								<p className="text-2xl font-bold text-gray-900">{data?.totalVotes ?? 0}</p>
							)}
						</div>
					</div>
				</div>
				<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-purple-100 rounded-xl">
							<HiTicket className="h-6 w-6 text-purple-600" />
						</div>
						<div>
							<p className="text-sm text-gray-500">Active Voters</p>
							{isLoading ? (
								<div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
							) : (
								<p className="text-2xl font-bold text-gray-900">{data?.totalVoters ?? 0}</p>
							)}
						</div>
					</div>
				</div>
				<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-blue-100 rounded-xl">
							<HiBadgeCheck className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<p className="text-sm text-gray-500">Categories</p>
							{isLoading ? (
								<div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
							) : (
								<p className="text-2xl font-bold text-gray-900">{data?.categories.length ?? 0}</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="space-y-6">
					{[1, 2].map((i) => (
						<div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
								<div className="space-y-2">
									<div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
									<div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
								</div>
							</div>
							<div className="space-y-3">
								{[1, 2, 3].map((j) => (
									<div key={j} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
										<div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
										<div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
										<div className="flex-1 space-y-2">
											<div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
											<div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
										</div>
										<div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Error State */}
			{isError && (
				<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
					<p className="text-red-600 font-medium">Failed to load voting statistics</p>
					<button
						onClick={() => refetch()}
						className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
					>
						Try again
					</button>
				</div>
			)}

			{/* Categories with Voting Stats */}
			{!isLoading && !isError && data && (
				<div className="space-y-6">
					{data.categories.length === 0 ? (
						<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<HiChartBar className="h-8 w-8 text-gray-400" />
							</div>
							<h3 className="text-gray-900 font-medium">No categories yet</h3>
							<p className="text-sm text-gray-500 mt-1">
								Create categories and add candidates to start tracking votes.
							</p>
						</div>
					) : (
						data.categories.map((category) => (
							<CategoryCard key={category.id} category={category} />
						))
					)}
				</div>
			)}

			{/* Live Update Indicator */}
			{!isLoading && !isError && (
				<div className="flex items-center justify-center gap-2 text-sm text-gray-400">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
					</span>
					Live updates every 10 seconds
				</div>
			)}
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => dashboardRoute,
	path: "/voting-stats",
	component: VotingStatsPage,
});

