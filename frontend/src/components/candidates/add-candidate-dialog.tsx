import { Modal } from "../ui/modal";
import { CandidateForm, type CandidateFormData } from "./candidate-form";
import type { Category } from "../../types";

interface AddCandidateDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CandidateFormData, imageFile: File | null) => void;
	categories: Category[];
	isLoading: boolean;
	error?: Error | null;
}

export function AddCandidateDialog({
	isOpen,
	onClose,
	onSubmit,
	categories,
	isLoading,
	error,
}: AddCandidateDialogProps) {
	const handleSubmit = (data: CandidateFormData, imageFile: File | null) => {
		onSubmit(data, imageFile);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Add Candidate">
			<CandidateForm
				categories={categories}
				onSubmit={handleSubmit}
				onCancel={onClose}
				isLoading={isLoading}
				submitLabel="Create Candidate"
			/>
			{error && (
				<p className="mt-4 text-sm text-red-600">
					{error instanceof Error ? error.message : "Failed to create candidate"}
				</p>
			)}
		</Modal>
	);
}
