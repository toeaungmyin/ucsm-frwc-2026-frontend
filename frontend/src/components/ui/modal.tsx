import { HiX } from "react-icons/hi";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
	if (!isOpen) return null;

	const sizeClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="fixed inset-0 bg-black/50" onClick={onClose} />
			<div className={`relative bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} mx-4 p-6`}>
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

