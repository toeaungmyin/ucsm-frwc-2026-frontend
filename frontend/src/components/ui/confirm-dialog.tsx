import { HiExclamation } from "react-icons/hi";
import { Modal } from "./modal";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: React.ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	isLoading?: boolean;
	variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	isLoading = false,
	variant = "danger",
}: ConfirmDialogProps) {
	const variantStyles = {
		danger: {
			icon: "bg-red-100 text-red-600",
			button: "bg-red-600 hover:bg-red-700 disabled:bg-red-400",
		},
		warning: {
			icon: "bg-yellow-100 text-yellow-600",
			button: "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400",
		},
		info: {
			icon: "bg-blue-100 text-blue-600",
			button: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400",
		},
	};

	const styles = variantStyles[variant];

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
			<div className="text-center">
				<div className={`w-12 h-12 ${styles.icon} rounded-full flex items-center justify-center mx-auto mb-4`}>
					<HiExclamation className="h-6 w-6" />
				</div>
				<div className="text-gray-500 mb-6">{message}</div>
				<div className="flex items-center gap-3">
					<button
						onClick={onClose}
						className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
					>
						{cancelLabel}
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${styles.button}`}
					>
						{isLoading ? "Loading..." : confirmLabel}
					</button>
				</div>
			</div>
		</Modal>
	);
}

