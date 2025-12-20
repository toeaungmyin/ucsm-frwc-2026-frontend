import { useState } from "react";
import { Modal } from "../ui/modal";
import { HiTicket } from "react-icons/hi";

interface GenerateTicketsDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onGenerate: (quantity: number) => void;
	isLoading: boolean;
	error?: Error | null;
}

export function GenerateTicketsDialog({
	isOpen,
	onClose,
	onGenerate,
	isLoading,
	error,
}: GenerateTicketsDialogProps) {
	const [quantity, setQuantity] = useState(10);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (quantity >= 1 && quantity <= 100) {
			onGenerate(quantity);
		}
	};

	const handleClose = () => {
		setQuantity(10);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Generate Tickets">
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Info Banner */}
				<div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
					<HiTicket className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
					<div>
						<p className="text-sm text-indigo-800 font-medium">Ticket Generation</p>
						<p className="text-sm text-indigo-600 mt-1">
							Each ticket gets a unique serial number (UCSM-UUID format) that can be used for voting.
						</p>
					</div>
				</div>

				{/* Quantity Input */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Number of Tickets
					</label>
					<input
						type="number"
						min={1}
						max={100}
						value={quantity}
						onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
						className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
					/>
					<p className="mt-2 text-sm text-gray-500">
						You can generate between 1 and 100 tickets at a time.
					</p>
				</div>

				{/* Quick Select Buttons */}
				<div className="flex flex-wrap gap-2">
					{[5, 10, 25, 50, 100].map((num) => (
						<button
							key={num}
							type="button"
							onClick={() => setQuantity(num)}
							className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
								quantity === num
									? "bg-indigo-600 text-white border-indigo-600"
									: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
							}`}
						>
							{num}
						</button>
					))}
				</div>

				{/* Error Message */}
				{error && (
					<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-600">
							{error instanceof Error ? error.message : "Failed to generate tickets"}
						</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex items-center gap-3 pt-2">
					<button
						type="button"
						onClick={handleClose}
						className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isLoading || quantity < 1 || quantity > 100}
						className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors font-medium"
					>
						{isLoading ? "Generating..." : `Generate ${quantity} Tickets`}
					</button>
				</div>
			</form>
		</Modal>
	);
}

