import { useRef, useState } from "react";
import { HiSelector, HiPhotograph, HiPencil, HiTrash } from "react-icons/hi";
import type { Category } from "../../types";

interface CategoriesDataTableProps {
	categories: Category[];
	onEdit: (category: Category) => void;
	onDelete: (category: Category) => void;
	onReorder: (orderedIds: string[]) => void;
	isReordering?: boolean;
}

export function CategoriesDataTable({
	categories,
	onEdit,
	onDelete,
	onReorder,
	isReordering = false,
}: CategoriesDataTableProps) {
	const [draggedId, setDraggedId] = useState<string | null>(null);
	const [dragOverId, setDragOverId] = useState<string | null>(null);
	const dragRef = useRef<{ startIndex: number; currentIndex: number } | null>(null);

	const handleDragStart = (e: React.DragEvent, categoryId: string, index: number) => {
		setDraggedId(categoryId);
		dragRef.current = { startIndex: index, currentIndex: index };
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", categoryId);
	};

	const handleDragOver = (e: React.DragEvent, categoryId: string, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		if (draggedId && categoryId !== draggedId) {
			setDragOverId(categoryId);
			if (dragRef.current) {
				dragRef.current.currentIndex = index;
			}
		}
	};

	const handleDragLeave = () => {
		setDragOverId(null);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();

		if (dragRef.current && dragRef.current.startIndex !== dragRef.current.currentIndex) {
			const newCategories = [...categories];
			const [draggedItem] = newCategories.splice(dragRef.current.startIndex, 1);
			newCategories.splice(dragRef.current.currentIndex, 0, draggedItem);

			const orderedIds = newCategories.map((cat) => cat.id);
			onReorder(orderedIds);
		}

		setDraggedId(null);
		setDragOverId(null);
		dragRef.current = null;
	};

	const handleDragEnd = () => {
		setDraggedId(null);
		setDragOverId(null);
		dragRef.current = null;
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
			{/* Drag hint */}
			<div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
				<p className="text-sm text-blue-700 flex items-center gap-2">
					<HiSelector className="h-4 w-4" />
					Drag and drop rows to reorder categories
				</p>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-gray-50 border-b border-gray-200">
							<th className="w-12 px-4 py-4"></th>
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Order
							</th>
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Category Name
							</th>
							<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Status
							</th>
							<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{categories.map((category, index) => (
							<tr
								key={category.id}
								draggable
								onDragStart={(e) => handleDragStart(e, category.id, index)}
								onDragOver={(e) => handleDragOver(e, category.id, index)}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								onDragEnd={handleDragEnd}
								className={`transition-all cursor-grab active:cursor-grabbing ${
									draggedId === category.id
										? "opacity-50 bg-blue-50"
										: dragOverId === category.id
										? "bg-blue-100 border-t-2 border-blue-500"
										: "hover:bg-gray-50"
								}`}
							>
								<td className="px-4 py-4">
									<HiSelector className="h-5 w-5 text-gray-400" />
								</td>
								<td className="px-6 py-4">
									<span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 font-semibold text-sm rounded-full">
										{category.order}
									</span>
								</td>
								<td className="px-6 py-4">
									<div className="flex gap-2 justify-start items-center">
										<div className="w-12 h-12 p-2 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
											{category.iconUrl ? (
												<img
													src={category.iconUrl}
													alt={`${category.name} icon`}
													className="w-full h-full object-cover"
												/>
											) : (
												<HiPhotograph className="w-5 h-5 text-gray-400" />
											)}
										</div>
										<span className="font-medium text-gray-900">{category.name}</span>
									</div>
								</td>
								<td className="px-6 py-4">
									<span
										className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
											category.isActive
												? "bg-green-100 text-green-700"
												: "bg-gray-100 text-gray-600"
										}`}
									>
										<span
											className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
												category.isActive ? "bg-green-500" : "bg-gray-400"
											}`}
										/>
										{category.isActive ? "Active" : "Inactive"}
									</span>
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center justify-end gap-2">
										<button
											onClick={() => onEdit(category)}
											className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
										>
											<HiPencil className="h-5 w-5" />
										</button>
										<button
											onClick={() => onDelete(category)}
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
				<div className="flex items-center justify-between">
					<p className="text-sm text-gray-600">
						Showing <span className="font-medium">{categories.length}</span> categories
					</p>
					{isReordering && (
						<p className="text-sm text-blue-600 flex items-center gap-2">
							<span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
							Saving order...
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

