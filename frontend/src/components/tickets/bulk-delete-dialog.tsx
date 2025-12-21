import { ConfirmDialog } from "../ui/confirm-dialog";

interface BulkDeleteDialogProps {
	isOpen: boolean;
	ticketCount: number;
	onClose: () => void;
	onConfirm: () => void;
	isLoading: boolean;
	error?: Error | null;
}

export function BulkDeleteDialog({
	isOpen,
	ticketCount,
	onClose,
	onConfirm,
	isLoading,
}: BulkDeleteDialogProps) {
	return (
		<ConfirmDialog
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title="Delete All Tickets"
			message={
				<>
					Are you sure you want to delete all{" "}
					<span className="font-semibold text-red-600">{ticketCount}</span> tickets? 
					This will also remove all associated votes. This action cannot be undone.
				</>
			}
			confirmLabel="Delete All Tickets"
			isLoading={isLoading}
			variant="danger"
		/>
	);
}

