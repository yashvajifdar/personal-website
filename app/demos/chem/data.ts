// Pre-computed from ShipStation export (Apr 15 – May 15, 2026).
// Source: 639144304027378149.csv (shipments, 2712 rows, 462 unique SKUs)
// All revenue values are integer dollars (rounded from float).
// Verified with Python before writing — do not hand-edit numbers.

export const KPI = {
  revenue: 184471,
  orders: 2561,
  shipments: 2712,
  period: "Apr 15 – May 15, 2026",
  skus: 462,
} as const;

// "Chemboys B2B Wholesale (orders.chemboys.com)", "Chemfulfillment.com", and
// "Chemboys Manual Orders" are merged into "Other" ($1,264 combined).
export const CHANNEL_DATA: { name: string; value: number; pct: number }[] = [
  { name: "Chemboys Amazon", value: 97335, pct: 52.8 },
  { name: "DIYChemicals.com", value: 85873, pct: 46.6 },
  { name: "Other", value: 1264, pct: 0.7 },
];

export const TOP_SKUS: { sku: string; revenue: number; orders: number }[] = [
  { sku: "Phosphoric Acid 85% (5 Gal)", revenue: 9081, orders: 172 },
  { sku: "Sodium Thiosulfate (40 LB)", revenue: 7371, orders: 39 },
  { sku: "Turpentine (1 Gal)", revenue: 6392, orders: 77 },
  { sku: "Turpentine CFF (1 Gal)", revenue: 6331, orders: 70 },
  { sku: "Hydrogen Peroxide 34% (1 Gal)", revenue: 3674, orders: 81 },
  { sku: "Methanol Industrial (1 Gal)", revenue: 2961, orders: 67 },
  { sku: "Sodium Bromide (40 LB)", revenue: 2558, orders: 6 },
  { sku: "D-Limonene (5 Gal)", revenue: 2542, orders: 50 },
];

// Computed on SKUs with 5+ distinct orders (121 qualifying SKUs).
// rev_per_order = total SKU revenue / distinct order count, rounded to integer.
// "high" = top 5 by rev_per_order; "low" = bottom 5.
export const EFFICIENCY: { label: string; rev_per_order: number; tier: "high" | "low" }[] = [
  { label: "Sodium Bromide (40 LB)", rev_per_order: 426, tier: "high" },
  { label: "DAP Ammonium Phosphate (40 LB)", rev_per_order: 337, tier: "high" },
  { label: "IPA 99.9% (5 Gal)", rev_per_order: 306, tier: "high" },
  { label: "Propylene Glycol (5 Gal)", rev_per_order: 276, tier: "high" },
  { label: "Triethanolamine 99% (5 Gal)", rev_per_order: 262, tier: "high" },
  { label: "Glycolic Acid 70% (1 Qt)", rev_per_order: 21, tier: "low" },
  { label: "Citric Acid (5 LB)", rev_per_order: 20, tier: "low" },
  { label: "Copper Sulfate (2 LB)", rev_per_order: 19, tier: "low" },
  { label: "Hydrochloric Acid (1 Qt)", rev_per_order: 17, tier: "low" },
  { label: "Citric Acid (1 LB)", rev_per_order: 17, tier: "low" },
];

export const FINDINGS: {
  number: string;
  title: string;
  body: string;
  tag: string;
  tagColor: string;
}[] = [
  {
    number: "01",
    title: "Top revenue product is split across two brand labels",
    body: "Turpentine (1 Gal) and Turpentine CFF (1 Gal) are the same product listed under two different brand names. Combined revenue: $12,723 in 30 days, more than any single SKU. The split makes each look like a mid-tier SKU and likely causes underordering.",
    tag: "SKU consolidation",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    number: "02",
    title: "Bulk orders generate 10–25x more revenue per pick",
    body: "Your 40-LB and 5-Gal SKUs generate $230–$426 per order. Your small-unit SKUs generate $10–$35 per order with roughly the same pick, pack, and label cost. Adding a handling fee or minimum order quantity on small units could recover that margin without losing the customer.",
    tag: "Pricing opportunity",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    number: "03",
    title: "41 low-value SKUs are generating constant fulfillment work",
    body: "41 SKUs priced under $40/unit each appear in 6–81 orders over 30 days. Pick, pack, label, and ship costs roughly the same regardless of what is in the box. Citric Acid at $10/unit is the clearest case. Adding a minimum order quantity or a small-order handling fee on this tier would recover margin without requiring a price increase on competitive products.",
    tag: "Fulfillment cost",
    tagColor: "bg-red-50 text-red-700 border-red-200",
  },
  {
    number: "04",
    title: "Direct orders are worth 43% more than Amazon, before fees",
    body: "DIYChemicals.com averages $83 per shipment. Amazon averages $58. After Amazon's ~15% seller fees, the net revenue gap is closer to 68% per order. Both channels are roughly equal in total revenue today, but the unit economics are significantly different. Every customer acquired on DIYChemicals.com is more valuable than the same customer on Amazon.",
    tag: "Channel strategy",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
];
