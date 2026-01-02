import { HiPencil, HiTrash, HiUser } from "react-icons/hi";
import type { Candidate } from "../../types";

interface CandidatesGridViewProps {
	candidates: Candidate[];
	onEdit: (candidate: Candidate) => void;
	onDelete: (candidate: Candidate) => void;
}

export function CandidatesGridView({ candidates, onEdit, onDelete }: CandidatesGridViewProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{candidates.map((candidate) => (
				<div
					key={candidate.id}
					className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
				>
					{/* Image */}
					<div className="aspect-square bg-gray-100 relative">
						{candidate.imageUrl ? (
							<img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<HiUser className="w-20 h-20 text-gray-300" />
							</div>
						)}
						{/* Category Badge */}
						<div className="absolute top-3 left-3">
							<span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-600 text-white rounded-full shadow-sm">
								{candidate.category.name}
							</span>
						</div>
						{/* Nominee ID Badge */}
						<div className="absolute top-3 right-3">
							<span className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium bg-white/90 text-gray-700 rounded shadow-sm">
								{candidate.nomineeId}
							</span>
						</div>
					</div>

					{/* Content */}
					<div className="p-4">
						<h3 className="font-semibold text-gray-900 text-lg capitalize truncate">{candidate.name}</h3>
						<p className="text-sm text-gray-500 mt-1">
							Added {new Date(candidate.createdAt).toLocaleDateString()}
						</p>

						{/* Actions */}
						<div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
							<button
								onClick={() => onEdit(candidate)}
								className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
							>
								<HiPencil className="h-4 w-4" />
								Edit
							</button>
							<button
								onClick={() => onDelete(candidate)}
								className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
							>
								<HiTrash className="h-4 w-4" />
								Delete
							</button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

