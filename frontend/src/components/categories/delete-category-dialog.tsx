import { ConfirmDialog } from "../ui/confirm-dialog";
import type { Category } from "../../types";

interface DeleteCategoryDialogProps {
	category: Category | null;
	onClose: () => void;
	onConfirm: () => void;
	isLoading: boolean;
	error?: Error | null;
}

export function DeleteCategoryDialog({
	category,
	onClose,
	onConfirm,
	isLoading,
	error,
}: DeleteCategoryDialogProps) {
	if (!category) return null;

	return (
		<>
			<ConfirmDialog
				isOpen={!!category}
				onClose={onClose}
				onConfirm={onConfirm}
				title="Delete Category"
				message={
					<>
						Are you sure you want to delete <strong>"{category.name}"</strong>? This action cannot be
						undone.
					</>
				}
				confirmLabel="Delete"
				isLoading={isLoading}
				variant="danger"
			/>
			{error && (
				<p className="mt-4 text-sm text-red-600 text-center">
					{error instanceof Error ? error.message : "Failed to delete category"}
				</p>
			)}
		</>
	);
}

