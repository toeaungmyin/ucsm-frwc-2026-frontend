import { createRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { HiChartBar, HiRefresh, HiUsers, HiTicket, HiStar, HiBadgeCheck } from "react-icons/hi";
import { Route as dashboardRoute } from "../dashboard";
import { dashboardApi, type CategoryVoteStats, type CandidateVoteStats } from "../../api/dashboard.api";

function CategoryCard({ category }: { category: CategoryVoteStats }) {
	const winner = category.candidates.find((c) => c.isWinner);
	const [iconLoading, setIconLoading] = useState(true);
	const [iconError, setIconError] = useState(false);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
			{/* Category Header */}
			<div className="p-4 border-b border-gray-100 bg-gradient-to-br from-purple-50 via-white to-violet-50">
				<div className="flex items-center gap-3">
					{category.iconUrl && !iconError ? (
						<div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm">
							{iconLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
							<img
								src={category.iconUrl}
								alt=""
								className={`w-full h-full object-cover transition-opacity ${
									iconLoading ? "opacity-0" : "opacity-100"
								}`}
								onLoad={() => setIconLoading(false)}
								onError={() => {
									setIconLoading(false);
									setIconError(true);
								}}
							/>
						</div>
					) : (
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm">
							<span className="text-white font-bold text-lg">{category.name.charAt(0)}</span>
						</div>
					)}
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
						<p className="text-xs text-gray-500">
							{category.totalVotes} vote{category.totalVotes !== 1 ? "s" : ""} •{" "}
							{category.candidates.length} candidate{category.candidates.length !== 1 ? "s" : ""}
						</p>
					</div>
				</div>
				{/* Winner Badge */}
				{winner && (
					<div className="mt-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
						<HiStar className="h-4 w-4 text-yellow-500 flex-shrink-0" />
						<span className="text-sm font-medium text-yellow-700 truncate">Leading: {winner.name}</span>
					</div>
				)}
			</div>

			{/* Candidates List - Compact */}
			<div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
				{category.candidates.length === 0 ? (
					<div className="text-center py-6">
						<HiUsers className="h-10 w-10 text-gray-300 mx-auto mb-2" />
						<p className="text-sm text-gray-500">No candidates</p>
					</div>
				) : (
					category.candidates.map((candidate, index) => (
						<CompactCandidateRow key={candidate.id} candidate={candidate} rank={index + 1} />
					))
				)}
			</div>
		</div>
	);
}

function CompactCandidateRow({ candidate, rank }: { candidate: CandidateVoteStats; rank: number }) {
	const [imgLoading, setImgLoading] = useState(true);
	const [imgError, setImgError] = useState(false);

	return (
		<div
			className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
				candidate.isWinner
					? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
					: "bg-gray-50 border-gray-100 hover:bg-gray-100"
			}`}
		>
			{/* Rank */}
			<div
				className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
					rank === 1
						? "bg-yellow-400 text-yellow-900"
						: rank === 2
						? "bg-gray-300 text-gray-700"
						: rank === 3
						? "bg-amber-300 text-amber-800"
						: "bg-gray-200 text-gray-600"
				}`}
			>
				{rank}
			</div>

			{/* Avatar */}
			{candidate.imageUrl && !imgError ? (
				<div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
					{imgLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
					<img
						src={candidate.imageUrl}
						alt={candidate.name}
						className={`w-full h-full object-cover transition-opacity ${
							imgLoading ? "opacity-0" : "opacity-100"
						}`}
						onLoad={() => setImgLoading(false)}
						onError={() => {
							setImgLoading(false);
							setImgError(true);
						}}
					/>
				</div>
			) : (
				<div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
					<span className="text-purple-600 font-semibold text-xs">{candidate.name.charAt(0)}</span>
				</div>
			)}

			{/* Info */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-gray-900 truncate">{candidate.name}</p>
				<p className="text-xs text-gray-500">#{candidate.nomineeId}</p>
			</div>

			{/* Votes */}
			<div className="flex-shrink-0 text-right">
				<p className="text-sm font-bold text-gray-900">{candidate.voteCount}</p>
				<p className="text-xs text-gray-500">{candidate.percentage}%</p>
			</div>
		</div>
	);
}

const REFRESH_OPTIONS = [
	{ label: "5s", value: 5000 },
	{ label: "10s", value: 10000 },
	{ label: "30s", value: 30000 },
	{ label: "1m", value: 60000 },
	{ label: "Off", value: 0 },
];

function VotingStatsPage() {
	const [refreshInterval, setRefreshInterval] = useState(10000);
	const [countdown, setCountdown] = useState(10);

	const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
		queryKey: ["voting-statistics"],
		queryFn: async () => {
			const response = await dashboardApi.getVotingStatistics();
			return response.data;
		},
		refetchInterval: refreshInterval || false,
	});

	// Countdown timer - uses dataUpdatedAt to calculate remaining time
	useEffect(() => {
		if (refreshInterval === 0) return;

		const updateCountdown = () => {
			const lastUpdate = dataUpdatedAt || Date.now();
			const elapsed = Date.now() - lastUpdate;
			const remaining = Math.max(0, Math.ceil((refreshInterval - elapsed) / 1000));
			setCountdown(remaining);
		};

		// Update every 100ms for smoother countdown
		const timer = setInterval(updateCountdown, 100);

		return () => clearInterval(timer);
	}, [refreshInterval, dataUpdatedAt]);

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Voting Statistics</h1>
					<p className="text-gray-500 mt-1">Real-time voting results and winner tracking</p>
				</div>
				<div className="flex items-center gap-3">
					{/* Live Update Indicator with Countdown */}
					<div className="flex items-center gap-2 text-sm text-gray-500">
						{refreshInterval > 0 ? (
							<>
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
									<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
								</span>
								<span className="hidden sm:inline">{isFetching ? "Updating..." : `${countdown}s`}</span>
								<span className="sm:hidden">{countdown}s</span>
							</>
						) : (
							<>
								<span className="relative flex h-2 w-2">
									<span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400" />
								</span>
								<span className="hidden sm:inline">Paused</span>
							</>
						)}
					</div>
					{/* Refresh Interval Control */}
					<div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
						{REFRESH_OPTIONS.map((option) => (
							<button
								key={option.value}
								onClick={() => setRefreshInterval(option.value)}
								className={`px-3 py-2 text-xs font-medium transition-colors ${
									refreshInterval === option.value
										? "bg-purple-600 text-white"
										: "text-gray-600 hover:bg-gray-50"
								}`}
							>
								{option.label}
							</button>
						))}
					</div>
					{/* Manual Refresh Button */}
					<button
						onClick={() => refetch()}
						disabled={isFetching}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
					>
						<HiRefresh className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
						Refresh
					</button>
				</div>
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
									<div
										key={j}
										className="flex items-center gap-4 p-4 rounded-xl border border-gray-200"
									>
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
				<>
					{data.categories.length === 0 ? (
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<HiChartBar className="h-8 w-8 text-gray-400" />
							</div>
							<h3 className="text-gray-900 font-medium">No categories yet</h3>
							<p className="text-sm text-gray-500 mt-1">
								Create categories and add candidates to start tracking votes.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{data.categories.map((category) => (
								<CategoryCard key={category.id} category={category} />
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => dashboardRoute,
	path: "/voting-stats",
	component: VotingStatsPage,
});

