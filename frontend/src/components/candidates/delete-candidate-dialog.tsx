import { ConfirmDialog } from "../ui/confirm-dialog";
import type { Candidate } from "../../types";

interface DeleteCandidateDialogProps {
	candidate: Candidate | null;
	onClose: () => void;
	onConfirm: () => void;
	isLoading: boolean;
	error?: Error | null;
}

export function DeleteCandidateDialog({
	candidate,
	onClose,
	onConfirm,
	isLoading,
	error,
}: DeleteCandidateDialogProps) {
	if (!candidate) return null;

	return (
		<>
			<ConfirmDialog
				isOpen={!!candidate}
				onClose={onClose}
				onConfirm={onConfirm}
				title="Delete Candidate"
				message={
					<>
						Are you sure you want to delete{" "}
						<strong>
							"{candidate.nomineeId}. {candidate.name}"
						</strong>{" "}
						? This action cannot be undone.
					</>
				}
				confirmLabel="Delete"
				isLoading={isLoading}
				variant="danger"
			/>
			{error && (
				<p className="mt-4 text-sm text-red-600 text-center">
					{error instanceof Error ? error.message : "Failed to delete candidate"}
				</p>
			)}
		</>
	);
}

