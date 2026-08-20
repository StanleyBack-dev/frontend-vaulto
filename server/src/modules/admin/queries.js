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

export const ADMIN_REFERRAL_STATS_QUERY = `
  query AdminReferralStats {
    adminReferralStats {
      totalReferredUsers
      totalQualifiedReferrals
      creditAmountCents
      totalCreditsGrantedCents
      totalClawedBackCents
      totalWithdrawnCents
      totalPendingWithdrawalCents
      totalFailedWithdrawalCents
      totalOutstandingLiabilityCents
    }
  }
`;

export const ADMIN_REFERRAL_TREND_QUERY = `
  query AdminReferralTrend($input: AdminReferralTrendInputDto!) {
    adminReferralTrend(input: $input) {
      month
      qualifiedReferrals
      creditsGrantedCents
    }
  }
`;

export const ADMIN_REFERRAL_LEADERBOARD_QUERY = `
  query AdminReferralLeaderboard {
    adminReferralLeaderboard {
      idUsers
      name
      email
      qualifiedReferralsCount
      totalCreditsGrantedCents
      availableBalanceCents
    }
  }
`;
