import { useState, useRef } from "react";
import { Modal } from "../ui/modal";
import { HiUpload, HiDocumentText, HiCheckCircle, HiXCircle } from "react-icons/hi";
import type { CandidateExportData, ImportCandidatesResult } from "../../api/candidates.api";

interface ImportCandidatesDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (candidates: Array<{ id: string; nomineeId: string; name: string; categoryId: string; image?: string | null }>, skipDuplicates: boolean) => void;
	isLoading: boolean;
	error?: Error | null;
	result?: ImportCandidatesResult | null;
}

interface ParsedFile {
	candidates: Array<{ id: string; nomineeId: string; name: string; categoryId: string; image?: string | null }>;
	totalCount: number;
	exportedAt?: string;
}

export function ImportCandidatesDialog({ isOpen, onClose, onImport, isLoading, error, result }: ImportCandidatesDialogProps) {
	const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
	const [parseError, setParseError] = useState<string | null>(null);
	const [skipDuplicates, setSkipDuplicates] = useState(true);
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const resetState = () => {
		setParsedFile(null);
		setParseError(null);
		setSkipDuplicates(true);
	};

	const handleClose = () => {
		resetState();
		onClose();
	};

	const parseFile = (file: File) => {
		setParseError(null);
		setParsedFile(null);

		if (!file.name.endsWith(".json")) {
			setParseError("Please upload a JSON file");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const data = JSON.parse(content) as CandidateExportData;

				if (!data.candidates || !Array.isArray(data.candidates)) {
					setParseError("Invalid backup file format: missing candidates array");
					return;
				}

				if (data.candidates.length === 0) {
					setParseError("Backup file contains no candidates");
					return;
				}

				// Validate candidate format (id, nomineeId, name, categoryId are required)
				const invalidCandidates = data.candidates.filter(
					(c) =>
						!c.id ||
						typeof c.id !== "string" ||
						!c.nomineeId ||
						typeof c.nomineeId !== "string" ||
						!c.name ||
						typeof c.name !== "string" ||
						!c.categoryId ||
						typeof c.categoryId !== "string"
				);
				if (invalidCandidates.length > 0) {
					setParseError(
						`Invalid candidate format found: ${invalidCandidates.length} candidates have invalid fields`
					);
					return;
				}

				setParsedFile({
					candidates: data.candidates.map((c) => ({
						id: c.id,
						nomineeId: c.nomineeId,
						name: c.name,
						categoryId: c.categoryId,
						image: c.image || null,
					})),
					totalCount: data.candidates.length,
					exportedAt: data.exportedAt,
				});
			} catch {
				setParseError("Failed to parse JSON file. Please ensure it's a valid backup file.");
			}
		};
		reader.onerror = () => {
			setParseError("Failed to read file");
		};
		reader.readAsText(file);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			parseFile(file);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file) {
			parseFile(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = () => {
		setIsDragOver(false);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (parsedFile) {
			onImport(parsedFile.candidates, skipDuplicates);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Import Candidates">
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Success Result */}
				{result && (
					<div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
						<HiCheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
						<div>
							<p className="text-sm text-green-800 font-medium">Import Successful</p>
							<p className="text-sm text-green-600 mt-1">
								{result.imported} candidates imported
								{result.skipped > 0 && `, ${result.skipped} duplicates skipped`}
							</p>
						</div>
					</div>
				)}

				{/* Info Banner */}
				{!result && (
					<div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
						<HiUpload className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
						<div>
							<p className="text-sm text-blue-800 font-medium">Import Backup</p>
							<p className="text-sm text-blue-600 mt-1">
								Upload a previously exported candidates backup file to restore candidates.
							</p>
						</div>
					</div>
				)}

				{/* File Upload Area */}
				{!result && (
					<div
						onClick={() => fileInputRef.current?.click()}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
							isDragOver
								? "border-indigo-400 bg-indigo-50"
								: parsedFile
								? "border-green-300 bg-green-50"
								: "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
						}`}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							onChange={handleFileSelect}
							className="hidden"
						/>
						{parsedFile ? (
							<div className="space-y-2">
								<HiDocumentText className="h-12 w-12 text-green-600 mx-auto" />
								<p className="text-sm font-medium text-green-800">File loaded successfully</p>
								<p className="text-sm text-green-600">
									{parsedFile.totalCount} candidates ready to import
								</p>
								{parsedFile.exportedAt && (
									<p className="text-xs text-green-500">
										Exported on: {new Date(parsedFile.exportedAt).toLocaleString()}
									</p>
								)}
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										resetState();
									}}
									className="mt-2 text-sm text-gray-600 hover:text-gray-800 underline"
								>
									Choose different file
								</button>
							</div>
						) : (
							<div className="space-y-2">
								<HiUpload className="h-12 w-12 text-gray-400 mx-auto" />
								<p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
								<p className="text-xs text-gray-500">JSON backup file only</p>
							</div>
						)}
					</div>
				)}

				{/* Parse Error */}
				{parseError && (
					<div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
						<HiXCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
						<p className="text-sm text-red-600">{parseError}</p>
					</div>
				)}

				{/* Options */}
				{parsedFile && !result && (
					<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
						<input
							type="checkbox"
							id="skipDuplicates"
							checked={skipDuplicates}
							onChange={(e) => setSkipDuplicates(e.target.checked)}
							className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
						/>
						<label htmlFor="skipDuplicates" className="text-sm text-gray-700">
							Skip duplicate candidates (recommended)
						</label>
					</div>
				)}

				{/* API Error */}
				{error && (
					<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-600">
							{error instanceof Error ? error.message : "Failed to import candidates"}
						</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex items-center gap-3 pt-2">
					<button
						type="button"
						onClick={handleClose}
						className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
					>
						{result ? "Close" : "Cancel"}
					</button>
					{!result && (
						<button
							type="submit"
							disabled={isLoading || !parsedFile}
							className="flex-1 px-4 py-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors font-medium"
						>
							{isLoading ? "Importing..." : `Import ${parsedFile?.totalCount ?? 0} Candidates`}
						</button>
					)}
				</div>
			</form>
		</Modal>
	);
}

