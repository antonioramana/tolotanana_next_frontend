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