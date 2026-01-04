import { createRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useRef } from "react";
import { uploadFileChunked, type UploadProgress } from "../../utils/chunked-upload";
import {
	HiCog,
	HiRefresh,
	HiCheck,
	HiX,
	HiPause,
	HiExclamation,
	HiCalendar,
	HiClock,
	HiLightningBolt,
	HiShieldCheck,
	HiStatusOnline,
	HiUpload,
	HiTrash,
	HiVideoCamera,
	HiPlay,
} from "react-icons/hi";
import { Route as dashboardRoute } from "../dashboard";
import { settingsApi } from "../../api/settings.api";

function VotingToggle({
	enabled,
	onToggle,
	isLoading,
}: {
	enabled: boolean;
	onToggle: (enabled: boolean) => void;
	isLoading: boolean;
}) {
	return (
		<div className="relative overflow-hidden rounded-3xl">
			{/* Background Gradient */}
			<div
				className={`absolute inset-0 transition-all duration-500 ${
					enabled
						? "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600"
						: "bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800"
				}`}
			/>

			{/* Animated Glow Effect */}
			{enabled && (
				<div className="absolute inset-0 opacity-30">
					<div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
					<div className="absolute bottom-0 right-1/4 w-24 h-24 bg-emerald-200 rounded-full blur-2xl animate-pulse delay-300" />
				</div>
			)}

			<div className="relative p-8">
				{/* Status Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<div className={`p-4 rounded-2xl backdrop-blur-sm ${enabled ? "bg-white/20" : "bg-white/10"}`}>
							{enabled ? (
								<HiStatusOnline className="h-8 w-8 text-white" />
							) : (
								<HiPause className="h-8 w-8 text-gray-300" />
							)}
						</div>
						<div>
							<h3 className="text-2xl font-bold text-white">Voting Control</h3>
							<p className={`text-sm ${enabled ? "text-emerald-100" : "text-gray-400"}`}>
								{enabled ? "System is accepting votes" : "Voting is currently disabled"}
							</p>
						</div>
					</div>

					{/* Live Indicator */}
					<div
						className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
							enabled ? "bg-white/20" : "bg-white/10"
						}`}
					>
						{enabled && (
							<span className="relative flex h-3 w-3">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
								<span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
							</span>
						)}
						<span className={`text-sm font-semibold ${enabled ? "text-white" : "text-gray-400"}`}>
							{enabled ? "LIVE" : "OFFLINE"}
						</span>
					</div>
				</div>

				{/* Big Toggle Button */}
				<button
					onClick={() => onToggle(!enabled)}
					disabled={isLoading}
					className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] ${
						enabled
							? "bg-white text-red-600 hover:bg-red-50 shadow-xl shadow-black/20"
							: "bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl shadow-black/30"
					} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
				>
					{isLoading ? (
						<HiRefresh className="h-6 w-6 animate-spin" />
					) : enabled ? (
						<>
							<HiPause className="h-6 w-6" />
							Stop Voting
						</>
					) : (
						<>
							<HiLightningBolt className="h-6 w-6" />
							Start Voting
						</>
					)}
				</button>

				{/* Warning Banner */}
				{enabled && (
					<div className="mt-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-start gap-3">
						<HiExclamation className="h-5 w-5 text-yellow-300 shrink-0 mt-0.5" />
						<p className="text-sm text-white/90">
							<span className="font-semibold">Voting is active.</span> All authenticated voters can now
							cast their votes. Remember to disable voting when the event ends.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function PromoVideoUpload({
	videoUrl,
	onUpload,
	onDelete,
	isUploading,
	isDeleting,
	uploadProgress,
}: {
	videoUrl: string | null;
	onUpload: (file: File) => void;
	onDelete: () => void;
	isUploading: boolean;
	isDeleting: boolean;
	uploadProgress: UploadProgress | null;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onUpload(file);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file && file.type.startsWith("video/")) {
			onUpload(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
			<div className="p-6 bg-linear-to-r from-purple-50 to-pink-50 border-b border-gray-100">
				<div className="flex items-center gap-3">
					<div className="p-2.5 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl">
						<HiVideoCamera className="h-5 w-5 text-white" />
					</div>
					<div>
						<h2 className="text-xl font-bold text-gray-900">Promo Video</h2>
						<p className="text-sm text-gray-500">Upload a video to display on the voting page</p>
					</div>
				</div>
			</div>

			<div className="p-6">
				{/* Video Preview */}
				{videoUrl ? (
					<div className="space-y-4">
						<div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
							<video src={videoUrl} controls className="w-full h-full object-contain">
								Your browser does not support the video tag.
							</video>
							<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
								<HiPlay className="h-16 w-16 text-white/80" />
							</div>
						</div>
						<div className="flex items-center justify-between">
							<p className="text-sm text-gray-500 flex items-center gap-2">
								<HiCheck className="h-4 w-4 text-green-500" />
								Video uploaded successfully
							</p>
							<div className="flex items-center gap-3">
								<button
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading}
									className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
								>
									<HiRefresh className={`h-4 w-4 ${isUploading ? "animate-spin" : ""}`} />
									Replace
								</button>
								<button
									onClick={onDelete}
									disabled={isDeleting}
									className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
								>
									{isDeleting ? (
										<HiRefresh className="h-4 w-4 animate-spin" />
									) : (
										<HiTrash className="h-4 w-4" />
									)}
									Delete
								</button>
							</div>
						</div>
					</div>
				) : (
					/* Upload Zone */
					<div
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onClick={() => !isUploading && fileInputRef.current?.click()}
						className={`relative rounded-xl border-2 border-dashed transition-all ${
							isDragging
								? "border-purple-500 bg-purple-50 cursor-pointer"
								: isUploading
								? "border-purple-400 bg-purple-50 cursor-not-allowed"
								: "border-gray-300 hover:border-purple-400 hover:bg-gray-50 cursor-pointer"
						}`}
					>
						<div className="py-12 px-6 text-center">
							{isUploading ? (
								<>
									<div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
										<HiRefresh className="h-8 w-8 text-purple-600 animate-spin" />
									</div>
									<p className="text-lg font-semibold text-gray-900 mb-2">
										{uploadProgress?.status === "finalizing"
											? "Finalizing upload..."
											: "Uploading video..."}
									</p>
									{uploadProgress && (
										<div className="space-y-2 mb-4">
											{/* Progress Bar */}
											<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
												<div
													className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-300 ease-out"
													style={{ width: `${uploadProgress.progress}%` }}
												/>
											</div>
											{/* Progress Text */}
											<div className="flex items-center justify-between text-sm">
												<span className="text-gray-600 font-medium">
													{Math.round(uploadProgress.progress)}%
												</span>
												<span className="text-gray-500">
													{formatBytes(uploadProgress.uploadedSize)} /{" "}
													{formatBytes(uploadProgress.totalSize)}
												</span>
											</div>
										</div>
									)}
									{uploadProgress?.error && (
										<p className="text-sm text-red-600 mt-2">{uploadProgress.error}</p>
									)}
									{!uploadProgress?.error && (
										<p className="text-sm text-gray-500">
											{uploadProgress?.status === "finalizing"
												? "Almost done! Assembling your video..."
												: "Please wait while your video is being uploaded"}
										</p>
									)}
								</>
							) : (
								<>
									<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
										<HiUpload className="h-8 w-8 text-gray-400" />
									</div>
									<p className="text-lg font-semibold text-gray-900 mb-1">
										{isDragging ? "Drop video here" : "Upload promo video"}
									</p>
									<p className="text-sm text-gray-500 mb-4">Drag and drop or click to browse</p>
									<p className="text-xs text-gray-400">
										Supported formats: MP4, WebM, OGG, MOV • Large files supported with progress
										tracking
									</p>
								</>
							)}
						</div>
					</div>
				)}

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept="video/mp4,video/webm,video/ogg,video/quicktime"
					onChange={handleFileSelect}
					className="hidden"
				/>
			</div>
		</div>
	);
}

// Helper to format date for datetime-local input (local timezone)
const formatDateTimeLocal = (dateString: string | null): string => {
	if (!dateString) return "";
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to format bytes
const formatBytes = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

function SettingsPage() {
	const queryClient = useQueryClient();
	// Track local edits separately from server state
	const [localEdits, setLocalEdits] = useState<{
		eventName?: string;
		eventStartTime?: string;
	}>({});
	const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

	const {
		data: settings,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["settings"],
		queryFn: async () => {
			const response = await settingsApi.getSettings();
			return response.data;
		},
	});

	// Compute current form values (local edits override server values)
	const eventName = localEdits.eventName ?? settings?.eventName ?? "";
	const eventStartTime = localEdits.eventStartTime ?? formatDateTimeLocal(settings?.eventStartTime ?? null);

	// Calculate hasChanges
	const hasChanges = useMemo(() => {
		if (!settings) return false;
		const serverEventTime = formatDateTimeLocal(settings.eventStartTime);
		return (
			(localEdits.eventName !== undefined && localEdits.eventName !== settings.eventName) ||
			(localEdits.eventStartTime !== undefined && localEdits.eventStartTime !== serverEventTime)
		);
	}, [settings, localEdits]);

	const toggleMutation = useMutation({
		mutationFn: settingsApi.toggleVoting,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
		},
	});

	const updateMutation = useMutation({
		mutationFn: settingsApi.updateSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings"] });
			setLocalEdits({}); // Clear local edits after successful save
		},
	});

	const uploadVideoMutation = useMutation({
		mutationFn: async (file: File) => {
			// Use chunked upload for files larger than 10MB, otherwise use simple upload
			if (file.size > 10 * 1024 * 1024) {
				return await uploadFileChunked(file, {
					onProgress: (progress) => {
						setUploadProgress(progress);
					},
				});
			} else {
				// For smaller files, use the simple upload
				const response = await settingsApi.uploadPromoVideo(file);
				return response.data;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings"] });
			setUploadProgress(null);
		},
		onError: () => {
			setUploadProgress(null);
		},
	});

	const deleteVideoMutation = useMutation({
		mutationFn: settingsApi.deletePromoVideo,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings"] });
		},
	});

	const handleSave = () => {
		updateMutation.mutate({
			eventName,
			eventStartTime: eventStartTime ? new Date(eventStartTime).toISOString() : null,
		});
	};

	const handleReset = () => {
		setLocalEdits({}); // Clear local edits to restore server values
	};

	const handleEventNameChange = (value: string) => {
		setLocalEdits((prev) => ({ ...prev, eventName: value }));
	};

	const handleEventStartTimeChange = (value: string) => {
		setLocalEdits((prev) => ({ ...prev, eventStartTime: value }));
	};

	return (
		<div className="space-y-8 max-w-4xl">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-3 mb-1">
						<div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
							<HiShieldCheck className="h-6 w-6 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900">Event Control</h1>
					</div>
					<p className="text-gray-500 ml-14">Manage voting status and event configuration</p>
				</div>
				<button
					onClick={() => refetch()}
					disabled={isLoading}
					className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
				>
					<HiRefresh className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
					Refresh
				</button>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="space-y-6">
					<div className="h-56 bg-gradient-to-br from-gray-200 to-gray-100 rounded-3xl animate-pulse" />
					<div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
				</div>
			)}

			{/* Error State */}
			{isError && (
				<div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<HiX className="h-8 w-8 text-red-500" />
					</div>
					<p className="text-red-700 font-semibold text-lg">Failed to load settings</p>
					<p className="text-red-500 text-sm mt-1 mb-4">Please check your connection and try again</p>
					<button
						onClick={() => refetch()}
						className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
					>
						Retry
					</button>
				</div>
			)}

			{/* Settings Content */}
			{!isLoading && !isError && settings && (
				<>
					{/* Voting Control - Hero Section */}
					<VotingToggle
						enabled={settings.votingEnabled}
						onToggle={(enabled) => toggleMutation.mutate(enabled)}
						isLoading={toggleMutation.isPending}
					/>

					{/* Promo Video Upload */}
					<PromoVideoUpload
						videoUrl={settings.promoVideoUrl}
						onUpload={(file) => uploadVideoMutation.mutate(file)}
						onDelete={() => deleteVideoMutation.mutate()}
						isUploading={uploadVideoMutation.isPending}
						isDeleting={deleteVideoMutation.isPending}
						uploadProgress={uploadProgress}
					/>

					{/* Event Configuration Card */}
					<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
						<div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
									<HiCog className="h-5 w-5 text-white" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-gray-900">Event Configuration</h2>
									<p className="text-sm text-gray-500">Customize event details and timing</p>
								</div>
							</div>
						</div>

						<div className="p-6 space-y-6">
							{/* Event Name */}
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">Event Name</label>
								<input
									type="text"
									value={eventName}
									onChange={(e) => handleEventNameChange(e.target.value)}
									className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
									placeholder="Enter event name"
								/>
							</div>

							{/* Event Start Time */}
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									<div className="flex items-center gap-2">
										<HiCalendar className="h-4 w-4 text-indigo-500" />
										Countdown Target Time
									</div>
								</label>
								<input
									type="datetime-local"
									value={eventStartTime}
									onChange={(e) => handleEventStartTimeChange(e.target.value)}
									className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
								/>
								<p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
									<HiClock className="h-4 w-4" />
									Displayed to voters as the event countdown. Voting requires manual activation.
								</p>
							</div>

							{/* Metadata */}
							<div className="pt-4 border-t border-gray-100">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-500">Last modified</span>
									<span className="text-gray-700 font-medium">
										{new Date(settings.updatedAt).toLocaleString()}
									</span>
								</div>
							</div>

							{/* Action Buttons */}
							{hasChanges && (
								<div className="flex items-center gap-3 pt-4">
									<button
										onClick={handleSave}
										disabled={updateMutation.isPending}
										className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
									>
										{updateMutation.isPending ? (
											<HiRefresh className="h-5 w-5 animate-spin" />
										) : (
											<HiCheck className="h-5 w-5" />
										)}
										Save Changes
									</button>
									<button
										onClick={handleReset}
										disabled={updateMutation.isPending}
										className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
									>
										Cancel
									</button>
								</div>
							)}

							{/* Success Message */}
							{updateMutation.isSuccess && !hasChanges && (
								<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
									<HiCheck className="h-5 w-5 text-green-600" />
									<span className="text-sm font-medium text-green-700">
										Settings saved successfully
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Quick Guide */}
					<div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-indigo-100 rounded-lg">
								<HiLightningBolt className="h-5 w-5 text-indigo-600" />
							</div>
							<h3 className="font-bold text-indigo-900">Quick Start Guide</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{[
								{ step: "1", text: "Configure event name and countdown time" },
								{ step: "2", text: "Click 'Start Voting' when ready to begin" },
								{ step: "3", text: "Monitor results on the Voting Stats page" },
								{ step: "4", text: "Click 'Stop Voting' when the event ends" },
							].map((item) => (
								<div key={item.step} className="flex items-center gap-3">
									<div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-indigo-100">
										<span className="text-sm font-bold text-indigo-600">{item.step}</span>
									</div>
									<span className="text-sm text-indigo-800">{item.text}</span>
								</div>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export const Route = createRoute({
	getParentRoute: () => dashboardRoute,
	path: "/settings",
	component: SettingsPage,
});
