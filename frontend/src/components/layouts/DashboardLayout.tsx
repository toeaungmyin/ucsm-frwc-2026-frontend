import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '../../stores/auth.store';
import {
	HiChartPie,
	HiViewBoards,
	HiUserGroup,
	HiTicket,
	HiLogout,
	HiMenuAlt2,
	HiX,
	HiChevronDown,
	HiChartBar,
	HiCog,
} from "react-icons/hi";
import { useState } from "react";

const navItems = [
	{ path: "/dashboard", label: "Dashboard", icon: HiChartPie },
	{ path: "/dashboard/voting-stats", label: "Voting Stats", icon: HiChartBar },
	{ path: "/dashboard/categories", label: "Categories", icon: HiViewBoards },
	{ path: "/dashboard/candidates", label: "Candidates", icon: HiUserGroup },
	{ path: "/dashboard/tickets", label: "Tickets", icon: HiTicket },
	{ path: "/dashboard/settings", label: "Settings", icon: HiCog },
];

export function DashboardLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const { admin, logout } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();

	const handleLogout = () => {
		logout();
		navigate({ to: "/login" });
	};

	const isActive = (path: string) => {
		if (path === "/dashboard") {
			return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
		}
		return location.pathname.startsWith(path);
	};

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Navbar */}
			<nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm">
				<div className="flex items-center justify-between h-full px-4">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setSidebarOpen(!sidebarOpen)}
							className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
						>
							{sidebarOpen ? <HiX className="h-5 w-5" /> : <HiMenuAlt2 className="h-5 w-5" />}
						</button>
						<div className="flex items-center justify-center gap-2">
							<span className="text-xl font-bold text-gray-900">UCSM FRESHER WELCOME</span>
							<span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
								2025 - 2026
							</span>
						</div>
					</div>

					{/* User Menu */}
					<div className="relative">
						<button
							onClick={() => setUserMenuOpen(!userMenuOpen)}
							className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
								<span className="text-sm font-medium text-white">
									{admin?.username?.charAt(0).toUpperCase() || "A"}
								</span>
							</div>
							<span className="hidden sm:block text-sm font-medium">{admin?.username}</span>
							<HiChevronDown className="h-4 w-4" />
						</button>

						{userMenuOpen && (
							<>
								<div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
								<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
									<div className="px-4 py-2 border-b border-gray-100">
										<p className="text-sm font-medium text-gray-900">{admin?.username}</p>
										<p className="text-xs text-gray-500">Administrator</p>
									</div>
									<button
										onClick={handleLogout}
										className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
									>
										<HiLogout className="h-4 w-4" />
										Sign out
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</nav>

			{/* Sidebar */}
			<aside
				className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex flex-col h-full">
					<nav className="flex-1 p-4 space-y-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							const active = isActive(item.path);
							return (
								<Link
									key={item.path}
									to={item.path}
									className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
										active
											? "bg-blue-50 text-blue-700"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
									}`}
								>
									<Icon className={`h-5 w-5 ${active ? "text-blue-600" : "text-gray-400"}`} />
									{item.label}
								</Link>
							);
						})}
					</nav>

					{/* Sidebar Footer */}
					<div className="p-4 border-t border-gray-200">
						<p className="text-xs text-gray-400 text-center">UCSM FRWC 2026</p>
					</div>
				</div>
			</aside>

			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
			)}

			{/* Main Content */}
			<main className={`pt-16 min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-0"}`}>
				<div className="p-6">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
