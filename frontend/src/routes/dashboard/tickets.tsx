import { createRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HiTicket, HiRefresh, HiTrash, HiPrinter } from "react-icons/hi";
import { Route as dashboardRoute } from "../dashboard";
import { ticketsApi } from "../../api/tickets.api";
import type { Ticket } from "../../types";
import {
	TicketsDataTable,
	TicketsEmptyState,
	GenerateTicketsDialog,
	DeleteTicketDialog,
	BulkDeleteDialog,
} from "../../components/tickets";

function TicketsPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
	const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
	const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

	// Fetch tickets
	const {
		data: ticketsData,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["tickets"],
		queryFn: ticketsApi.getAll,
	});

	// Generate mutation
	const generateMutation = useMutation({
		mutationFn: (quantity: number) => ticketsApi.generate({ quantity }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tickets"] });
			setIsGenerateModalOpen(false);
		},
	});

	// Delete single ticket mutation
	const deleteMutation = useMutation({
		mutationFn: (serial: string) => ticketsApi.delete(serial),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tickets"] });
			setDeletingTicket(null);
		},
	});

	// Bulk delete mutation
	const bulkDeleteMutation = useMutation({
		mutationFn: () => ticketsApi.deleteAll(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tickets"] });
			setIsBulkDeleteOpen(false);
		},
	});

	const tickets = ticketsData?.data ?? [];

	const handleGenerate = (quantity: number) => {
		generateMutation.mutate(quantity);
	};

	const handleDelete = () => {
		if (!deletingTicket) return;
		deleteMutation.mutate(deletingTicket.serial);
	};

	const handleBulkDelete = () => {
		bulkDeleteMutation.mutate();
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
					<p className="text-gray-500 mt-1">Generate and manage voting tickets</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => refetch()}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
					>
						<HiRefresh className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
						Refresh
					</button>
					{tickets.length > 0 && (
						<>
							<button
								onClick={() => navigate({ to: "/dashboard/tickets/print" })}
								className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
							>
								<HiPrinter className="h-5 w-5" />
								Print Tickets
							</button>
							<button
								onClick={() => setIsBulkDeleteOpen(true)}
								className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 font-medium rounded-lg border border-red-200 transition-colors"
							>
								<HiTrash className="h-5 w-5" />
								Delete All
							</button>
						</>
					)}
					<button
						onClick={() => setIsGenerateModalOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
					>
						<HiTicket className="h-5 w-5" />
						Generate Tickets
					</button>
				</div>
			</div>

			{/* Stats Cards */}
			{tickets.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
								<HiTicket className="h-6 w-6 text-indigo-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Total Tickets</p>
								<p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
								<HiTicket className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Latest Generated</p>
								<p className="text-sm font-medium text-gray-900">
									{tickets.length > 0
										? new Date(tickets[0].createdAt).toLocaleDateString()
										: "N/A"}
								</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
								<HiTicket className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">Ticket Format</p>
								<p className="text-sm font-medium text-gray-900 font-mono">UCSM-UUID</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Error State */}
			{isError && (
				<div className="bg-red-50 border border-red-200 rounded-xl p-4">
					<p className="text-red-800 font-medium">Failed to load tickets</p>
					<p className="text-red-600 text-sm mt-1">
						{error instanceof Error ? error.message : "An error occurred"}
					</p>
				</div>
			)}

			{/* Loading State */}
			{isLoading && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
					<div className="flex flex-col items-center justify-center">
						<div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
						<p className="text-gray-500">Loading tickets...</p>
					</div>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !isError && tickets.length === 0 && (
				<TicketsEmptyState onGenerate={() => setIsGenerateModalOpen(true)} />
			)}

			{/* Tickets Table */}
			{!isLoading && !isError && tickets.length > 0 && (
				<TicketsDataTable tickets={tickets} onDelete={setDeletingTicket} />
			)}

			{/* Dialogs */}
			<GenerateTicketsDialog
				isOpen={isGenerateModalOpen}
				onClose={() => setIsGenerateModalOpen(false)}
				onGenerate={handleGenerate}
				isLoading={generateMutation.isPending}
				error={generateMutation.error}
			/>

			<DeleteTicketDialog
				ticket={deletingTicket}
				onClose={() => setDeletingTicket(null)}
				onConfirm={handleDelete}
				isLoading={deleteMutation.isPending}
				error={deleteMutation.error}
			/>

			<BulkDeleteDialog
				isOpen={isBulkDeleteOpen}
				ticketCount={tickets.length}
				onClose={() => setIsBulkDeleteOpen(false)}
				onConfirm={handleBulkDelete}
				isLoading={bulkDeleteMutation.isPending}
				error={bulkDeleteMutation.error}
			/>
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => dashboardRoute,
	path: "/tickets",
	component: TicketsPage,
});
