import { QRCodeSVG } from "qrcode.react";
import ucsmLogo from "../../assets/ucsm.png";

interface TicketCardProps {
	id: string; // Ticket UUID for QR code URL
	serial: string;
}

// Get the base URL for QR codes (client-facing URL)
const getTicketUrl = (ticketId: string): string => {
	const baseUrl = import.meta.env.VITE_CLIENT_URL || window.location.origin;
	return `${baseUrl}/?ticket=${ticketId}`;
};

// Modern ticket design
// Using inline styles with solid colors for html2canvas compatibility
export function TicketCard({ id, serial }: TicketCardProps) {
	return (
		<div
			style={{
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				borderRadius: "6px",
				padding: "3px",
				height: "100%",
				boxSizing: "border-box",
			}}
		>
			{/* Inner card */}
			<div
				style={{
					backgroundColor: "#ffffff",
					borderRadius: "4px",
					padding: "8px",
					height: "100%",
					boxSizing: "border-box",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "space-between",
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Decorative bubbles */}
				<div
					style={{
						position: "absolute",
						top: "-20px",
						right: "-20px",
						width: "55px",
						height: "55px",
						borderRadius: "50%",
						backgroundColor: "rgba(102, 126, 234, 0.12)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						bottom: "-15px",
						left: "-15px",
						width: "45px",
						height: "45px",
						borderRadius: "50%",
						backgroundColor: "rgba(118, 75, 162, 0.1)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "-8px",
						width: "20px",
						height: "20px",
						borderRadius: "50%",
						backgroundColor: "rgba(102, 126, 234, 0.08)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						bottom: "40px",
						right: "-5px",
						width: "15px",
						height: "15px",
						borderRadius: "50%",
						backgroundColor: "rgba(118, 75, 162, 0.12)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						top: "40%",
						right: "3px",
						width: "8px",
						height: "8px",
						borderRadius: "50%",
						backgroundColor: "rgba(102, 126, 234, 0.2)",
					}}
				/>

				{/* Logo */}
				<img
					src={ucsmLogo}
					alt="UCSM"
					style={{
						width: "32px",
						height: "32px",
						objectFit: "contain",
						zIndex: 1,
					}}
				/>

				{/* Header */}
				<div style={{ textAlign: "center", zIndex: 1 }}>
					<h3
						style={{
							fontSize: "8px",
							fontWeight: "800",
							color: "#667eea",
							letterSpacing: "0.03em",
							margin: 0,
							lineHeight: 1.2,
							textTransform: "uppercase",
						}}
					>
						UCSM Fresher Welcome
					</h3>
					<p
						style={{
							fontSize: "10px",
							fontWeight: "900",
							color: "#4c1d95",
							margin: "1px 0 0 0",
							lineHeight: 1,
						}}
					>
						2026
					</p>
				</div>

				{/* QR Code Container */}
				<div
					style={{
						backgroundColor: "#ffffff",
						padding: "6px",
						borderRadius: "6px",
						border: "2px solid #e5e7eb",
						zIndex: 1,
					}}
				>
					<QRCodeSVG
						value={getTicketUrl(id)}
						size={55}
						level="M"
						includeMargin={false}
						fgColor="#1e1b4b"
					/>
				</div>

				{/* Serial Number Badge */}
				<div
					style={{
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						padding: "2px 10px 2px 10px",
						borderRadius: "10px",
						zIndex: 1,
						textAlign: "center",
					}}
				>
					<span
						style={{
							fontSize: "11px",
							fontWeight: "700",
							color: "#ffffff",
							letterSpacing: "0.1em",
						}}
					>
						{serial}
					</span>
				</div>
			</div>
		</div>
	);
}
