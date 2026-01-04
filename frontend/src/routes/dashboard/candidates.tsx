import { createRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HiPlus, HiRefresh, HiFilter, HiViewGrid, HiViewList, HiDownload, HiUpload } from "react-icons/hi";
import { Route as dashboardRoute } from "../dashboard";
import { candidatesApi, type ImportCandidatesResult } from "../../api/candidates.api";
import { categoriesApi } from "../../api/categories.api";
import type { Candidate } from "../../types";
import {
	CandidatesDataTable,
	CandidatesGridView,
	CandidatesEmptyState,
	AddCandidateDialog,
	EditCandidateDialog,
	DeleteCandidateDialog,
	ImportCandidatesDialog,
	type CandidateFormData,
} from "../../components/candidates";

type ViewMode = "table" | "grid";

function CandidatesPage() {
	const queryClient = useQueryClient();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
	const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [viewMode, setViewMode] = useState<ViewMode>("table");
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [importResult, setImportResult] = useState<ImportCandidatesResult | null>(null);

	// Fetch candidates
	const {
		data: candidatesData,
		isLoading: isCandidatesLoading,
		isError: isCandidatesError,
		error: candidatesError,
		refetch: refetchCandidates,
	} = useQuery({
		queryKey: ["candidates"],
		queryFn: candidatesApi.getAll,
	});

	// Fetch categories for the form
	const { data: categoriesData } = useQuery({
		queryKey: ["categories"],
		queryFn: categoriesApi.getAll,
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: (data: { nomineeId: string; name: string; category: string; image?: File }) =>
			candidatesApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["candidates"] });
			setIsCreateModalOpen(false);
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: { nomineeId?: string; name?: string; category?: string; image?: File };
		}) => candidatesApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["candidates"] });
			setEditingCandidate(null);
		},
	});

	// Remove image mutation
	const removeImageMutation = useMutation({
		mutationFn: (id: string) => candidatesApi.removeImage(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["candidates"] });
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: (id: string) => candidatesApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["candidates"] });
			setDeletingCandidate(null);
		},
	});

	// Export mutation
	const exportMutation = useMutation({
		mutationFn: () => candidatesApi.export(),
		onSuccess: (response) => {
			const exportData = response.data;
			const blob = new Blob([JSON.stringify(exportData, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `candidates-backup-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		},
	});

	// Import mutation
	const importMutation = useMutation({
		mutationFn: (data: {
			candidates: Array<{
				id: string;
				nomineeId: string;
				name: string;
				categoryId: string;
				image?: string | null;
			}>;
			skipDuplicates: boolean;
		}) => candidatesApi.import(data),
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ["candidates"] });
			setImportResult(response.data);
		},
	});

	const candidates = candidatesData?.data ?? [];
	const categories = categoriesData?.data ?? [];

	// Filter candidates by category
	const filteredCandidates = selectedCategory
		? candidates.filter((c) => c.category.name === selectedCategory)
		: candidates;

	const handleCreate = (formData: CandidateFormData, imageFile: File | null) => {
		createMutation.mutate({
			nomineeId: formData.nomineeId,
			name: formData.name,
			category: formData.category,
			...(imageFile && { image: imageFile }),
		});
	};

	const handleUpdate = async (formData: CandidateFormData, imageFile: File | null, removeImage: boolean) => {
		if (!editingCandidate) return;

		// First, remove image if requested
		if (removeImage && editingCandidate.image) {
			await removeImageMutation.mutateAsync(editingCandidate.id);
		}

		// Then update the rest
		updateMutation.mutate({
			id: editingCandidate.id,
			data: {
				nomineeId: formData.nomineeId,
				name: formData.name,
				category: formData.category,
				...(imageFile && { image: imageFile }),
			},
		});
	};

	const handleDelete = () => {
		if (!deletingCandidate) return;
		deleteMutation.mutate(deletingCandidate.id);
	};

	const handleExport = () => {
		exportMutation.mutate();
	};

	const handleImport = (
		candidates: Array<{ id: string; nomineeId: string; name: string; categoryId: string; image?: string | null }>,
		skipDuplicates: boolean
	) => {
		importMutation.mutate({ candidates, skipDuplicates });
	};

	const handleCloseImport = () => {
		setIsImportModalOpen(false);
		setImportResult(null);
		importMutation.reset();
	};

	const isLoading = isCandidatesLoading;

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
					<p className="text-gray-500 mt-1">Manage candidates for voting categories</p>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<button
						onClick={() => refetchCandidates()}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
					>
						<HiRefresh className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
						Refresh
					</button>
					<button
						onClick={() => setIsImportModalOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
					>
						<HiUpload className="h-5 w-5" />
						Import
					</button>
					{candidates.length > 0 && (
						<button
							onClick={handleExport}
							disabled={exportMutation.isPending}
							className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-w-[120px] bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
						>
							<HiDownload className={`h-5 w-5 ${exportMutation.isPending ? "animate-pulse" : ""}`} />
							Export
						</button>
					)}
					<button
						onClick={() => setIsCreateModalOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
					>
						<HiPlus className="h-5 w-5" />
						Add Candidate
					</button>
				</div>
			</div>

			{/* Filter Bar with View Toggle */}
			{categories.length > 0 && (
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
					{/* Filter */}
					<div className="flex items-center gap-3">
						<HiFilter className="h-5 w-5 text-gray-400" />
						<span className="text-sm font-medium text-gray-700">Filter by category:</span>
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">All Categories</option>
							{categories
								.filter((cat) => cat.isActive)
								.map((category) => (
									<option key={category.id} value={category.name}>
										{category.name}
									</option>
								))}
						</select>
						{selectedCategory && (
							<button
								onClick={() => setSelectedCategory("")}
								className="text-sm text-blue-600 hover:text-blue-700"
							>
								Clear filter
							</button>
						)}
					</div>

					{/* View Toggle */}
					<div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
						<button
							onClick={() => setViewMode("table")}
							className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
								viewMode === "table"
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							<HiViewList className="h-4 w-4" />
							Table
						</button>
						<button
							onClick={() => setViewMode("grid")}
							className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
								viewMode === "grid"
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							<HiViewGrid className="h-4 w-4" />
							Grid
						</button>
					</div>
				</div>
			)}

			{/* Error State */}
			{isCandidatesError && (
				<div className="bg-red-50 border border-red-200 rounded-xl p-4">
					<p className="text-red-800 font-medium">Failed to load candidates</p>
					<p className="text-red-600 text-sm mt-1">
						{candidatesError instanceof Error ? candidatesError.message : "An error occurred"}
					</p>
				</div>
			)}

			{/* Loading State */}
			{isLoading && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
					<div className="flex flex-col items-center justify-center">
						<div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
						<p className="text-gray-500">Loading candidates...</p>
					</div>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !isCandidatesError && candidates.length === 0 && (
				<CandidatesEmptyState onAddCandidate={() => setIsCreateModalOpen(true)} />
			)}

			{/* No Results After Filter */}
			{!isLoading && !isCandidatesError && candidates.length > 0 && filteredCandidates.length === 0 && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
					<div className="flex flex-col items-center justify-center">
						<p className="text-gray-500">No candidates found in this category.</p>
						<button
							onClick={() => setSelectedCategory("")}
							className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
						>
							Clear filter
						</button>
					</div>
				</div>
			)}

			{/* Candidates View - Table or Grid */}
			{!isLoading && !isCandidatesError && filteredCandidates.length > 0 && (
				<>
					{viewMode === "table" ? (
						<CandidatesDataTable
							candidates={filteredCandidates}
							onEdit={setEditingCandidate}
							onDelete={setDeletingCandidate}
						/>
					) : (
						<CandidatesGridView
							candidates={filteredCandidates}
							onEdit={setEditingCandidate}
							onDelete={setDeletingCandidate}
						/>
					)}
				</>
			)}

			{/* Dialogs */}
			<AddCandidateDialog
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreate}
				categories={categories}
				isLoading={createMutation.isPending}
				error={createMutation.error}
			/>

			<EditCandidateDialog
				candidate={editingCandidate}
				categories={categories}
				onClose={() => setEditingCandidate(null)}
				onSubmit={handleUpdate}
				isLoading={updateMutation.isPending || removeImageMutation.isPending}
				error={updateMutation.error}
			/>

			<DeleteCandidateDialog
				candidate={deletingCandidate}
				onClose={() => setDeletingCandidate(null)}
				onConfirm={handleDelete}
				isLoading={deleteMutation.isPending}
				error={deleteMutation.error}
			/>

			<ImportCandidatesDialog
				isOpen={isImportModalOpen}
				onClose={handleCloseImport}
				onImport={handleImport}
				isLoading={importMutation.isPending}
				error={importMutation.error}
				result={importResult}
			/>
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => dashboardRoute,
	path: "/candidates",
	component: CandidatesPage,
});
