// Admin routes
export { authRoutes } from "./admin/auth/index.js";
export { categoriesRoutes } from "./admin/categories/index.js";
export { candidatesRoutes } from "./admin/candidates/index.js";
export { ticketRoutes } from "./admin/tickets/index.js";
export { dashboardRoutes } from "./admin/dashboard/index.js";
export { settingsRoutes } from "./admin/settings/index.js";

// Client routes
export {
	clientCategoriesRoutes,
	clientCandidatesRoutes,
	clientConfigRoutes,
	clientTicketsRoutes,
	clientVotesRoutes,
} from "./client/index.js";
