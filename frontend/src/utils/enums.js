export const BillCategory = {
  ELECTRICITY: 'Electricity',
  WATER: 'Water',
  INTERNET: 'Internet',
  MOBILE: 'Mobile',
  GAS: 'Gas',
  RENT: 'Rent',
  SUBSCRIPTION: 'Subscription',
  INSURANCE: 'Insurance',
  CREDIT_CARD: 'Credit Card',
  OTHER: 'Other',
};

export const BillStatus = {
  PENDING: 'Pending',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
};

export const RecurrenceType = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  ONE_TIME: 'One Time',
};

export const PaymentStatus = {
  COMPLETED: 'Completed',
  NOT_COMPLETED: 'Pending',
};

export const AccountStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  BLOCKED: 'Blocked',
};

export const UserRole = {
  USER: 'User',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

// Styling maps for badges
export const BillStatusColors = {
  PENDING: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
  PAID: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  OVERDUE: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 pulse-overdue',
};

export const AccountStatusColors = {
  ACTIVE: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  INACTIVE: 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20',
  BLOCKED: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
};

export const RoleColors = {
  USER: 'bg-slate-100 text-slate-700 border-slate-200',
  ADMIN: 'bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20',
  SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
};
