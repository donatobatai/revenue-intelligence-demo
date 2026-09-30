import {
  Account,
  Opportunity,
  MonthlyRevenueScheduleItem,
  MonthlyTarget,
  Region,
  CustomerSegment,
  ProductFamily,
  RevenueType,
  OpportunityStage,
  DealType,
  ScheduleStatus
} from '../types/revenue';

// Simple deterministic PRNG (Mulberry32)
function createPrng(seed: number) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = createPrng(42079);

const REGIONS: Region[] = ['Americas', 'EMEA', 'APAC'];

const SEGMENTS: CustomerSegment[] = [
  'Tier 1 Financial Institutions',
  'Global FinTech & Payments',
  'Enterprise Web3 Protocols',
  'Scaleup Cloud Native'
];

const OWNERS_BY_REGION: Record<Region, string[]> = {
  'Americas': ['Elena Rostova', 'David Kalu', 'Sofia Morales'],
  'EMEA': ['Sarah Jenkins', 'Liam O\'Connor'],
  'APAC': ['Marcus Chen']
};

const ACCOUNT_NAMES: { name: string; segment: CustomerSegment; region: Region; tier: 'Tier 1' | 'Tier 2' | 'Tier 3' }[] = [
  { name: 'Apex Global Capital', segment: 'Tier 1 Financial Institutions', region: 'Americas', tier: 'Tier 1' },
  { name: 'Meridian Trust & Custody', segment: 'Tier 1 Financial Institutions', region: 'EMEA', tier: 'Tier 1' },
  { name: 'Beacon Financial Markets', segment: 'Tier 1 Financial Institutions', region: 'Americas', tier: 'Tier 1' },
  { name: 'Sovereign Clearing Corp', segment: 'Tier 1 Financial Institutions', region: 'EMEA', tier: 'Tier 1' },
  { name: 'Northstar Securities', segment: 'Tier 1 Financial Institutions', region: 'APAC', tier: 'Tier 1' },
  { name: 'Helios Asset Management', segment: 'Tier 1 Financial Institutions', region: 'Americas', tier: 'Tier 1' },
  { name: 'NovaPay Global Gateway', segment: 'Global FinTech & Payments', region: 'Americas', tier: 'Tier 1' },
  { name: 'Equinox Settlements', segment: 'Global FinTech & Payments', region: 'EMEA', tier: 'Tier 1' },
  { name: 'Vortex Remittance Corp', segment: 'Global FinTech & Payments', region: 'APAC', tier: 'Tier 2' },
  { name: 'Cobalt Payments Network', segment: 'Global FinTech & Payments', region: 'Americas', tier: 'Tier 2' },
  { name: 'Prism Treasury Labs', segment: 'Global FinTech & Payments', region: 'EMEA', tier: 'Tier 2' },
  { name: 'Paramount Digital Trading', segment: 'Global FinTech & Payments', region: 'Americas', tier: 'Tier 2' },
  { name: 'CipherStream Protocol', segment: 'Enterprise Web3 Protocols', region: 'Americas', tier: 'Tier 1' },
  { name: 'Aura Decentralized Fabric', segment: 'Enterprise Web3 Protocols', region: 'EMEA', tier: 'Tier 1' },
  { name: 'Zenith Staking Consortium', segment: 'Enterprise Web3 Protocols', region: 'APAC', tier: 'Tier 1' },
  { name: 'Polychain Horizon Labs', segment: 'Enterprise Web3 Protocols', region: 'Americas', tier: 'Tier 2' },
  { name: 'Kryptos Node Architecture', segment: 'Enterprise Web3 Protocols', region: 'EMEA', tier: 'Tier 2' },
  { name: 'Starlight Validator Systems', segment: 'Enterprise Web3 Protocols', region: 'APAC', tier: 'Tier 2' },
  { name: 'Nimbus Cloud Infrastructure', segment: 'Scaleup Cloud Native', region: 'Americas', tier: 'Tier 2' },
  { name: 'Axiom Real-Time Systems', segment: 'Scaleup Cloud Native', region: 'EMEA', tier: 'Tier 2' },
  { name: 'Quantum Scale Data', segment: 'Scaleup Cloud Native', region: 'APAC', tier: 'Tier 3' },
  { name: 'Stratus Distributed Compute', segment: 'Scaleup Cloud Native', region: 'Americas', tier: 'Tier 3' },
  { name: 'Vector Flow Technologies', segment: 'Scaleup Cloud Native', region: 'EMEA', tier: 'Tier 3' },
  { name: 'Ironclad Custody Vaults', segment: 'Tier 1 Financial Institutions', region: 'Americas', tier: 'Tier 1' },
  { name: 'Quasar Exchange Technologies', segment: 'Global FinTech & Payments', region: 'APAC', tier: 'Tier 1' },
  { name: 'Polaris Prime Brokerage', segment: 'Tier 1 Financial Institutions', region: 'EMEA', tier: 'Tier 1' },
  { name: 'Altair Global Settlement', segment: 'Tier 1 Financial Institutions', region: 'Americas', tier: 'Tier 1' },
  { name: 'Lyra Capital Markets', segment: 'Global FinTech & Payments', region: 'EMEA', tier: 'Tier 2' },
  { name: 'Nexus Gateway Systems', segment: 'Scaleup Cloud Native', region: 'Americas', tier: 'Tier 2' },
  { name: 'Hyperion Block Foundry', segment: 'Enterprise Web3 Protocols', region: 'APAC', tier: 'Tier 2' },
];

export interface GeneratedCommercialDataset {
  accounts: Account[];
  opportunities: Opportunity[];
  revenueSchedules: MonthlyRevenueScheduleItem[];
  targets: MonthlyTarget[];
  currentCutoffMonth: string; // The historical actuals boundary (e.g. '2026-03')
}

// Generate months array from 2024-01 to 2026-12 (36 months)
export function getCalendarMonths(): string[] {
  const months: string[] = [];
  const years = [2024, 2025, 2026];
  for (const year of years) {
    for (let m = 1; m <= 12; m++) {
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      months.push(`${year}-${monthStr}`);
    }
  }
  return months;
}

export function generateSyntheticCommercialData(): GeneratedCommercialDataset {
  const r = createPrng(881273);
  const cutoffMonth = '2026-03'; // Data up to March 2026 is actual, April 2026 onwards is projected

  // 1. Build Accounts
  const accounts: Account[] = ACCOUNT_NAMES.map((spec, idx) => {
    const owners = OWNERS_BY_REGION[spec.region];
    const owner = owners[Math.floor(r() * owners.length)];
    const startYear = 2023 + Math.floor(r() * 2);
    const startMonth = 1 + Math.floor(r() * 12);
    const firstContractDate = `${startYear}-${startMonth < 10 ? '0' + startMonth : startMonth}-15`;

    return {
      id: `acc-${String(idx + 1).padStart(3, '0')}`,
      name: spec.name,
      segment: spec.segment,
      region: spec.region,
      owner,
      tier: spec.tier,
      status: r() > 0.08 ? 'Active' : 'Churned',
      firstContractDate,
      totalLtv: 0 // Will accumulate
    };
  });

  const accountMap = new Map(accounts.map(a => [a.id, a]));



  // 2. Build Opportunities
  const opportunities: Opportunity[] = [];
  let oppCounter = 1;

  const productSpecs: { family: ProductFamily; revType: RevenueType; baseAcvRange: [number, number] }[] = [
    { family: 'Dedicated Compute & Nodes', revType: 'Recurring Subscription', baseAcvRange: [180000, 720000] },
    { family: 'High-Throughput RPC & Data APIs', revType: 'Usage & Consumption', baseAcvRange: [120000, 480000] },
    { family: 'Enterprise KMS & Security Fabric', revType: 'Enterprise License', baseAcvRange: [240000, 960000] },
    { family: 'Implementation & Architecture', revType: 'Professional Services', baseAcvRange: [45000, 150000] },
  ];

  const stages: { stage: OpportunityStage; prob: number }[] = [
    { stage: 'Qualifying', prob: 0.10 },
    { stage: 'Technical Evaluation', prob: 0.30 },
    { stage: 'Proposal & Quote', prob: 0.60 },
    { stage: 'Negotiation & Legal', prob: 0.80 },
    { stage: 'Closed Won', prob: 1.00 },
    { stage: 'Closed Lost', prob: 0.00 }
  ];

  // Helper to generate date strings
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  accounts.forEach((acc) => {
    // Generate 4 to 8 opportunities per account across 2024-2026
    const numDeals = 4 + Math.floor(r() * 4);
    
    // Track previous contract end date for clean renewal chaining
    let lastContractEnd: Date = new Date(acc.firstContractDate);

    for (let i = 0; i < numDeals; i++) {
      const oppId = `opp-${String(oppCounter++).padStart(4, '0')}`;
      const prod = productSpecs[Math.floor(r() * productSpecs.length)];
      
      let dealType: DealType = 'New Logo';
      if (i === 1) dealType = 'Expansion';
      else if (i > 1) dealType = r() > 0.4 ? 'Expansion' : 'Renewal';

      // Pick close date across the horizon: deal 0 in 2024, deal 1-2 in 2025, deal 3+ in 2026
      let closeYear = 2024;
      let closeMonth = 1;
      if (i === 0) {
        closeYear = 2024;
        closeMonth = 1 + Math.floor(r() * 12);
      } else if (i === 1 || (i === 2 && r() < 0.5)) {
        closeYear = 2025;
        closeMonth = 1 + Math.floor(r() * 12);
      } else {
        closeYear = 2026;
        closeMonth = 1 + Math.floor(r() * 12);
      }

      const closeDay = 5 + Math.floor(r() * 22);
      const closeDateObj = new Date(closeYear, closeMonth - 1, closeDay);
      const closeDateStr = formatDate(closeDateObj);
      const closeMonthStr = `${closeYear}-${closeMonth < 10 ? '0' + closeMonth : closeMonth}`;

      // Ramp delay between signature and contract start: 14 to 40 days
      const rampDays = prod.family === 'Implementation & Architecture' 
        ? 7 + Math.floor(r() * 10) 
        : 14 + Math.floor(r() * 28);
      
      const contractStartDateObj = new Date(closeDateObj.getTime() + rampDays * 24 * 3600 * 1000);
      const contractStartDateStr = formatDate(contractStartDateObj);

      // Contract Term: 12, 24, or 36 months for subscriptions; 3-6 months for services
      let termMonths = 12;
      if (prod.family === 'Implementation & Architecture') {
        termMonths = 3 + Math.floor(r() * 3);
      } else {
        const termRand = r();
        if (termRand > 0.65) termMonths = 24;
        else if (termRand > 0.88) termMonths = 36;
      }

      const contractEndDateObj = new Date(contractStartDateObj);
      contractEndDateObj.setMonth(contractEndDateObj.getMonth() + termMonths);
      const contractEndDateStr = formatDate(contractEndDateObj);

      // Determine stage based on timing relative to cutoffMonth ('2026-03')
      let stage: OpportunityStage = 'Closed Won';
      let prob = 1.0;

      if (closeMonthStr <= cutoffMonth) {
        // Past deals: majority Closed Won, small fraction Lost
        if (r() < 0.10 && i > 0) {
          stage = 'Closed Lost';
          prob = 0.0;
        } else {
          stage = 'Closed Won';
          prob = 1.0;
        }
      } else {
        // Future 2026 deals: realistic pipeline distribution
        // For renewals/expansions in 2026: higher probability stages
        if (dealType === 'Renewal') {
          stage = r() > 0.3 ? 'Negotiation & Legal' : 'Proposal & Quote';
          prob = stage === 'Negotiation & Legal' ? 0.80 : 0.60;
        } else {
          const openStages = stages.filter(s => s.stage !== 'Closed Lost');
          const picked = openStages[Math.floor(r() * openStages.length)];
          stage = picked.stage;
          prob = picked.prob;
        }
      }

      // ACV & TCV calculations with expansion uplift
      const tierMultiplier = acc.tier === 'Tier 1' ? 1.45 : acc.tier === 'Tier 2' ? 1.0 : 0.68;
      const expansionUplift = dealType === 'Expansion' ? 1.25 : 1.0;
      const rawAcv = (prod.baseAcvRange[0] + r() * (prod.baseAcvRange[1] - prod.baseAcvRange[0])) * tierMultiplier * expansionUplift;
      const acv = Math.round(rawAcv / 1000) * 1000;
      const tcv = prod.family === 'Implementation & Architecture' 
        ? acv 
        : Math.round((acv * (termMonths / 12)) / 1000) * 1000;
      const mrr = prod.family === 'Implementation & Architecture' ? 0 : Math.round(acv / 12);

      const pushCount = r() > 0.6 ? Math.floor(r() * 3) + 1 : 0;

      const oppName = `${acc.name} - ${prod.family} (${dealType})`;

      opportunities.push({
        id: oppId,
        accountId: acc.id,
        accountName: acc.name,
        name: oppName,
        dealType,
        productFamily: prod.family,
        revenueType: prod.revType,
        stage,
        probability: prob,
        closeDate: closeDateStr,
        contractStartDate: contractStartDateStr,
        contractEndDate: contractEndDateStr,
        termMonths,
        tcv,
        acv,
        mrr,
        region: acc.region,
        segment: acc.segment,
        owner: acc.owner,
        pushCount,
        rampDays
      });
    }
  });

  // 3. Generate Monthly Revenue Recognition Schedule (Calendar Spine Expansion)
  // This demonstrates the ASC 606 revenue recognition schedule:
  // Expanding each active contract across calendar months between contractStartDate and contractEndDate.
  const revenueSchedules: MonthlyRevenueScheduleItem[] = [];
  const calendarMonths = getCalendarMonths();
  let scheduleCounter = 1;

  opportunities.forEach(opp => {
    if (opp.stage === 'Closed Lost') return;

    const startMonth = opp.contractStartDate.slice(0, 7);
    const endMonth = opp.contractEndDate.slice(0, 7);

    // Filter active months
    const activeMonths = calendarMonths.filter(m => m >= startMonth && m <= endMonth);
    if (activeMonths.length === 0) return;

    // Monthly recognized amount
    let monthlyAmount = 0;
    if (opp.productFamily === 'Implementation & Architecture') {
      // Milestone distribution: front-loaded
      monthlyAmount = opp.tcv / activeMonths.length;
    } else {
      // Straight-line ACV / 12
      monthlyAmount = opp.acv / 12;
    }

    activeMonths.forEach((pMonth, monthIdx) => {
      const isHistorical = pMonth <= cutoffMonth;
      
      // Determine status
      let status: ScheduleStatus = 'Committed';
      if (isHistorical && opp.stage === 'Closed Won') {
        status = 'Actual';
      } else if (!isHistorical && opp.stage === 'Closed Won') {
        status = 'Committed';
      } else {
        status = 'Projected Weighted';
      }

      // Add realistic seasonal/usage ramp variations (+/- 4%) for API usage
      let adjustedAmount = monthlyAmount;
      if (opp.revenueType === 'Usage & Consumption') {
        const rampUpFactor = 1 + (monthIdx * 0.015); // gentle consumption expansion over contract
        adjustedAmount = monthlyAmount * rampUpFactor;
      }

      const recognizedAmount = Math.round(adjustedAmount);
      const weightedAmount = Math.round(recognizedAmount * opp.probability);

      revenueSchedules.push({
        id: `sched-${String(scheduleCounter++).padStart(5, '0')}`,
        oppId: opp.id,
        accountId: opp.accountId,
        accountName: opp.accountName,
        periodMonth: pMonth,
        revenueType: opp.revenueType,
        productFamily: opp.productFamily,
        region: opp.region,
        segment: opp.segment,
        owner: opp.owner,
        amount: recognizedAmount,
        weightedAmount: weightedAmount,
        status,
        isHistorical,
        stage: opp.stage,
        dealType: opp.dealType
      });

      // Accumulate LTV for account
      if (isHistorical || opp.stage === 'Closed Won') {
        const acc = accountMap.get(opp.accountId);
        if (acc) {
          acc.totalLtv += recognizedAmount;
        }
      }
    });
  });

  // 4. Generate Monthly Targets
  const targets: MonthlyTarget[] = [];
  const prodFamilies: ProductFamily[] = [
    'Dedicated Compute & Nodes',
    'High-Throughput RPC & Data APIs',
    'Enterprise KMS & Security Fabric',
    'Implementation & Architecture'
  ];

  calendarMonths.forEach((month, idx) => {
    // Base target scaling smoothly from $1.8M/month in 2024 to $2.9M/month in 2026
    const growthProgress = idx / calendarMonths.length; // 0.0 to 1.0
    const totalMonthTarget = 1800000 + growthProgress * 1100000;

    REGIONS.forEach(region => {
      const regionShare = region === 'Americas' ? 0.52 : region === 'EMEA' ? 0.32 : 0.16;
      prodFamilies.forEach(prod => {
        const prodShare = prod === 'Dedicated Compute & Nodes' ? 0.40
          : prod === 'High-Throughput RPC & Data APIs' ? 0.28
          : prod === 'Enterprise KMS & Security Fabric' ? 0.24
          : 0.08;
        
        const targetRev = Math.round(totalMonthTarget * regionShare * prodShare);
        targets.push({
          periodMonth: month,
          region,
          productFamily: prod,
          targetRevenue: targetRev,
          targetArr: targetRev * 12
        });
      });
    });
  });

  return {
    accounts,
    opportunities,
    revenueSchedules,
    targets,
    currentCutoffMonth: cutoffMonth
  };
}
