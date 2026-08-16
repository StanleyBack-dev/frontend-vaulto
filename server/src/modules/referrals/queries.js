export const MY_REFERRAL_STATS_QUERY = `
  query MyReferralStats {
    myReferralStats {
      referralCode
      qualifiedReferralsCount
      thresholdCount
      rewardStatus
    }
  }
`;
