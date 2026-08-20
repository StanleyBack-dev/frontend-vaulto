export const MY_REFERRAL_STATS_QUERY = `
  query MyReferralStats {
    myReferralStats {
      referralCode
      qualifiedReferralsCount
      creditAmountCents
      minWithdrawalCents
      creditHoldDays
      availableBalanceCents
      pendingHoldBalanceCents
    }
  }
`;

export const MY_REFERRAL_WITHDRAWALS_QUERY = `
  query MyReferralWithdrawals {
    myReferralWithdrawals {
      idReferralWithdrawal
      amountCents
      status
      requestedAt
      processedAt
    }
  }
`;

export const LOOKUP_REFERRAL_WITHDRAWAL_PIX_KEY_QUERY = `
  query LookupReferralWithdrawalPixKey($input: LookupPixKeyInputDto!) {
    lookupReferralWithdrawalPixKey(input: $input) {
      bankName
      ownerName
      ownerDocument
    }
  }
`;

export const REQUEST_REFERRAL_WITHDRAWAL_MUTATION = `
  mutation RequestReferralWithdrawal($input: RequestReferralWithdrawalInputDto!) {
    requestReferralWithdrawal(input: $input) {
      idReferralWithdrawal
      amountCents
      status
      requestedAt
      processedAt
    }
  }
`;

export const MY_REFERRALS_QUERY = `
  query MyReferrals {
    myReferrals {
      name
      email
      qualifiedAt
    }
  }
`;

export const SEND_REFERRAL_INVITE_MUTATION = `
  mutation SendReferralInvite($input: SendReferralInviteInputDto!) {
    sendReferralInvite(input: $input)
  }
`;
