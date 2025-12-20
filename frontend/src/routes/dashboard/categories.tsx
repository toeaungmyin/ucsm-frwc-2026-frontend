import { createRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HiPlus, HiRefresh } from "react-icons/hi";
import { Route as dashboardRoute } from "../dashboard";
import { categoriesApi, type CreateCategoryInput, type UpdateCategoryInput } from "../../api/categories.api";
import type { Category } from "../../types";
import {
	CategoriesDataTable,
	CategoriesEmptyState,
	AddCategoryDialog,
	EditCategoryDialog,
	DeleteCategoryDialog,
	type CategoryFormData,
} from "../../components/categories";

function CategoriesPage() {
	const queryClient = useQueryClient();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

	// Fetch categories
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ["categories"],
		queryFn: categoriesApi.getAll,
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: (data: CreateCategoryInput) => categoriesApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			setIsCreateModalOpen(false);
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) => categoriesApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			setEditingCategory(null);
		},
	});

	// Remove icon mutation
	const removeIconMutation = useMutation({
		mutationFn: (id: string) => categoriesApi.removeIcon(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: (id: string) => categoriesApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			setDeletingCategory(null);
		},
	});

	// Reorder mutation
	const reorderMutation = useMutation({
		mutationFn: (orderedIds: string[]) => categoriesApi.reorder(orderedIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});

	const categories = data?.data ?? [];

	const handleCreate = (formData: CategoryFormData, iconFile: File | null) => {
		createMutation.mutate({
			name: formData.name,
			isActive: formData.isActive,
			icon: iconFile || undefined,
		});
	};

	const handleUpdate = async (formData: CategoryFormData, iconFile: File | null, removeIcon: boolean) => {
		if (!editingCategory) return;

		// If removing icon, call the separate endpoint first
		if (removeIcon && editingCategory.icon) {
			await removeIconMutation.mutateAsync(editingCategory.id);
		}

		updateMutation.mutate({
			id: editingCategory.id,
			data: {
				name: formData.name,
				isActive: formData.isActive,
				icon: iconFile || undefined,
			},
		});
	};

	const handleDelete = () => {
		if (!deletingCategory) return;
		deleteMutation.mutate(deletingCategory.id);
	};

	const handleReorder = (orderedIds: string[]) => {
		reorderMutation.mutate(orderedIds);
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Categories</h1>
					<p className="text-gray-500 mt-1">Manage voting categories for the event</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => refetch()}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
					>
						<HiRefresh className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
						Refresh
					</button>
					<button
						onClick={() => setIsCreateModalOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
					>
						<HiPlus className="h-5 w-5" />
						Add Category
					</button>
				</div>
			</div>

			{/* Error State */}
			{isError && (
				<div className="bg-red-50 border border-red-200 rounded-xl p-4">
					<p className="text-red-800 font-medium">Failed to load categories</p>
					<p className="text-red-600 text-sm mt-1">
						{error instanceof Error ? error.message : "An error occurred"}
					</p>
				</div>
			)}

			{/* Loading State */}
			{isLoading && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
					<div className="flex flex-col items-center justify-center">
						<div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
						<p className="text-gray-500">Loading categories...</p>
					</div>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !isError && categories.length === 0 && (
				<CategoriesEmptyState onAddCategory={() => setIsCreateModalOpen(true)} />
			)}

			{/* Categories Table */}
			{!isLoading && !isError && categories.length > 0 && (
				<CategoriesDataTable
					categories={categories}
					onEdit={setEditingCategory}
					onDelete={setDeletingCategory}
					onReorder={handleReorder}
					isReordering={reorderMutation.isPending}
				/>
			)}

			{/* Dialogs */}
			<AddCategoryDialog
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreate}
				isLoading={createMutation.isPending}
				error={createMutation.error}
			/>

			<EditCategoryDialog
				category={editingCategory}
				onClose={() => setEditingCategory(null)}
				onSubmit={handleUpdate}
				isLoading={updateMutation.isPending || removeIconMutation.isPending}
				error={updateMutation.error}
			/>

			<DeleteCategoryDialog
				category={deletingCategory}
				onClose={() => setDeletingCategory(null)}
				onConfirm={handleDelete}
				isLoading={deleteMutation.isPending}
				error={deleteMutation.error}
			/>
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => dashboardRoute,
	path: "/categories",
	component: CategoriesPage,
});
