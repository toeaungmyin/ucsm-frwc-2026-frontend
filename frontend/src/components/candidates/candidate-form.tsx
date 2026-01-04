import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconUpload } from "../ui/icon-upload";
import type { Category } from "../../types";
import { compressImage } from "../../utils/image-compression";

const candidateSchema = z.object({
	nomineeId: z.string().min(1, "Nominee ID is required"),
	name: z.string().min(1, "Name is required"),
	category: z.string().min(1, "Category is required"),
});

export type CandidateFormData = z.infer<typeof candidateSchema>;

interface CandidateFormProps {
	defaultValues?: Partial<CandidateFormData>;
	currentImage?: string | null;
	categories: Category[];
	onSubmit: (data: CandidateFormData, imageFile: File | null, removeImage: boolean) => void;
	onCancel: () => void;
	isLoading: boolean;
	submitLabel: string;
}

export function CandidateForm({
	defaultValues,
	currentImage,
	categories,
	onSubmit,
	onCancel,
	isLoading,
	submitLabel,
}: CandidateFormProps) {
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [removeImage, setRemoveImage] = useState(false);
	const [isCompressing, setIsCompressing] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CandidateFormData>({
		resolver: zodResolver(candidateSchema),
		defaultValues: {
			nomineeId: "",
			name: "",
			category: "",
			...defaultValues,
		},
	});

	const activeCategories = categories.filter((cat) => cat.isActive);

	const handleFileSelect = async (file: File | null) => {
		if (!file) {
			setImageFile(null);
			setImagePreview(null);
			setRemoveImage(false);
			return;
		}

		setIsCompressing(true);
		setRemoveImage(false);

		try {
			// Compress image to max 1MB
			const compressedFile = await compressImage(file, 1024 * 1024); // 1MB

			setImageFile(compressedFile);

			// Create preview from compressed file
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(compressedFile);
		} catch (error) {
			console.error("Error compressing image:", error);
			// Fallback to original file if compression fails
			setImageFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		} finally {
			setIsCompressing(false);
		}
	};

	const handleRemoveImage = () => {
		setRemoveImage(true);
		setImageFile(null);
		setImagePreview(null);
	};

	const onFormSubmit = (data: CandidateFormData) => {
		onSubmit(data, imageFile, removeImage);
	};

	return (
		<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
			{/* Image Upload */}
			<IconUpload
				label="Photo"
				hint="Upload candidate photo. PNG, JPG, WebP. Will be compressed to max 1MB."
				currentIcon={removeImage ? null : currentImage}
				previewUrl={imagePreview}
				onFileSelect={handleFileSelect}
				onRemove={currentImage ? handleRemoveImage : undefined}
				disabled={isCompressing}
			/>
			{isCompressing && <p className="text-sm text-blue-600 mt-1">Compressing image...</p>}

			{/* Nominee ID Input */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Nominee ID</label>
				<input
					type="text"
					{...register("nomineeId")}
					className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						errors.nomineeId ? "border-red-500" : "border-gray-300"
					}`}
					placeholder="Enter nominee ID"
				/>
				{errors.nomineeId && <p className="mt-1 text-sm text-red-600">{errors.nomineeId.message}</p>}
			</div>

			{/* Name Input */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
				<input
					type="text"
					{...register("name")}
					className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						errors.name ? "border-red-500" : "border-gray-300"
					}`}
					placeholder="Enter candidate name"
				/>
				{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
			</div>

			{/* Category Select */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
				<select
					{...register("category")}
					className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
						errors.category ? "border-red-500" : "border-gray-300"
					}`}
				>
					<option value="">Select a category</option>
					{activeCategories.map((category) => (
						<option key={category.id} value={category.name}>
							{category.name}
						</option>
					))}
				</select>
				{errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
				{activeCategories.length === 0 && (
					<p className="mt-1 text-sm text-amber-600">
						No active categories available. Please create a category first.
					</p>
				)}
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
					disabled={isLoading || activeCategories.length === 0}
					className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
				>
					{isLoading ? "Saving..." : submitLabel}
				</button>
			</div>
		</form>
	);
}
