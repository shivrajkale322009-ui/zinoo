import React, { memo, useMemo } from 'react';
import { Eye, IndianRupee, SearchCheck } from 'lucide-react';
import { getProjectApprovalStatus, PROPERTY_STATUS } from '../utils/projectVisibility';

const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

const compactCurrency = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1).replace('.0', '')} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1).replace('.0', '')} L`;
  return `₹${new Intl.NumberFormat('en-IN').format(value)}`;
};

const KpiCard = memo(function KpiCard({ label, value, note, icon: Icon }) {
  return <article className="seller-v2-kpi"><div><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><small>{note}</small></article>;
});

function SellerDashboardHome({ projects, cashbacks, isMobile }) {
  const dashboard = useMemo(() => {
    const active = projects.filter((project) => getProjectApprovalStatus(project) === PROPERTY_STATUS.ACTIVE);
    const totalViews = projects.reduce((sum, project) => sum + number(project.views ?? project.weeklyViews), 0);
    const pendingClaims = cashbacks.filter((claim) => claim.status === 'Pending Seller Approval');
    const pendingAmount = pendingClaims.reduce((sum, claim) => sum + number(claim.cashbackAmount), 0);
    return {
      activeListings: active.length,
      totalViews,
      pendingClaims,
      pendingAmount
    };
  }, [projects, cashbacks]);

  return <div className={`seller-v2-dashboard ${isMobile ? 'seller-v2-dashboard-mobile' : ''}`}>
    <section className="seller-v2-kpis" aria-label="Business snapshot">
      <KpiCard label="Active listings" value={dashboard.activeListings} note={`${projects.length} total listings`} icon={SearchCheck} />
      <KpiCard label="Total views" value={new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(dashboard.totalViews)} note="Current listing totals" icon={Eye} />
      <KpiCard label="Pending cashback" value={dashboard.pendingAmount ? compactCurrency(dashboard.pendingAmount) : dashboard.pendingClaims.length} note={`${dashboard.pendingClaims.length} awaiting review`} icon={IndianRupee} />
    </section>

  </div>;
}

export default memo(SellerDashboardHome);
