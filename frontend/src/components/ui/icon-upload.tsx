import { useRef, useState } from "react";
import { HiPhotograph, HiCloudUpload, HiX } from "react-icons/hi";

interface IconUploadProps {
	currentIcon?: string | null;
	previewUrl?: string | null;
	onFileSelect: (file: File | null) => void;
	onRemove?: () => void;
	label?: string;
	hint?: string;
	accept?: string;
	maxSize?: number; // in MB
	disabled?: boolean;
}

export function IconUpload({
	currentIcon,
	previewUrl,
	onFileSelect,
	onRemove,
	label = "Icon",
	hint = "PNG, JPG, GIF, WebP or SVG. Max 5MB.",
	accept = "image/*",
	maxSize = 5,
	disabled = false,
}: IconUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const displayUrl = previewUrl || currentIcon;

	const validateFile = (file: File): boolean => {
		setError(null);

		// Check file size
		if (file.size > maxSize * 1024 * 1024) {
			setError(`File size must be less than ${maxSize}MB`);
			return false;
		}

		// Check file type
		if (accept !== "*" && !file.type.match(accept.replace("*", ".*"))) {
			setError("Invalid file type");
			return false;
		}

		return true;
	};

	const handleFile = (file: File) => {
		if (validateFile(file)) {
			onFileSelect(file);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFile(file);
		}
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (file) {
			handleFile(file);
		}
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		onFileSelect(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onRemove?.();
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="space-y-2">
			{label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

			{/* Drop Zone */}
			<div
				onClick={disabled ? undefined : handleClick}
				onDragEnter={disabled ? undefined : handleDragEnter}
				onDragLeave={disabled ? undefined : handleDragLeave}
				onDragOver={disabled ? undefined : handleDragOver}
				onDrop={disabled ? undefined : handleDrop}
				className={`relative rounded-lg border-2 border-dashed transition-all ${
					disabled
						? "cursor-not-allowed opacity-50 border-gray-300 bg-gray-50"
						: isDragging
						? "cursor-pointer border-blue-500 bg-blue-50"
						: error
						? "cursor-pointer border-red-300 bg-red-50"
						: displayUrl
						? "cursor-pointer border-gray-300 bg-gray-50"
						: "cursor-pointer border-gray-300 hover:border-gray-400 bg-white"
				}`}
			>
				{displayUrl ? (
					/* Preview State */
					<div className="relative p-4">
						<div className="flex items-center gap-4">
							<div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
								<img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">Image uploaded</p>
								<p className="text-xs text-gray-500 mt-1">Click to replace or drag a new file</p>
							</div>
							<button
								type="button"
								onClick={handleRemove}
								className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
							>
								<HiX className="w-5 h-5" />
							</button>
						</div>
					</div>
				) : (
					/* Upload State */
					<div className="p-6 text-center">
						<div
							className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
								isDragging ? "bg-blue-100" : "bg-gray-100"
							}`}
						>
							{isDragging ? (
								<HiCloudUpload className="w-6 h-6 text-blue-500 animate-bounce" />
							) : (
								<HiPhotograph className="w-6 h-6 text-gray-400" />
							)}
						</div>
						<div className="mt-4">
							<p className="text-sm text-gray-600">
								<span className="font-semibold text-blue-600 hover:text-blue-500">Click to upload</span>
								{" or drag and drop"}
							</p>
							<p className="text-xs text-gray-500 mt-1">{hint}</p>
						</div>
					</div>
				)}

				<input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
			</div>

			{/* Error Message */}
			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
}
