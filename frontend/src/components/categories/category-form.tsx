import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconUpload } from "../ui/icon-upload";

const categorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	isActive: z.boolean(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
	defaultValues?: Partial<CategoryFormData>;
	currentIcon?: string | null;
	onSubmit: (data: CategoryFormData, iconFile: File | null, removeIcon: boolean) => void;
	onCancel: () => void;
	isLoading: boolean;
	submitLabel: string;
}

export function CategoryForm({
	defaultValues,
	currentIcon,
	onSubmit,
	onCancel,
	isLoading,
	submitLabel,
}: CategoryFormProps) {
	const [iconFile, setIconFile] = useState<File | null>(null);
	const [iconPreview, setIconPreview] = useState<string | null>(null);
	const [removeIcon, setRemoveIcon] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CategoryFormData>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: "",
			isActive: true,
			...defaultValues,
		},
	});

	const handleFileSelect = (file: File | null) => {
		setIconFile(file);
		setRemoveIcon(false);

		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setIconPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setIconPreview(null);
		}
	};

	const handleRemoveIcon = () => {
		setRemoveIcon(true);
		setIconFile(null);
		setIconPreview(null);
	};

	const onFormSubmit = (data: CategoryFormData) => {
		onSubmit(data, iconFile, removeIcon);
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
			{/* Icon Upload */}
			<IconUpload
				currentIcon={removeIcon ? null : currentIcon}
				previewUrl={iconPreview}
				onFileSelect={handleFileSelect}
				onRemove={currentIcon ? handleRemoveIcon : undefined}
			/>

			{/* Name Input */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
				<input
					type="text"
					{...register("name")}
					className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						errors.name ? "border-red-500" : "border-gray-300"
					}`}
					placeholder="Enter category name"
				/>
				{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
			</div>

			{/* Active Checkbox */}
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="isActive"
					{...register("isActive")}
					className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
				/>
				<label htmlFor="isActive" className="text-sm font-medium text-gray-700">
					Active
				</label>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-3 pt-4">
				<button
					type="button"
					onClick={onCancel}
					className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isLoading}
					className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
				>
					{isLoading ? "Saving..." : submitLabel}
				</button>
			</div>
		</form>
	);
}

