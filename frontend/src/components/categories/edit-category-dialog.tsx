import { Modal } from "../ui/modal";
import { CategoryForm, type CategoryFormData } from "./category-form";
import type { Category } from "../../types";

interface EditCategoryDialogProps {
	category: Category | null;
	onClose: () => void;
	onSubmit: (data: CategoryFormData, iconFile: File | null, removeIcon: boolean) => void;
	isLoading: boolean;
	error?: Error | null;
}

export function EditCategoryDialog({ category, onClose, onSubmit, isLoading, error }: EditCategoryDialogProps) {
	if (!category) return null;

	return (
		<Modal isOpen={!!category} onClose={onClose} title="Edit Category">
			<CategoryForm
				defaultValues={{
					name: category.name,
					isActive: category.isActive,
				}}
				currentIcon={category.iconUrl}
				onSubmit={onSubmit}
				onCancel={onClose}
				isLoading={isLoading}
				submitLabel="Save Changes"
			/>
			{error && (
				<p className="mt-4 text-sm text-red-600">
					{error instanceof Error ? error.message : "Failed to update category"}
				</p>
			)}
		</Modal>
	);
}

