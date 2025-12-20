import { Client } from "minio";
import { env } from "@/config/index.js";
import { Readable } from "stream";

// MinIO client instance
const minioClient = new Client({
	endPoint: env.MINIO_ENDPOINT,
	port: parseInt(env.MINIO_PORT),
	useSSL: env.MINIO_USE_SSL === "true",
	accessKey: env.MINIO_ACCESS_KEY,
	secretKey: env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = env.MINIO_BUCKET;

/**
 * Initialize MinIO bucket if it doesn't exist
 */
export const initializeBucket = async (): Promise<void> => {
	try {
		const bucketExists = await minioClient.bucketExists(BUCKET_NAME);

		if (!bucketExists) {
			await minioClient.makeBucket(BUCKET_NAME);
			console.log(`✅ MinIO bucket "${BUCKET_NAME}" created successfully`);

			// Set bucket policy to allow public read access (optional)
			const policy = {
				Version: "2012-10-17",
				Statement: [
					{
						Effect: "Allow",
						Principal: { AWS: ["*"] },
						Action: ["s3:GetObject"],
						Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
					},
				],
			};
			await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
		} else {
			console.log(`✅ MinIO bucket "${BUCKET_NAME}" already exists`);
		}
	} catch (error) {
		console.error("❌ MinIO initialization error:", error);
		throw error;
	}
};

/**
 * Upload a file to MinIO
 */
export const uploadFile = async (
	fileName: string,
	fileBuffer: Buffer,
	contentType: string,
	folder?: string
): Promise<string> => {
	const objectName = folder ? `${folder}/${fileName}` : fileName;

	await minioClient.putObject(BUCKET_NAME, objectName, fileBuffer, fileBuffer.length, {
		"Content-Type": contentType,
	});

	return objectName;
};

/**
 * Upload a file from a readable stream
 */
export const uploadStream = async (
	fileName: string,
	stream: Readable,
	size: number,
	contentType: string,
	folder?: string
): Promise<string> => {
	const objectName = folder ? `${folder}/${fileName}` : fileName;

	await minioClient.putObject(BUCKET_NAME, objectName, stream, size, {
		"Content-Type": contentType,
	});

	return objectName;
};

/**
 * Get a file from MinIO
 */
export const getFile = async (objectName: string): Promise<Readable> => {
	return await minioClient.getObject(BUCKET_NAME, objectName);
};

/**
 * Get file stats/metadata
 */
export const getFileStats = async (objectName: string) => {
	return await minioClient.statObject(BUCKET_NAME, objectName);
};

/**
 * Delete a file from MinIO
 */
export const deleteFile = async (objectName: string): Promise<void> => {
	await minioClient.removeObject(BUCKET_NAME, objectName);
};

/**
 * Delete multiple files from MinIO
 */
export const deleteFiles = async (objectNames: string[]): Promise<void> => {
	await minioClient.removeObjects(BUCKET_NAME, objectNames);
};

/**
 * Generate a presigned URL for file download
 */
export const getPresignedUrl = async (
	objectName: string,
	expirySeconds: number = 3600
): Promise<string> => {
	return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expirySeconds);
};

/**
 * Generate a presigned URL for file upload
 */
export const getPresignedUploadUrl = async (
	objectName: string,
	expirySeconds: number = 3600
): Promise<string> => {
	return await minioClient.presignedPutObject(BUCKET_NAME, objectName, expirySeconds);
};

/**
 * List all files in a folder/prefix
 */
export const listFiles = async (prefix?: string): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		const files: string[] = [];
		const stream = minioClient.listObjects(BUCKET_NAME, prefix, true);

		stream.on("data", (obj) => {
			if (obj.name) {
				files.push(obj.name);
			}
		});

		stream.on("error", reject);
		stream.on("end", () => resolve(files));
	});
};

/**
 * Check if a file exists
 */
export const fileExists = async (objectName: string): Promise<boolean> => {
	try {
		await minioClient.statObject(BUCKET_NAME, objectName);
		return true;
	} catch {
		return false;
	}
};

/**
 * Get the public URL for a file (if bucket has public read policy)
 */
export const getPublicUrl = (objectName: string): string => {
	const protocol = env.MINIO_USE_SSL === "true" ? "https" : "http";
	return `${protocol}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${BUCKET_NAME}/${objectName}`;
};

/**
 * Copy a file within MinIO
 */
export const copyFile = async (sourceObject: string, destObject: string): Promise<void> => {
	await minioClient.copyObject(BUCKET_NAME, destObject, `/${BUCKET_NAME}/${sourceObject}`);
};

// Export the MinIO client for advanced usage
export { minioClient, BUCKET_NAME };

