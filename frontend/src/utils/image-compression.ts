/**
 * Compress an image file to a maximum file size
 * @param file - The image file to compress
 * @param maxSizeBytes - Maximum file size in bytes (default: 1MB)
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1920)
 * @param quality - Initial quality (0-1, default: 0.9)
 * @returns Promise<File> - Compressed image file
 */
export const compressImage = async (
	file: File,
	maxSizeBytes: number = 1024 * 1024, // 1MB default
	maxWidth: number = 1920,
	maxHeight: number = 1920,
	quality: number = 0.9
): Promise<File> => {
	return new Promise((resolve, reject) => {
		// If file is already small enough, return as-is
		if (file.size <= maxSizeBytes) {
			resolve(file);
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				// Calculate new dimensions
				let width = img.width;
				let height = img.height;

				if (width > maxWidth || height > maxHeight) {
					const ratio = Math.min(maxWidth / width, maxHeight / height);
					width = width * ratio;
					height = height * ratio;
				}

				// Create canvas
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(new Error("Could not get canvas context"));
					return;
				}

				// Draw image on canvas
				ctx.drawImage(img, 0, 0, width, height);

				// Try to compress with different quality levels
				const tryCompress = (currentQuality: number): void => {
					canvas.toBlob(
						(blob) => {
							if (!blob) {
								reject(new Error("Failed to compress image"));
								return;
							}

							// If blob is small enough or quality is too low, return it
							if (blob.size <= maxSizeBytes || currentQuality <= 0.1) {
								const compressedFile = new File([blob], file.name, {
									type: file.type || "image/jpeg",
									lastModified: Date.now(),
								});
								resolve(compressedFile);
							} else {
								// Try with lower quality
								tryCompress(currentQuality - 0.1);
							}
						},
						file.type || "image/jpeg",
						currentQuality
					);
				};

				// Start compression with initial quality
				tryCompress(quality);
			};

			img.onerror = () => {
				reject(new Error("Failed to load image"));
			};

			if (e.target?.result) {
				img.src = e.target.result as string;
			} else {
				reject(new Error("Failed to read file"));
			}
		};

		reader.onerror = () => {
			reject(new Error("Failed to read file"));
		};

		reader.readAsDataURL(file);
	});
};

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

