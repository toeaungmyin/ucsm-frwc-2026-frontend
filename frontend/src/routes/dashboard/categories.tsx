import { createRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiPlus, HiPencil, HiTrash, HiViewBoards, HiRefresh, HiX, HiExclamation, HiSelector } from "react-icons/hi";
import { Route as dashboardRoute } from "../dashboard";
import { categoriesApi, type CreateCategoryInput, type UpdateCategoryInput } from "../../api/categories.api";
import type { Category } from "../../types";

// Form validation schema
const categorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Modal Component
function Modal({
	isOpen,
	onClose,
	title,
	children,
}: {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="fixed inset-0 bg-black/50" onClick={onClose} />
			<div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
					<button
						onClick={onClose}
						className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
					>
						<HiX className="h-5 w-5" />
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}

// Category Form Component
function CategoryForm({
	defaultValues,
	onSubmit,
	onCancel,
	isLoading,
	submitLabel,
}: {
	defaultValues?: Partial<CategoryFormData>;
	onSubmit: (data: CategoryFormData) => void;
	onCancel: () => void;
	isLoading: boolean;
	submitLabel: string;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CategoryFormData>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: "",
			isActive: true,
			...defaultValues,
		},
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
				<input
					type="text"
					{...register("name")}
					className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						errors.name ? "border-red-500" : "border-gray-300"
					}`}
					placeholder="Enter category name"
				/>
				{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
			</div>

			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="isActive"
					{...register("isActive")}
					className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
				/>
				<label htmlFor="isActive" className="text-sm font-medium text-gray-700">
					Active
				</label>
			</div>

			<div className="flex items-center gap-3 pt-4">
				<button
					type="button"
					onClick={onCancel}
					className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isLoading}
					className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
				>
					{isLoading ? "Saving..." : submitLabel}
				</button>
			</div>
		</form>
	);
}

// Delete Confirmation Component
function DeleteConfirmation({
	category,
	onConfirm,
	onCancel,
	isLoading,
}: {
	category: Category;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading: boolean;
}) {
	return (
		<div className="text-center">
			<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
				<HiExclamation className="h-6 w-6 text-red-600" />
			</div>
			<h4 className="text-lg font-medium text-gray-900 mb-2">Delete Category</h4>
			<p className="text-gray-500 mb-6">
				Are you sure you want to delete <strong>"{category.name}"</strong>? This action cannot be undone.
			</p>
			<div className="flex items-center gap-3">
				<button
					onClick={onCancel}
					className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Cancel
				</button>
				<button
					onClick={onConfirm}
					disabled={isLoading}
					className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors"
				>
					{isLoading ? "Deleting..." : "Delete"}
				</button>
			</div>
		</div>
	);
}

function CategoriesPage() {
	const queryClient = useQueryClient();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
	const [draggedId, setDraggedId] = useState<string | null>(null);
	const [dragOverId, setDragOverId] = useState<string | null>(null);
	const dragRef = useRef<{ startIndex: number; currentIndex: number } | null>(null);

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

	const handleCreate = (formData: CategoryFormData) => {
		createMutation.mutate({
			name: formData.name,
			isActive: formData.isActive,
		});
	};

	const handleUpdate = (formData: CategoryFormData) => {
		if (!editingCategory) return;
		updateMutation.mutate({
			id: editingCategory.id,
			data: {
				name: formData.name,
				isActive: formData.isActive,
			},
		});
	};

	const handleDelete = () => {
		if (!deletingCategory) return;
		deleteMutation.mutate(deletingCategory.id);
	};

	// Drag and Drop handlers
	const handleDragStart = (e: React.DragEvent, categoryId: string, index: number) => {
		setDraggedId(categoryId);
		dragRef.current = { startIndex: index, currentIndex: index };
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", categoryId);
	};

	const handleDragOver = (e: React.DragEvent, categoryId: string, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		if (draggedId && categoryId !== draggedId) {
			setDragOverId(categoryId);
			if (dragRef.current) {
				dragRef.current.currentIndex = index;
			}
		}
	};

	const handleDragLeave = () => {
		setDragOverId(null);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();

		if (dragRef.current && dragRef.current.startIndex !== dragRef.current.currentIndex) {
			const newCategories = [...categories];
			const [draggedItem] = newCategories.splice(dragRef.current.startIndex, 1);
			newCategories.splice(dragRef.current.currentIndex, 0, draggedItem);

			const orderedIds = newCategories.map((cat) => cat.id);
			reorderMutation.mutate(orderedIds);
		}

		setDraggedId(null);
		setDragOverId(null);
		dragRef.current = null;
	};

	const handleDragEnd = () => {
		setDraggedId(null);
		setDragOverId(null);
		dragRef.current = null;
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
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
					<div className="flex flex-col items-center justify-center">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<HiViewBoards className="h-8 w-8 text-gray-400" />
						</div>
						<h3 className="text-gray-900 font-medium">No categories yet</h3>
						<p className="text-gray-500 text-sm mt-1">Get started by creating your first category.</p>
						<button
							onClick={() => setIsCreateModalOpen(true)}
							className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
						>
							<HiPlus className="h-5 w-5" />
							Add Category
						</button>
					</div>
				</div>
			)}

			{/* Categories Table */}
			{!isLoading && !isError && categories.length > 0 && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					{/* Drag hint */}
					<div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
						<p className="text-sm text-blue-700 flex items-center gap-2">
							<HiSelector className="h-4 w-4" />
							Drag and drop rows to reorder categories
						</p>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-gray-50 border-b border-gray-200">
									<th className="w-12 px-4 py-4"></th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Order
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Category Name
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{categories.map((category, index) => (
									<tr
										key={category.id}
										draggable
										onDragStart={(e) => handleDragStart(e, category.id, index)}
										onDragOver={(e) => handleDragOver(e, category.id, index)}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
										onDragEnd={handleDragEnd}
										className={`transition-all cursor-grab active:cursor-grabbing ${
											draggedId === category.id
												? "opacity-50 bg-blue-50"
												: dragOverId === category.id
												? "bg-blue-100 border-t-2 border-blue-500"
												: "hover:bg-gray-50"
										}`}
									>
										<td className="px-4 py-4">
											<HiSelector className="h-5 w-5 text-gray-400" />
										</td>
										<td className="px-6 py-4">
											<span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 font-semibold text-sm rounded-full">
												{category.order}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="p-2 bg-blue-50 rounded-lg">
													<HiViewBoards className="h-5 w-5 text-blue-600" />
												</div>
												<div>
													<span className="font-medium text-gray-900">{category.name}</span>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
													category.isActive
														? "bg-green-100 text-green-700"
														: "bg-gray-100 text-gray-600"
												}`}
											>
												<span
													className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
														category.isActive ? "bg-green-500" : "bg-gray-400"
													}`}
												/>
												{category.isActive ? "Active" : "Inactive"}
											</span>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center justify-end gap-2">
												<button
													onClick={() => setEditingCategory(category)}
													className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
												>
													<HiPencil className="h-5 w-5" />
												</button>
												<button
													onClick={() => setDeletingCategory(category)}
													className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
												>
													<HiTrash className="h-5 w-5" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Table Footer */}
					<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
						<div className="flex items-center justify-between">
							<p className="text-sm text-gray-600">
								Showing <span className="font-medium">{categories.length}</span> categories
							</p>
							{reorderMutation.isPending && (
								<p className="text-sm text-blue-600 flex items-center gap-2">
									<span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
									Saving order...
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Create Modal */}
			<Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Category">
				<CategoryForm
					onSubmit={handleCreate}
					onCancel={() => setIsCreateModalOpen(false)}
					isLoading={createMutation.isPending}
					submitLabel="Create Category"
				/>
				{createMutation.isError && (
					<p className="mt-4 text-sm text-red-600">
						{createMutation.error instanceof Error
							? createMutation.error.message
							: "Failed to create category"}
					</p>
				)}
			</Modal>

			{/* Edit Modal */}
			<Modal isOpen={!!editingCategory} onClose={() => setEditingCategory(null)} title="Edit Category">
				{editingCategory && (
					<CategoryForm
						defaultValues={{
							name: editingCategory.name,
							isActive: editingCategory.isActive,
						}}
						onSubmit={handleUpdate}
						onCancel={() => setEditingCategory(null)}
						isLoading={updateMutation.isPending}
						submitLabel="Save Changes"
					/>
				)}
				{updateMutation.isError && (
					<p className="mt-4 text-sm text-red-600">
						{updateMutation.error instanceof Error
							? updateMutation.error.message
							: "Failed to update category"}
					</p>
				)}
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal isOpen={!!deletingCategory} onClose={() => setDeletingCategory(null)} title="Confirm Delete">
				{deletingCategory && (
					<DeleteConfirmation
						category={deletingCategory}
						onConfirm={handleDelete}
						onCancel={() => setDeletingCategory(null)}
						isLoading={deleteMutation.isPending}
					/>
				)}
				{deleteMutation.isError && (
					<p className="mt-4 text-sm text-red-600 text-center">
						{deleteMutation.error instanceof Error
							? deleteMutation.error.message
							: "Failed to delete category"}
					</p>
				)}
			</Modal>
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => dashboardRoute,
	path: "/categories",
	component: CategoriesPage,
});
