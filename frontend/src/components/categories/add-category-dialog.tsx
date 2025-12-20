import { Modal } from "../ui/modal";
import { CategoryForm, type CategoryFormData } from "./category-form";

interface AddCategoryDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CategoryFormData, iconFile: File | null) => void;
	isLoading: boolean;
	error?: Error | null;
}

export function AddCategoryDialog({ isOpen, onClose, onSubmit, isLoading, error }: AddCategoryDialogProps) {
	const handleSubmit = (data: CategoryFormData, iconFile: File | null) => {
		onSubmit(data, iconFile);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Add Category">
			<CategoryForm
				onSubmit={handleSubmit}
				onCancel={onClose}
				isLoading={isLoading}
				submitLabel="Create Category"
			/>
			{error && (
				<p className="mt-4 text-sm text-red-600">
					{error instanceof Error ? error.message : "Failed to create category"}
				</p>
			)}
		</Modal>
	);
}

