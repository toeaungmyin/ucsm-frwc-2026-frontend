import { createRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { HiViewBoards, HiUsers, HiTicket, HiChartBar, HiArrowRight, HiRefresh, HiCheckCircle, HiClock } from 'react-icons/hi';
import { Route as dashboardRoute } from '../dashboard';
import { dashboardApi, type DashboardStats, type Activity } from '../../api/dashboard.api';

const quickActions = [
  {
    title: 'Manage Categories',
    description: 'Add, edit, or remove voting categories',
    icon: HiViewBoards,
    href: '/dashboard/categories',
    color: 'blue',
  },
  {
    title: 'Add Candidates',
    description: 'Register new candidates for voting',
    icon: HiUsers,
    href: '/dashboard/candidates',
    color: 'green',
  },
  {
    title: 'Generate Tickets',
    description: 'Create voting tickets for participants',
    icon: HiTicket,
    href: '/dashboard/tickets',
    color: 'purple',
  },
];

function getStatsConfig(data: DashboardStats | undefined) {
  const categoriesCount = data?.categories.total ?? 0;
  const categoriesActive = data?.categories.active ?? 0;
  const candidatesCount = data?.candidates ?? 0;
  const ticketsTotal = data?.tickets.total ?? 0;
  const ticketsUsed = data?.tickets.used ?? 0;
  const votesCount = data?.votes ?? 0;

  return [
    {
      label: 'Categories',
      value: categoriesCount.toString(),
      icon: HiViewBoards,
      bgColor: 'bg-blue-500',
      change: categoriesActive > 0 
        ? `${categoriesActive} active` 
        : 'No active categories',
    },
    {
      label: 'Candidates',
      value: candidatesCount.toString(),
      icon: HiUsers,
      bgColor: 'bg-green-500',
      change: candidatesCount > 0 
        ? `Across ${categoriesActive} categories` 
        : 'No candidates yet',
    },
    {
      label: 'Tickets',
      value: ticketsTotal.toString(),
      icon: HiTicket,
      bgColor: 'bg-purple-500',
      change: ticketsTotal > 0 
        ? `${ticketsUsed} used` 
        : 'No tickets generated',
    },
    {
      label: 'Total Votes',
      value: votesCount.toString(),
      icon: HiChartBar,
      bgColor: 'bg-orange-500',
      change: votesCount > 0 
        ? `From ${ticketsUsed} voters` 
        : 'Voting not started',
    },
  ];
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const activityConfig = {
  vote: {
    icon: HiCheckCircle,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  ticket: {
    icon: HiTicket,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  candidate: {
    icon: HiUsers,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  category: {
    icon: HiViewBoards,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
};

function ActivityItem({ activity }: { activity: Activity }) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-4 py-4">
      <div className={`p-2 rounded-lg ${config.bgColor}`}>
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-500 truncate">{activity.description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <HiClock className="h-3.5 w-3.5" />
        {getRelativeTime(activity.timestamp)}
      </div>
    </div>
  );
}

function DashboardHome() {
  const { data: statsData, isLoading: statsLoading, isError: statsError, refetch: refetchStats, isFetching: statsFetching } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const { data: activitiesData, isLoading: activitiesLoading, refetch: refetchActivities, isFetching: activitiesFetching } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: async () => {
      const response = await dashboardApi.getRecentActivities(10);
      return response.data;
    },
    refetchInterval: 30000,
  });

  const stats = getStatsConfig(statsData);
  const activities = activitiesData ?? [];
  const isFetching = statsFetching || activitiesFetching;

  const handleRefresh = () => {
    refetchStats();
    refetchActivities();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <HiRefresh className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  {statsLoading ? (
                    <div className="h-9 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : statsError ? (
                    <p className="text-3xl font-bold text-red-500 mt-1">--</p>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  )}
                  {statsLoading ? (
                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mt-2" />
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">{stat.change}</p>
                  )}
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-500 mt-1">Get started with common tasks</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
                green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
                purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
              };
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <div className={`p-3 rounded-lg transition-colors ${colorClasses[action.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <HiArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="px-6">
          {activitiesLoading ? (
            <div className="py-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiChartBar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-medium">No activity yet</h3>
              <p className="text-sm text-gray-500 mt-1">Activity will appear here once voting begins.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: DashboardHome,
});
