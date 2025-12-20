import { HiUserGroup, HiPlus } from "react-icons/hi";

interface CandidatesEmptyStateProps {
	onAddCandidate: () => void;
}

export function CandidatesEmptyState({ onAddCandidate }: CandidatesEmptyStateProps) {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
			<div className="flex flex-col items-center justify-center">
				<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
					<HiUserGroup className="h-8 w-8 text-gray-400" />
				</div>
				<h3 className="text-gray-900 font-medium">No candidates yet</h3>
				<p className="text-gray-500 text-sm mt-1">Get started by adding your first candidate.</p>
				<button
					onClick={onAddCandidate}
					className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
				>
					<HiPlus className="h-5 w-5" />
					Add Candidate
				</button>
			</div>
		</div>
	);
}

