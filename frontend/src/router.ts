import { createRouter } from "@tanstack/react-router";
import { rootRoute } from "./routes/__root";
import { Route as loginRoute } from "./routes/login";
import { Route as dashboardRoute } from "./routes/dashboard";
import { Route as dashboardIndexRoute } from "./routes/dashboard/index";
import { Route as dashboardCategoriesRoute } from "./routes/dashboard/categories";
import { Route as dashboardCandidatesRoute } from "./routes/dashboard/candidates";
import { Route as dashboardTicketsRoute } from "./routes/dashboard/tickets";
import { Route as dashboardTicketsPrintRoute } from "./routes/dashboard/tickets-print";
import { Route as dashboardVotingStatsRoute } from "./routes/dashboard/voting-stats";
import { Route as dashboardSettingsRoute } from "./routes/dashboard/settings";
// Client routes
import { Route as clientHomeRoute } from "./routes/client/index";
import { Route as clientCategoryRoute } from "./routes/client/category";

const routeTree = rootRoute.addChildren([
	// Client routes (public)
	clientHomeRoute,
	clientCategoryRoute,
	loginRoute,
	// Admin routes
	dashboardRoute.addChildren([
		dashboardIndexRoute,
		dashboardCategoriesRoute,
		dashboardCandidatesRoute,
		dashboardTicketsRoute,
		dashboardTicketsPrintRoute,
		dashboardVotingStatsRoute,
		dashboardSettingsRoute,
	]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
