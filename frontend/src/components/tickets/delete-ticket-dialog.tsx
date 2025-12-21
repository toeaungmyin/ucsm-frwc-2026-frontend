import { ConfirmDialog } from "../ui/confirm-dialog";
import type { Ticket } from "../../types";

interface DeleteTicketDialogProps {
	ticket: Ticket | null;
	onClose: () => void;
	onConfirm: () => void;
	isLoading: boolean;
	error?: Error | null;
}

export function DeleteTicketDialog({
	ticket,
	onClose,
	onConfirm,
	isLoading,
}: DeleteTicketDialogProps) {
	if (!ticket) return null;

	return (
		<ConfirmDialog
			isOpen={!!ticket}
			onClose={onClose}
			onConfirm={onConfirm}
			title="Delete Ticket"
			message={
				<>
					Are you sure you want to delete ticket{" "}
					<code className="px-2 py-0.5 bg-gray-100 rounded font-mono text-sm">
						{ticket.serial}
					</code>
					? This action cannot be undone.
				</>
			}
			confirmLabel="Delete Ticket"
			isLoading={isLoading}
			variant="danger"
		/>
	);
}

