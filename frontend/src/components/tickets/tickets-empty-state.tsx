import { HiTicket } from "react-icons/hi";

interface TicketsEmptyStateProps {
	onGenerate: () => void;
}

export function TicketsEmptyState({ onGenerate }: TicketsEmptyStateProps) {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
			<div className="flex flex-col items-center justify-center text-center">
				<div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
					<HiTicket className="h-8 w-8 text-indigo-600" />
				</div>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets yet</h3>
				<p className="text-gray-500 mb-6 max-w-sm">
					Generate tickets for voters. Each ticket contains a unique serial number that can be used once for voting.
				</p>
				<button
					onClick={onGenerate}
					className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
				>
					<HiTicket className="h-5 w-5" />
					Generate Tickets
				</button>
			</div>
		</div>
	);
}

