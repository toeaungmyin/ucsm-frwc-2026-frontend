import { HiPencil, HiTrash, HiUser } from "react-icons/hi";
import type { Candidate } from "../../types";

interface CandidatesDataTableProps {
	candidates: Candidate[];
	onEdit: (candidate: Candidate) => void;
	onDelete: (candidate: Candidate) => void;
}

export function CandidatesDataTable({ candidates, onEdit, onDelete }: CandidatesDataTableProps) {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-gray-50 border-b border-gray-200">
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Nominee ID
							</th>
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Candidate
							</th>
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Category
							</th>
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Created
							</th>
							<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{candidates.map((candidate) => (
							<tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
								<td className="px-6 py-4">
									<span className="inline-flex items-center px-2.5 py-1 text-xs font-mono font-medium bg-gray-100 text-gray-700 rounded">
										{candidate.nomineeId}
									</span>
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
											{candidate.imageUrl ? (
												<img
													src={candidate.imageUrl}
													alt={candidate.name}
													className="w-full h-full object-cover"
												/>
											) : (
												<HiUser className="w-6 h-6 text-gray-400" />
											)}
										</div>
										<span className="font-medium text-gray-900 capitalize">{candidate.name}</span>
									</div>
								</td>
								<td className="px-6 py-4">
									<span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
										{candidate.category.name}
									</span>
								</td>
								<td className="px-6 py-4 text-sm text-gray-500">
									{new Date(candidate.createdAt).toLocaleDateString()}
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center justify-end gap-2">
										<button
											onClick={() => onEdit(candidate)}
											className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
										>
											<HiPencil className="h-5 w-5" />
										</button>
										<button
											onClick={() => onDelete(candidate)}
											className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
										>
											<HiTrash className="h-5 w-5" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Table Footer */}
			<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
				<p className="text-sm text-gray-600">
					Showing <span className="font-medium">{candidates.length}</span> candidates
				</p>
			</div>
		</div>
	);
}
