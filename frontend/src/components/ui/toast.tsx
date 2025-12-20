import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { HiX, HiCheckCircle, HiExclamationCircle, HiInformationCircle } from "react-icons/hi";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
	id: string;
	message: string;
	type: ToastType;
}

interface ToastContextType {
	toasts: Toast[];
	showToast: (message: string, type?: ToastType) => void;
	removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

const toastStyles = {
	success: {
		bg: "bg-green-50 border-green-200",
		iconBg: "bg-green-100",
		icon: "text-green-500",
		text: "text-green-800",
	},
	error: {
		bg: "bg-red-50 border-red-200",
		iconBg: "bg-red-100",
		icon: "text-red-500",
		text: "text-red-800",
	},
	info: {
		bg: "bg-blue-50 border-blue-200",
		iconBg: "bg-blue-100",
		icon: "text-blue-500",
		text: "text-blue-800",
	},
	warning: {
		bg: "bg-yellow-50 border-yellow-200",
		iconBg: "bg-yellow-100",
		icon: "text-yellow-500",
		text: "text-yellow-800",
	},
};

const toastIcons = {
	success: HiCheckCircle,
	error: HiExclamationCircle,
	info: HiInformationCircle,
	warning: HiExclamationCircle,
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
	const styles = toastStyles[toast.type];
	const Icon = toastIcons[toast.type];

	return (
		<div
			className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm ${styles.bg} animate-slide-in`}
			role="alert"
		>
			<div className={`${styles.iconBg} p-2 rounded-md`}>
				<Icon className={`h-5 w-5 shrink-0 ${styles.icon}`} />
			</div>
			<p className={`text-sm font-medium flex-1 ${styles.text}`}>{toast.message}</p>
			<button onClick={onRemove} className={`p-1 rounded-lg hover:bg-black/5 transition-colors ${styles.text}`}>
				<HiX className="h-4 w-4" />
			</button>
		</div>
	);
}

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const showToast = useCallback((message: string, type: ToastType = "info") => {
		const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const newToast: Toast = { id, message, type };

		setToasts((prev) => [...prev, newToast]);

		// Auto-remove after 5 seconds
		setTimeout(() => {
			removeToast(id);
		}, 5000);
	}, [removeToast]);

	return (
		<ToastContext.Provider value={{ toasts, showToast, removeToast }}>
			{children}
			{/* Toast Container */}
			<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
				{toasts.map((toast) => (
					<div key={toast.id} className="pointer-events-auto">
						<ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
					</div>
				))}
			</div>
			<style>{`
				@keyframes slide-in {
					from {
						opacity: 0;
						transform: translateX(100%);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}
				.animate-slide-in {
					animation: slide-in 0.3s ease-out;
				}
			`}</style>
		</ToastContext.Provider>
	);
}

