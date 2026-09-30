/**
 * Zinoo CRM Lead Model & Utilities
 * Centralized business logic, enums, metrics calculation, phone normalization,
 * and activity timeline modeling for Zinoo's Lead Management Module.
 */

import { formatIndianCurrency } from './formatIndian.js';

export const LEAD_STAGES = [
  { key: 'New', label: 'New', color: 'blue', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  { key: 'Contacted', label: 'Contacted', color: 'sky', bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1' },
  { key: 'Projects Suggested', label: 'Projects Suggested', color: 'purple', bg: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
  { key: 'Visit Scheduled', label: 'Visit Scheduled', color: 'amber', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  { key: 'Visit Completed', label: 'Visit Completed', color: 'amber', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  { key: 'Closed Won', label: 'Closed Won', color: 'green', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  { key: 'Closed Lost', label: 'Closed Lost', color: 'rose', bg: '#fff1f2', border: '#fecdd3', text: '#be123c' }
];

export const LEAD_TEMPERATURES = [
  { key: 'Hot', label: 'Hot', icon: '🔥', text: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  { key: 'Warm', label: 'Warm', icon: '🟡', text: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  { key: 'Cold', label: 'Cold', icon: '❄️', text: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' }
];

export const LEAD_SOURCES = [
  'Meta Ads',
  'WhatsApp',
  'Website',
  'Zinoo App',
  'Phone Call',
  'Walk-in',
  'Referral',
  'Organic',
  'Other'
];

export const PREFERRED_AREAS = [
  'Chakan',
  'Rase',
  'Bhose',
  'Shelgaon',
  'Kalus',
  'Kuruli',
  'Medankarwadi',
  'Mahalunge',
  'Nanekarwadi',
  'Shiroli',
  'Khed',
  'Alandi',
  'Other'
];

export const PURCHASE_PURPOSES = [
  'Investment',
  'Home Construction',
  'Commercial / Industrial',
  'Farm / Weekend Home',
  'Other'
];

export const PURCHASE_TIMELINES = [
  'Immediately',
  'Within 1 Month',
  '1–3 Months',
  '3–6 Months',
  'Just Exploring'
];

export const LOAN_OPTIONS = ['Yes', 'No', 'Maybe'];

export const CLOSED_LOST_REASONS = [
  'Budget mismatch',
  'Bought elsewhere',
  'Location mismatch',
  'Not interested',
  'Unable to contact',
  'Project unavailable',
  'Loan issue',
  'Business related (broker, seller, or loan agent)',
  'Other'
];

export function createClosedLostUpdate(lead, reason, notes, user) {
  const text = String(notes || '').trim();
  if (!CLOSED_LOST_REASONS.includes(reason)) throw new Error('Select a loss reason.');
  if (reason === 'Other' && !text) throw new Error('Add a note explaining the reason.');
  const createdAt = new Date().toISOString();
  const note = { id: `note_${crypto.randomUUID()}`, stage: 'Closed Lost', reason, text: text ? `${reason}: ${text}` : reason, createdAt, createdByName: user?.displayName || user?.name || 'Admin' };
  const activity = createActivityRecord({ type: 'deal_closed_lost', title: 'Deal Closed Lost', description: note.text, user });
  return { stage: 'Closed Lost', dealDetails: { ...(lead.dealDetails || {}), lostReason: reason, lostNotes: text }, notes: [note, ...(lead.notes || [])], activities: [activity, ...(lead.activities || [])] };
}

export const SITE_VISIT_STATUSES = [
  'Scheduled',
  'Confirmed',
  'Completed',
  'Cancelled',
  'Rescheduled',
  'No Show'
];

export const FOLLOW_UP_STATUSES = [
  'Pending',
  'Completed',
  'Overdue',
  'Cancelled'
];

/**
 * Normalizes an Indian phone number to standard 10 digits or E.164 (+91XXXXXXXXXX).
 */
export function normalizeIndianPhone(input) {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  return '';
}

/**
 * Extracts pure 10-digit number for search and duplicate comparisons.
 */
export function getPhoneDigits(input) {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/**
 * Checks if a lead with the same phone number already exists in the given lead array.
 */
export function checkDuplicateLead(phone, leads = [], excludeLeadId = null) {
  const targetDigits = getPhoneDigits(phone);
  if (!targetDigits || targetDigits.length < 10) return null;

  return leads.find((lead) => {
    if (excludeLeadId && lead.id === excludeLeadId) return false;
    const leadDigits = getPhoneDigits(lead.phone || lead.mobile || lead.whatsapp);
    return leadDigits && leadDigits === targetDigits;
  }) || null;
}

/**
 * Formats a budget range using Indian numbering system.
 */
export function formatLeadBudget(min, max) {
  const numMin = Number(min);
  const numMax = Number(max);
  const hasMin = Number.isFinite(numMin) && numMin > 0;
  const hasMax = Number.isFinite(numMax) && numMax > 0;

  if (hasMin && hasMax) {
    if (numMin === numMax) return formatIndianCurrency(numMin);
    return `${formatIndianCurrency(numMin)} – ${formatIndianCurrency(numMax)}`;
  }
  if (hasMin) return `From ${formatIndianCurrency(numMin)}`;
  if (hasMax) return `Up to ${formatIndianCurrency(numMax)}`;
  return 'Budget on request';
}

/**
 * Helper to convert various date formats (Firebase Timestamp, seconds, ISO string, Date) to epoch ms.
 */
export function getEpochMs(value) {
  if (!value) return 0;
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (Number.isFinite(value?.seconds)) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Checks if a given timestamp represents "today" in local time.
 */
export function isToday(value) {
  const time = getEpochMs(value);
  if (!time) return false;
  const date = new Date(time);
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

/**
 * Checks if a given timestamp is before today (overdue).
 */
export function isOverdue(value) {
  const time = getEpochMs(value);
  if (!time) return false;
  const date = new Date(time);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return date.getTime() < startOfToday.getTime();
}

/**
 * Checks if a timestamp falls within the current calendar month.
 */
export function isThisMonth(value) {
  const time = getEpochMs(value);
  if (!time) return false;
  const date = new Date(time);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

/**
 * Calculate top-level dashboard metrics for the CRM.
 */
export function getLeadSummaryMetrics(leads = []) {
  let totalLeads = leads.length;
  let newLeads = 0;
  let followUpsToday = 0;
  let overdueFollowUps = 0;
  let siteVisitsToday = 0;
  let hotLeads = 0;
  let closedThisMonth = 0;
  let unassignedLeads = 0;

  leads.forEach((lead) => {
    const stage = lead.stage || 'New';
    const temp = lead.temperature || 'Warm';

    if (stage === 'New') newLeads++;
    if (temp === 'Hot') hotLeads++;
    if (!lead.assignedUserId || lead.assignedUserId === 'unassigned') unassignedLeads++;

    // Follow-ups today & overdue
    if (lead.nextFollowUpAt) {
      if (isToday(lead.nextFollowUpAt)) followUpsToday++;
      else if (isOverdue(lead.nextFollowUpAt) && stage !== 'Closed Won' && stage !== 'Closed Lost') {
        overdueFollowUps++;
      }
    }

    // Site visits today
    const visits = Array.isArray(lead.siteVisits) ? lead.siteVisits : [];
    const hasTodayVisit = visits.some((v) => isToday(v.date || v.datetime) && v.status !== 'Cancelled');
    if (hasTodayVisit) siteVisitsToday++;

    // Closed this month
    if (stage === 'Closed Won') {
      const closedAt = lead.dealDetails?.closingDate || lead.updatedAt || lead.createdAt;
      if (isThisMonth(closedAt)) closedThisMonth++;
    }
  });

  return {
    totalLeads,
    newLeads,
    followUpsToday,
    overdueFollowUps,
    siteVisitsToday,
    hotLeads,
    closedThisMonth,
    unassignedLeads
  };
}

/**
 * Calculates conversion rates and detailed breakdown metrics for management reports.
 */
export function calculateConversionMetrics(leads = []) {
  const totalLeads = leads.length;
  let contactedCount = 0;
  let visitedCount = 0;
  let closedWonCount = 0;
  let closedLostCount = 0;

  const bySource = {};
  const byAgent = {};
  const byStage = {};

  leads.forEach((lead) => {
    const stage = lead.stage || 'New';
    const source = lead.source || 'Website';
    const agent = lead.assignedUserName || 'Unassigned';

    bySource[source] = (bySource[source] || 0) + 1;
    byAgent[agent] = (byAgent[agent] || 0) + 1;
    byStage[stage] = (byStage[stage] || 0) + 1;

    if (stage !== 'New') contactedCount++;
    const visits = Array.isArray(lead.siteVisits) ? lead.siteVisits : [];
    if (visits.length > 0 || ['Visit Scheduled', 'Visit Completed', 'Interested', 'Negotiation', 'Closed Won'].includes(stage)) {
      visitedCount++;
    }
    if (stage === 'Closed Won') closedWonCount++;
    if (stage === 'Closed Lost') closedLostCount++;
  });

  const leadToVisitConversion = totalLeads > 0 ? Math.round((visitedCount / totalLeads) * 100) : 0;
  const visitToDealConversion = visitedCount > 0 ? Math.round((closedWonCount / visitedCount) * 100) : 0;
  const leadToDealConversion = totalLeads > 0 ? Math.round((closedWonCount / totalLeads) * 100) : 0;

  return {
    totalLeads,
    contactedCount,
    visitedCount,
    closedWonCount,
    closedLostCount,
    leadToVisitConversion,
    visitToDealConversion,
    leadToDealConversion,
    bySource,
    byAgent,
    byStage
  };
}

/**
 * Creates an activity record for the chronological audit timeline.
 */
export function createActivityRecord({
  type = 'note',
  title = '',
  description = '',
  user = null,
  metadata = {}
}) {
  const now = new Date();
  return {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: title || type.replace(/_/g, ' '),
    description,
    createdAt: now.toISOString(),
    createdTimestamp: now.getTime(),
    createdBy: user?.uid || user?.id || 'admin',
    createdByName: user?.displayName || user?.name || 'Admin',
    metadata
  };
}

/**
 * Realistic sample fixtures for development & demo testing with Chakan region data.
 */
export function getSampleDemoLeads() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  return [
    {
      name: 'Rahul Patil',
      phone: '+919822012345',
      whatsapp: '+919822012345',
      source: 'Meta Ads',
      budgetMin: 1200000,
      budgetMax: 1800000,
      preferredLocations: ['Rase', 'Bhose'],
      plotSize: '1,500 – 2,000 sq ft',
      purchasePurpose: 'Investment',
      purchaseTimeline: 'Within 1 Month',
      loanRequired: 'No',
      stage: 'Visit Scheduled',
      temperature: 'Hot',
      assignedUserId: 'agent_1',
      assignedUserName: 'Nitin Deshmukh',
      nextFollowUpAt: `${todayStr}T11:00:00`,
      nextFollowUpReason: 'Confirm site visit arrival & share location pin',
      notes: [
        {
          id: 'note_1',
          text: 'Prefers corner plot with clear NA 44 sanction. Interested in gated community near Chakan MIDC Phase 2.',
          createdAt: new Date(now.getTime() - 172800000).toISOString(),
          createdByName: 'Nitin Deshmukh'
        }
      ],
      siteVisits: [
        {
          id: 'visit_1',
          projectId: 'p_rase_meadows',
          projectName: 'Rase Green Meadows',
          date: todayStr,
          time: '14:30',
          assignedAgent: 'Nitin Deshmukh',
          status: 'Scheduled',
          notes: 'Customer coming from Bhosari with brother.'
        }
      ],
      recommendedProjects: [
        {
          projectId: 'p_rase_meadows',
          projectName: 'Rase Green Meadows',
          location: 'Rase, Chakan',
          startingPrice: 1350000,
          plotSize: '1,650 sq ft',
          status: 'active',
          sharedAt: new Date(now.getTime() - 86400000).toISOString(),
          reaction: 'interested'
        }
      ],
      activities: [
        {
          id: 'act_1',
          type: 'lead_created',
          title: 'Lead Created',
          description: 'Enquiry received from Meta Ads campaign.',
          createdAt: new Date(now.getTime() - 259200000).toISOString(),
          createdByName: 'System'
        },
        {
          id: 'act_2',
          type: 'visit_scheduled',
          title: 'Site Visit Scheduled',
          description: 'Scheduled visit for Rase Green Meadows at 2:30 PM.',
          createdAt: new Date(now.getTime() - 86400000).toISOString(),
          createdByName: 'Nitin Deshmukh'
        }
      ]
    },
    {
      name: 'Sneha Deshmukh',
      phone: '+919850123456',
      whatsapp: '+919850123456',
      source: 'Website',
      budgetMin: 2000000,
      budgetMax: 2800000,
      preferredLocations: ['Chakan', 'Shelgaon'],
      plotSize: '2,000 – 2,500 sq ft',
      purchasePurpose: 'Home Construction',
      purchaseTimeline: 'Immediately',
      loanRequired: 'Yes',
      stage: 'Negotiation',
      temperature: 'Hot',
      assignedUserId: 'agent_2',
      assignedUserName: 'Pooja Kadam',
      nextFollowUpAt: `${todayStr}T16:00:00`,
      nextFollowUpReason: 'Discuss builder discount on plot 14 and SBI bank loan approval',
      notes: [
        {
          id: 'note_2',
          text: 'Site visit completed last Saturday. Family loved the road connectivity and water supply.',
          createdAt: new Date(now.getTime() - 86400000).toISOString(),
          createdByName: 'Pooja Kadam'
        }
      ],
      siteVisits: [
        {
          id: 'visit_2',
          projectId: 'p_shelgaon_hills',
          projectName: 'Shelgaon Valley View',
          date: yesterday,
          time: '11:00',
          assignedAgent: 'Pooja Kadam',
          status: 'Completed',
          feedback: {
            customerReaction: 'Very positive',
            interestLevel: 'High',
            negotiationNotes: 'Requesting ₹100/sq ft rebate for immediate token',
            nextAction: 'Final price sign-off with developer'
          }
        }
      ],
      recommendedProjects: [
        {
          projectId: 'p_shelgaon_hills',
          projectName: 'Shelgaon Valley View',
          location: 'Shelgaon, Chakan',
          startingPrice: 2100000,
          plotSize: '2,200 sq ft',
          status: 'active',
          sharedAt: new Date(now.getTime() - 172800000).toISOString(),
          reaction: 'interested'
        }
      ],
      activities: [
        {
          id: 'act_3',
          type: 'visit_completed',
          title: 'Site Visit Completed',
          description: 'Client completed visit at Shelgaon Valley View. High intent.',
          createdAt: yesterday,
          createdByName: 'Pooja Kadam'
        }
      ]
    },
    {
      name: 'Amit Shinde',
      phone: '+919765432109',
      whatsapp: '+919765432109',
      source: 'WhatsApp',
      budgetMin: 800000,
      budgetMax: 1200000,
      preferredLocations: ['Kalus', 'Bhose'],
      plotSize: '1,000 – 1,200 sq ft',
      purchasePurpose: 'Investment',
      purchaseTimeline: '1–3 Months',
      loanRequired: 'Maybe',
      stage: 'Projects Suggested',
      temperature: 'Warm',
      assignedUserId: 'agent_1',
      assignedUserName: 'Nitin Deshmukh',
      nextFollowUpAt: `${tomorrow}T10:00:00`,
      nextFollowUpReason: 'Get feedback on shared WhatsApp project brochure',
      notes: [],
      siteVisits: [],
      recommendedProjects: [
        {
          projectId: 'p_kalus_greens',
          projectName: 'Kalus Agro Plots',
          location: 'Kalus',
          startingPrice: 950000,
          plotSize: '1,100 sq ft',
          status: 'active',
          sharedAt: todayStr,
          reaction: 'pending'
        }
      ],
      activities: [
        {
          id: 'act_4',
          type: 'projects_shared',
          title: 'Projects Shared',
          description: 'Shared Kalus Agro Plots brochure via WhatsApp.',
          createdAt: todayStr,
          createdByName: 'Nitin Deshmukh'
        }
      ]
    },
    {
      name: 'Priya Jadhav',
      phone: '+919921987654',
      whatsapp: '+919921987654',
      source: 'Referral',
      budgetMin: 1500000,
      budgetMax: 2200000,
      preferredLocations: ['Kuruli', 'Chakan'],
      plotSize: '1,800 sq ft',
      purchasePurpose: 'Home Construction',
      purchaseTimeline: 'Immediately',
      loanRequired: 'Yes',
      stage: 'Closed Won',
      temperature: 'Hot',
      assignedUserId: 'agent_2',
      assignedUserName: 'Pooja Kadam',
      dealDetails: {
        purchasedProjectId: 'p_kuruli_heights',
        purchasedProjectName: 'Kuruli Golden Enclave',
        finalDealValue: 1850000,
        closingDate: todayStr,
        sellerName: 'Venkatesh Developers',
        commissionPercent: 2,
        expectedCommission: 37000,
        commissionStatus: 'Received'
      },
      notes: [
        {
          id: 'note_3',
          text: 'Registration completed at Khed Sub-Registrar office. Token and commission cleared.',
          createdAt: todayStr,
          createdByName: 'Pooja Kadam'
        }
      ],
      activities: [
        {
          id: 'act_5',
          type: 'deal_closed_won',
          title: 'Deal Closed Won',
          description: 'Purchased Kuruli Golden Enclave for ₹18,50,000.',
          createdAt: todayStr,
          createdByName: 'Pooja Kadam'
        }
      ]
    },
    {
      name: 'Vikram More',
      phone: '+919860334455',
      whatsapp: '+919860334455',
      source: 'Phone Call',
      budgetMin: 3000000,
      budgetMax: 4500000,
      preferredLocations: ['Chakan', 'Medankarwadi'],
      plotSize: '3,000 sq ft',
      purchasePurpose: 'Commercial / Industrial',
      purchaseTimeline: '3–6 Months',
      loanRequired: 'No',
      stage: 'Requirement Collected',
      temperature: 'Warm',
      assignedUserId: null,
      assignedUserName: 'Unassigned',
      nextFollowUpAt: `${yesterday}T15:00:00`,
      nextFollowUpReason: 'Send commercial plot zoning document',
      notes: [],
      activities: [
        {
          id: 'act_6',
          type: 'requirement_collected',
          title: 'Requirement Collected',
          description: 'Looking for industrial/commercial parcel touching highway or 40ft road.',
          createdAt: yesterday,
          createdByName: 'Admin'
        }
      ]
    },
    {
      name: 'Rajesh Kulkarni',
      phone: '+919422001122',
      whatsapp: '+919422001122',
      source: 'Walk-in',
      budgetMin: 1000000,
      budgetMax: 1400000,
      preferredLocations: ['Shelgaon'],
      plotSize: '1,200 sq ft',
      purchasePurpose: 'Investment',
      purchaseTimeline: 'Just Exploring',
      loanRequired: 'No',
      stage: 'Closed Lost',
      temperature: 'Cold',
      assignedUserId: 'agent_1',
      assignedUserName: 'Nitin Deshmukh',
      dealDetails: {
        lostReason: 'Budget mismatch',
        lostNotes: 'Customer expected ₹600/sq ft, market rate is ₹1000+'
      },
      notes: [],
      activities: [
        {
          id: 'act_7',
          type: 'deal_closed_lost',
          title: 'Deal Closed Lost',
          description: 'Marked Closed Lost: Budget mismatch.',
          createdAt: yesterday,
          createdByName: 'Nitin Deshmukh'
        }
      ]
    }
  ];
}
