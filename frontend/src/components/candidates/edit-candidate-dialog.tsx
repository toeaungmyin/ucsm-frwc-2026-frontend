import { Modal } from "../ui/modal";
import { CandidateForm, type CandidateFormData } from "./candidate-form";
import type { Candidate, Category } from "../../types";

interface EditCandidateDialogProps {
	candidate: Candidate | null;
	categories: Category[];
	onClose: () => void;
	onSubmit: (data: CandidateFormData, imageFile: File | null, removeImage: boolean) => void;
	isLoading: boolean;
	error?: Error | null;
}

export function EditCandidateDialog({
	candidate,
	categories,
	onClose,
	onSubmit,
	isLoading,
	error,
}: EditCandidateDialogProps) {
	if (!candidate) return null;

	return (
		<Modal isOpen={!!candidate} onClose={onClose} title="Edit Candidate">
			<CandidateForm
				defaultValues={{
					nomineeId: candidate.nomineeId,
					name: candidate.name,
					category: candidate.category.name,
				}}
				currentImage={candidate.image}
				categories={categories}
				onSubmit={onSubmit}
				onCancel={onClose}
				isLoading={isLoading}
				submitLabel="Save Changes"
			/>
			{error && (
				<p className="mt-4 text-sm text-red-600">
					{error instanceof Error ? error.message : "Failed to update candidate"}
				</p>
			)}
		</Modal>
	);
}
