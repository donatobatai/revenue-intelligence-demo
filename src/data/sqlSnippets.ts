export interface SqlSnippet {
  id: string;
  title: string;
  category: 'Spine & Waterfall' | 'ARR Bridge' | 'Multi-Grain Union' | 'Weighted Forecast';
  description: string;
  sql: string;
  takeaway: string;
}

export const SQL_PIPELINE_SNIPPETS: SqlSnippet[] = [
  {
    id: 'calendar-spine-waterfall',
    title: '1. Calendar Spine & ASC 606 Revenue Recognition Schedule',
    category: 'Spine & Waterfall',
    description: 'Expands point-in-time CRM Closed Won opportunities into continuous monthly recognized revenue across contract start and end dates using BigQuery GENERATE_DATE_ARRAY.',
    sql: `-- ============================================================
-- CTE: Calendar Spine & Revenue Recognition Schedule (ASC 606)
-- Converts point-in-time closed contracts into active monthly revenue schedules.
-- ============================================================
WITH calendar_spine AS (
  SELECT
    month_start_date,
    FORMAT_DATE('%Y-%m', month_start_date) AS period_month,
    DATE_ADD(month_start_date, INTERVAL 1 MONTH) AS next_month_date
  FROM
    UNNEST(GENERATE_DATE_ARRAY(DATE('2024-01-01'), DATE('2026-12-01'), INTERVAL 1 MONTH)) AS month_start_date
),

active_contracts AS (
  SELECT
    o.id AS opp_id,
    o.account_id,
    o.deal_type,
    o.product_family,
    o.revenue_type,
    o.acv,
    o.tcv,
    DATE(o.contract_start_date) AS contract_start_date,
    DATE(o.contract_end_date) AS contract_end_date,
    DATE_DIFF(DATE(o.contract_end_date), DATE(o.contract_start_date), MONTH) AS contract_term_months,
    o.stage,
    o.probability
  FROM
    \`analytics_warehouse.fct_opportunities\` o
  WHERE
    o.stage != 'Closed Lost'
)

SELECT
  c.period_month,
  k.account_id,
  k.opp_id,
  k.product_family,
  k.deal_type,
  -- Straight-line monthly recognition for subscription & licenses
  CASE
    WHEN k.revenue_type = 'Professional Services' 
      THEN k.tcv / GREATEST(1, LEAST(3, k.contract_term_months))
    ELSE k.acv / 12.0
  END AS recognized_mrr,
  
  -- Probability-weighted for open pipeline forecasting
  CASE
    WHEN k.stage = 'Closed Won' THEN (k.acv / 12.0)
    ELSE (k.acv / 12.0) * k.probability
  END AS weighted_projected_mrr,

  CASE
    WHEN c.month_start_date <= CURRENT_DATE() AND k.stage = 'Closed Won' THEN 'Actual'
    WHEN c.month_start_date > CURRENT_DATE() AND k.stage = 'Closed Won' THEN 'Committed'
    ELSE 'Projected Weighted'
  END AS revenue_status
FROM
  calendar_spine c
JOIN
  active_contracts k
  ON c.month_start_date >= DATE_TRUNC(k.contract_start_date, MONTH)
  AND c.month_start_date < DATE_TRUNC(k.contract_end_date, MONTH);`,
    takeaway: 'Prevents empty period holes, correctly accounts for implementation ramps, and enforces GAAP ASC 606 matching principles directly in the warehouse.'
  },
  {
    id: 'arr-waterfall-bridge',
    title: '2. ARR Bridge & Cohort Retention Decomposition',
    category: 'ARR Bridge',
    description: 'Computes opening ARR, new logo additions, expansion, contraction, churn, and closing ARR with Net Revenue Retention (NRR) window functions.',
    sql: `-- ============================================================
-- CTE: ARR Bridge & Account Cohort Movements
-- Decomposes monthly net ARR growth into discrete commercial drivers.
-- ============================================================
WITH monthly_account_arr AS (
  SELECT
    period_month,
    account_id,
    SUM(recognized_mrr) * 12.0 AS active_arr
  FROM
    \`analytics_warehouse.fct_monthly_revenue_schedule\`
  WHERE
    revenue_status IN ('Actual', 'Committed')
  GROUP BY 1, 2
),

arr_with_lags AS (
  SELECT
    period_month,
    account_id,
    active_arr,
    LAG(active_arr, 1, 0.0) OVER (
      PARTITION BY account_id ORDER BY period_month
    ) AS prior_month_arr
  FROM
    monthly_account_arr
)

SELECT
  period_month,
  -- Opening ARR is sum of prior month values for existing accounts
  SUM(prior_month_arr) AS starting_arr,
  
  -- New Logo: Prior ARR = 0, Current ARR > 0
  SUM(CASE WHEN prior_month_arr = 0 AND active_arr > 0 THEN active_arr ELSE 0 END) AS new_logo_arr,
  
  -- Expansion: Prior ARR > 0, Current ARR > Prior ARR
  SUM(CASE WHEN prior_month_arr > 0 AND active_arr > prior_month_arr THEN (active_arr - prior_month_arr) ELSE 0 END) AS expansion_arr,
  
  -- Contraction: Prior ARR > Current ARR, Current ARR > 0
  SUM(CASE WHEN active_arr > 0 AND active_arr < prior_month_arr THEN (prior_month_arr - active_arr) ELSE 0 END) AS contraction_arr,
  
  -- Churn: Prior ARR > 0, Current ARR = 0
  SUM(CASE WHEN prior_month_arr > 0 AND active_arr = 0 THEN prior_month_arr ELSE 0 END) AS churn_arr,
  
  -- Ending ARR
  SUM(active_arr) AS ending_arr,
  
  -- Net Retention Rate (NRR) on existing cohort
  SAFE_DIVIDE(
    SUM(CASE WHEN prior_month_arr > 0 THEN active_arr ELSE 0 END),
    SUM(CASE WHEN prior_month_arr > 0 THEN prior_month_arr ELSE 0 END)
  ) * 100.0 AS nrr_percentage
FROM
  arr_with_lags
GROUP BY
  period_month
ORDER BY
  period_month ASC;`,
    takeaway: 'Disaggregates top-line growth to prove whether ARR momentum is sustained by new customer acquisition or high expansion from existing institutional accounts.'
  },
  {
    id: 'unioned-multigrain-layer',
    title: '3. High-Performance Multi-Grain Union Architecture',
    category: 'Multi-Grain Union',
    description: 'Optimized BI semantic layer combining granular deal rows with pre-aggregated period totals and period-over-period delta ratios to avoid runtime joins.',
    sql: `-- ============================================================
-- CTE: Unioned Multi-Grain Reporting Layer
-- Combines granular record slice with precomputed period rollups and share %
-- ============================================================
WITH period_metrics_month AS (
  SELECT
    period_month,
    region,
    product_family,
    SUM(recognized_mrr) AS total_revenue,
    SUM(recognized_mrr * 12.0) AS total_arr,
    COUNT(DISTINCT account_id) AS active_accounts
  FROM
    \`analytics_warehouse.fct_monthly_revenue_schedule\`
  GROUP BY 1, 2, 3
),

metrics_with_shares AS (
  SELECT
    period_month,
    region,
    product_family,
    total_revenue,
    total_arr,
    -- Compute share of total across region in period
    SAFE_DIVIDE(
      total_revenue,
      SUM(total_revenue) OVER (PARTITION BY period_month)
    ) * 100.0 AS period_revenue_share_pct,
    
    -- Period-over-period MoM growth
    LAG(total_revenue, 1) OVER (
      PARTITION BY region, product_family ORDER BY period_month
    ) AS prev_month_revenue
  FROM
    period_metrics_month
)

-- Unified BI consumption grain
SELECT
  'AGG_PERIOD' AS record_type,
  period_month,
  region,
  product_family,
  total_revenue,
  total_arr,
  period_revenue_share_pct,
  SAFE_DIVIDE(total_revenue - prev_month_revenue, prev_month_revenue) * 100.0 AS mom_growth_pct
FROM
  metrics_with_shares;`,
    takeaway: 'Powers sub-second UI interactions by providing both row-level granularity and analytical ratios (growth %, share of wallet) without repetitive table scans.'
  }
];
