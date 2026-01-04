import { settingsApi } from "../api/settings.api";

export interface UploadProgress {
	progress: number;
	uploadedSize: number;
	totalSize: number;
	status: "idle" | "uploading" | "finalizing" | "completed" | "error";
	error?: string;
}

export interface ChunkedUploadOptions {
	onProgress?: (progress: UploadProgress) => void;
	chunkSize?: number; // Default: 5MB
}

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload a file using chunked upload with progress tracking
 */
export const uploadFileChunked = async (
	file: File,
	options: ChunkedUploadOptions = {}
): Promise<{ promoVideo: string; videoUrl: string }> => {
	const { onProgress, chunkSize = DEFAULT_CHUNK_SIZE } = options;

	let sessionId: string | null = null;

	try {
		// Update progress: initiating
		onProgress?.({
			progress: 0,
			uploadedSize: 0,
			totalSize: file.size,
			status: "idle",
		});

		// Step 1: Initiate upload session
		const initiateResponse = await settingsApi.initiatePromoVideoUpload(
			file.name,
			file.size,
			file.type
		);
		sessionId = initiateResponse.data.sessionId;
		const serverChunkSize = initiateResponse.data.chunkSize;

		// Use server's chunk size if provided
		const actualChunkSize = serverChunkSize || chunkSize;

		// Step 2: Upload chunks
		const totalChunks = Math.ceil(file.size / actualChunkSize);
		let uploadedBytes = 0;

		for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
			const start = chunkIndex * actualChunkSize;
			const end = Math.min(start + actualChunkSize, file.size);
			const chunk = file.slice(start, end);

			// Update progress: uploading
			onProgress?.({
				progress: (uploadedBytes / file.size) * 100,
				uploadedSize: uploadedBytes,
				totalSize: file.size,
				status: "uploading",
			});

			// Upload chunk with retry logic
			let retries = 3;
			let lastError: Error | null = null;

			while (retries > 0) {
				try {
					const chunkResponse = await settingsApi.uploadPromoVideoChunk(
						sessionId,
						chunkIndex,
						chunk
					);
					uploadedBytes = chunkResponse.data.uploadedSize;
					break;
				} catch (error) {
					lastError = error as Error;
					retries--;
					if (retries > 0) {
						// Wait before retry (exponential backoff)
						await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - retries)));
					}
				}
			}

			if (retries === 0 && lastError) {
				throw new Error(`Failed to upload chunk ${chunkIndex + 1}/${totalChunks}: ${lastError.message}`);
			}
		}

		// Update progress: finalizing
		onProgress?.({
			progress: 100,
			uploadedSize: file.size,
			totalSize: file.size,
			status: "finalizing",
		});

		// Step 3: Finalize upload
		const finalizeResponse = await settingsApi.finalizePromoVideoUpload(sessionId);

		// Update progress: completed
		onProgress?.({
			progress: 100,
			uploadedSize: file.size,
			totalSize: file.size,
			status: "completed",
		});

		return finalizeResponse.data;
	} catch (error) {
		// Cancel upload on error
		if (sessionId) {
			try {
				await settingsApi.cancelPromoVideoUpload(sessionId);
			} catch {
				// Ignore cancel errors
			}
		}

		const errorMessage = error instanceof Error ? error.message : "Upload failed";
		onProgress?.({
			progress: 0,
			uploadedSize: 0,
			totalSize: file.size,
			status: "error",
			error: errorMessage,
		});

		throw error;
	}
};

