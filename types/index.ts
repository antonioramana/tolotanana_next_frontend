export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'demandeur' | 'donateur' | 'admin';
  avatar?: string;
  phone?: string;
  createdAt: string;
  isVerified: boolean;
  bankInfo?: BankInfo[];
}

export interface BankInfo {
  id: string;
  type: 'mobile_money' | 'bank_account';
  accountNumber: string;
  accountName: string;
  provider: string;
  isDefault: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: string;//AUTRE TABLE
  images: string[];
  video?: string;
  deadline: string;
  createdAt: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdBy: string;
  createdByName: string;
  rating: number;
  totalDonors: number;
  updates: CampaignUpdate[];
  isVerified: boolean;
 
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  images?: string[];
}

export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorId?: string;
  donorName: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface WithdrawalRequest {
  id: string;
  campaignId: string;
  campaignTitle: string;
  requestedBy: string;
  amount: number;
  bankInfo: BankInfo;
  justification: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export interface PlatformFees {
  id: string;
  percentage: number;
  isActive: boolean;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreatePlatformFeesDto {
  percentage: number;
  description?: string;
}

export interface UpdatePlatformFeesDto {
  percentage?: number;
  description?: string;
  isActive?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
  replier?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateContactMessageDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ReplyContactMessageDto {
  reply: string;
}

export interface ContactStats {
  total: number;
  unread: number;
  replied: number;
  pending: number;
}

// Testimonials interfaces
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  content: string;
  campaign?: string;
  rating: number;
  isActive: boolean;
  isHighlight: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateTestimonialDto {
  name: string;
  role: string;
  avatar?: string;
  content: string;
  campaign?: string;
  rating: number;
  isActive?: boolean;
  isHighlight?: boolean;
}

export interface UpdateTestimonialDto {
  name?: string;
  role?: string;
  avatar?: string;
  content?: string;
  campaign?: string;
  rating?: number;
  isActive?: boolean;
  isHighlight?: boolean;
}

export interface TestimonialStats {
  total: number;
  active: number;
  highlighted: number;
  averageRating: number;
  byRole: Array<{
    role: string;
    count: number;
  }>;
}

export interface PublicTestimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  content: string;
  campaign?: string;
  rating: number;
  isHighlight: boolean;
  createdAt: string;
}

// Dashboard interfaces
export interface DashboardGeneralStats {
  totalCollected: number;
  platformFees: number;
  activeCampaigns: number;
  totalUsers: number;
  totalDonations: number;
  successRate: number;
}

export interface RevenueEvolutionData {
  month: string;
  monthName: string;
  totalCollected: number;
  platformFees: number;
  donationsCount: number;
}

export interface CampaignsByCategoryData {
  categoryName: string;
  campaignsCount: number;
  totalCollected: number;
  percentage: number;
}

export interface RecentLargeDonation {
  id: string;
  amount: number;
  campaignTitle: string;
  donorName: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface RecentCampaign {
  id: string;
  title: string;
  targetAmount: number;
  creatorName: string;
  categoryName: string;
  createdAt: string;
}

export interface RecentUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export interface GrowthEvolutionData {
  month: string;
  monthName: string;
  usersCount: number;
  campaignsCount: number;
}

export interface DashboardStats {
  generalStats: DashboardGeneralStats;
  revenueEvolution: RevenueEvolutionData[];
  campaignsByCategory: CampaignsByCategoryData[];
  recentLargeDonations: RecentLargeDonation[];
  recentCampaigns: RecentCampaign[];
  recentUsers: RecentUser[];
  growthEvolution: GrowthEvolutionData[];
}