export const ADMIN_DASHBOARD_STATS_QUERY = `
  query AdminDashboardStats {
    adminDashboardStats {
      totalUsers
      usersByGroup {
        group
        count
      }
      totalSubscriptions
      freeSubscriptions
      activeProSubscriptions
      subscriptionsByStatus {
        status
        count
      }
      estimatedMonthlyRecurringRevenue
      totalSupportTickets
      openSupportTickets
      resolvedSupportTickets
    }
  }
`;
