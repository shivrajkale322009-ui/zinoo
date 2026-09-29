import React, { useState } from 'react';
import { createActivityRecord, formatLeadBudget } from '../../utils/crmLeadModel';

const PRESETS = [7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100];

export default function LeadBudgetSelect({ lead, onUpdateLead, currentUser }) {
  const [custom, setCustom] = useState(false);
  const [minimum, setMinimum] = useState('');
  const [maximum, setMaximum] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const exact = Number(lead.budgetMin) === Number(lead.budgetMax) && PRESETS.includes(Number(lead.budgetMax) / 100000);
  const value = exact ? String(Number(lead.budgetMax) / 100000) : lead.budgetMin || lead.budgetMax ? 'existing' : '';

  const save = async (budgetMin, budgetMax) => {
    setSaving(true);
    setError('');
    try {
      const activity = createActivityRecord({ type: 'budget_changed', title: 'Budget Changed', description: `Budget updated to ${formatLeadBudget(budgetMin, budgetMax)}.`, user: currentUser });
      const result = await onUpdateLead(lead.id, { budgetMin, budgetMax, activities: [activity, ...(lead.activities || [])] });
      if (result === false) throw new Error('Save failed');
      setCustom(false);
    } catch { setError('Could not save budget. Please try again.'); }
    finally { setSaving(false); }
  };

  return <div className="crm-budget-editor">
    <select className="crm-inline-select" aria-label={`Budget for ${lead.name || lead.phone || 'unnamed lead'}`} value={custom ? 'custom' : value} disabled={saving || !onUpdateLead}
      onChange={(event) => {
        const selected = event.target.value;
        if (selected === 'custom') {
          setMinimum(lead.budgetMin ? String(lead.budgetMin / 100000) : '');
          setMaximum(lead.budgetMax ? String(lead.budgetMax / 100000) : '');
          setError('');
          setCustom(true);
        } else if (selected !== 'existing') {
          save(selected ? Number(selected) * 100000 : null, selected ? Number(selected) * 100000 : null);
        }
      }}>
      <option value="">Budget on request</option>
      {PRESETS.map((amount) => <option key={amount} value={amount}>{amount === 100 ? '₹1 crore' : `₹${amount} lakh`}</option>)}
      {value === 'existing' && <option value="existing">{formatLeadBudget(lead.budgetMin, lead.budgetMax)}</option>}
      <option value="custom">Custom…</option>
    </select>
    {custom && <form className="crm-budget-custom" onSubmit={(event) => {
      event.preventDefault();
      const min = minimum === '' ? null : Number(minimum) * 100000;
      const max = maximum === '' ? null : Number(maximum) * 100000;
      if ((min === null && max === null) || (min !== null && (!Number.isFinite(min) || min <= 0)) || (max !== null && (!Number.isFinite(max) || max <= 0)) || (min !== null && max !== null && min > max)) {
        setError('Enter a positive budget. Maximum must be at least minimum.');
        return;
      }
      save(min, max);
    }}>
      <label>Minimum (₹ lakh)<input type="number" min="0.01" step="0.01" value={minimum} disabled={saving} onChange={(event) => setMinimum(event.target.value)} /></label>
      <label>Maximum (₹ lakh)<input type="number" min="0.01" step="0.01" value={maximum} disabled={saving} onChange={(event) => setMaximum(event.target.value)} /></label>
      <button className="crm-btn crm-btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      <button className="crm-btn crm-btn-secondary" type="button" disabled={saving} onClick={() => { setCustom(false); setError(''); }}>Cancel</button>
    </form>}
    {error && <small role="alert">{error}</small>}
  </div>;
}
