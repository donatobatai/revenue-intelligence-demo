export type Region = 'Americas' | 'EMEA' | 'APAC';

export type CustomerSegment = 
  | 'Tier 1 Financial Institutions' 
  | 'Global FinTech & Payments' 
  | 'Enterprise Web3 Protocols' 
  | 'Scaleup Cloud Native';

export type ProductFamily = 
  | 'Dedicated Compute & Nodes' 
  | 'High-Throughput RPC & Data APIs' 
  | 'Enterprise KMS & Security Fabric' 
  | 'Implementation & Architecture';

export type RevenueType = 
  | 'Recurring Subscription' 
  | 'Usage & Consumption' 
  | 'Enterprise License' 
  | 'Professional Services';

export type OpportunityStage = 
  | 'Qualifying' 
  | 'Technical Evaluation' 
  | 'Proposal & Quote' 
  | 'Negotiation & Legal' 
  | 'Closed Won' 
  | 'Closed Lost';

export type DealType = 'New Logo' | 'Expansion' | 'Renewal';

export type ScheduleStatus = 'Actual' | 'Committed' | 'Projected Weighted';

export type ForecastScenario = 'Conservative' | 'Base' | 'Aggressive';

export type TimeGrain = 'Month' | 'Quarter' | 'Year';

export interface Account {
  id: string;
  name: string;
  segment: CustomerSegment;
  region: Region;
  owner: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  status: 'Active' | 'Churned' | 'Prospect';
  firstContractDate: string;
  totalLtv: number;
}

export interface Opportunity {
  id: string;
  accountId: string;
  accountName: string;
  name: string;
  dealType: DealType;
  productFamily: ProductFamily;
  revenueType: RevenueType;
  stage: OpportunityStage;
  probability: number; // 0.0 to 1.0
  closeDate: string; // YYYY-MM-DD
  contractStartDate: string; // YYYY-MM-DD
  contractEndDate: string; // YYYY-MM-DD
  termMonths: number;
  tcv: number; // Total Contract Value
  acv: number; // Annual Contract Value
  mrr: number; // Monthly Recurring Revenue
  region: Region;
  segment: CustomerSegment;
  owner: string;
  pushCount: number;
  rampDays: number; // Days between close and first recognized revenue
}

export interface MonthlyRevenueScheduleItem {
  id: string;
  oppId: string;
  accountId: string;
  accountName: string;
  periodMonth: string; // YYYY-MM
  revenueType: RevenueType;
  productFamily: ProductFamily;
  region: Region;
  segment: CustomerSegment;
  owner: string;
  amount: number; // Recognized USD
  weightedAmount: number; // Amount * probability
  status: ScheduleStatus;
  isHistorical: boolean;
  stage: OpportunityStage;
  dealType: DealType;
}

export interface MonthlyTarget {
  periodMonth: string;
  region: Region;
  productFamily: ProductFamily;
  targetRevenue: number;
  targetArr: number;
}

export interface FilterState {
  search: string;
  region: Region | 'All';
  productFamily: ProductFamily | 'All';
  segment: CustomerSegment | 'All';
  dealType: DealType | 'All';
  owner: string | 'All';
  weightingMode: 'Weighted' | 'Unweighted' | 'Contracted Only';
  scenario: ForecastScenario;
  timeGrain: TimeGrain;
  selectedAccountId?: string | null;
  selectedOppId?: string | null;
}

export interface ArrBridgeItem {
  period: string;
  startingArr: number;
  newLogoArr: number;
  expansionArr: number;
  contractionArr: number;
  churnArr: number;
  endingArr: number;
  netRetentionRate: number; // percentage
}
