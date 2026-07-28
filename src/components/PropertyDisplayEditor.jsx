import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import {
  createDisplayItem,
  DISPLAY_ICON_OPTIONS,
  getPropertyDisplayModel
} from '../utils/propertyDisplayModel';

const TABS = ['General', 'Pricing', 'Hero', 'Features', 'Documents', 'Location', 'Visibility', 'Advanced'];

function Toggle({ label, checked, onChange }) {
  return <label className="display-editor-toggle"><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}

function Field({ label, value, onChange, type = 'text', options, min, step }) {
  return (
    <label className="display-editor-field">
      <span>{label}</span>
      {options ? (
        <select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>)}
        </select>
      ) : (
        <input type={type} value={value ?? ''} min={min} step={step} onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)} />
      )}
    </label>
  );
}

function Visibility({ section, update }) {
  return (
    <div className="display-editor-visibility">
      <Toggle label="Show on card" checked={section.showOnCard} onChange={(value) => update({ showOnCard: value })} />
      <Toggle label="Show on details" checked={section.showOnDetails} onChange={(value) => update({ showOnDetails: value })} />
      {'order' in section && <Field label="Order" type="number" value={section.order} onChange={(value) => update({ order: value })} />}
    </div>
  );
}

function ItemsEditor({ title, items, onChange, type = 'feature', fields = ['title', 'value', 'icon', 'enabled'] }) {
  const updateItem = (index, changes) => onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item));
  const move = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next.map((item, order) => ({ ...item, order })));
  };

  return (
    <div className="display-items-editor">
      <div className="display-items-heading"><h4>{title}</h4><button type="button" onClick={() => onChange([...items, createDisplayItem(type)])}><Plus size={15} /> Add</button></div>
      {items.map((item, index) => (
        <div className="display-item-row" key={item.id || index}>
          {fields.includes('title') && <Field label="Title" value={item.title} onChange={(value) => updateItem(index, { title: value })} />}
          {fields.includes('value') && <Field label="Value" value={item.value} onChange={(value) => updateItem(index, { value })} />}
          {fields.includes('url') && <Field label="URL" value={item.url} onChange={(value) => updateItem(index, { url: value })} />}
          {fields.includes('type') && <Field label="Type" value={item.documentType} onChange={(value) => updateItem(index, { documentType: value })} />}
          {fields.includes('icon') && <Field label="Icon" value={item.icon} options={DISPLAY_ICON_OPTIONS} onChange={(value) => updateItem(index, { icon: value })} />}
          {fields.includes('verified') && <Toggle label="Verified" checked={item.verified} onChange={(value) => updateItem(index, { verified: value })} />}
          {fields.includes('showOnDetails') && <Toggle label="Show on details" checked={item.showOnDetails} onChange={(value) => updateItem(index, { showOnDetails: value })} />}
          {fields.includes('enabled') && <Toggle label="Enabled" checked={item.enabled} onChange={(value) => updateItem(index, { enabled: value })} />}
          <div className="display-item-actions">
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><ArrowUp size={15} /></button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down"><ArrowDown size={15} /></button>
            <button type="button" className="danger" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove"><Trash2 size={15} /></button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="display-editor-empty">No items configured.</p>}
    </div>
  );
}

export default function PropertyDisplayEditor({ property, onChange }) {
  const [activeTab, setActiveTab] = useState('General');
  const display = useMemo(() => getPropertyDisplayModel(property), [property]);
  const setDisplay = (nextDisplay) => onChange({ ...property, display: nextDisplay });
  const update = (key, changes) => setDisplay({ ...display, [key]: { ...display[key], ...changes } });

  return (
    <section className="property-display-editor">
      <div className="property-display-editor-heading">
        <div><span>Dynamic presentation</span><h3>Property Card &amp; Details Configuration</h3></div>
        <small>All values are stored under the project&apos;s nested display configuration.</small>
      </div>
      <nav className="property-display-editor-tabs" aria-label="Property display editor sections">
        {TABS.map((tab) => <button type="button" className={activeTab === tab ? 'active' : ''} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}
      </nav>

      <div className="property-display-editor-panel">
        {activeTab === 'General' && <>
          <div className="display-editor-grid">
            <Field label="Project Name" value={display.basic.projectName} onChange={(value) => update('basic', { projectName: value })} />
            <Field label="Short Title" value={display.basic.shortTitle} onChange={(value) => update('basic', { shortTitle: value })} />
            <Field label="Location Label" value={display.basic.location} onChange={(value) => update('basic', { location: value })} />
            <Field label="Village" value={display.basic.village} onChange={(value) => update('basic', { village: value })} />
            <Field label="Taluka" value={display.basic.taluka} onChange={(value) => update('basic', { taluka: value })} />
            <Field label="District" value={display.basic.district} onChange={(value) => update('basic', { district: value })} />
          </div>
          <label className="display-editor-field display-editor-full"><span>Short Description / Overview</span><textarea value={display.basic.shortDescription} onChange={(event) => { update('basic', { shortDescription: event.target.value }); update('overview', { body: event.target.value }); }} /></label>
        </>}

        {activeTab === 'Pricing' && <>
          <div className="display-editor-grid">
            <Field label="Starting Price" type="number" min="0" value={display.pricing.startingPrice} onChange={(value) => update('pricing', { startingPrice: value })} />
            <Field label="Price Prefix" value={display.pricing.pricePrefix} options={['Starting from', 'From', 'Starting at']} onChange={(value) => update('pricing', { pricePrefix: value })} />
            <Toggle label="Enable Cashback" checked={display.cashback.enabled} onChange={(value) => update('cashback', { enabled: value })} />
            <Field label="Cashback Amount" type="number" min="0" value={display.cashback.amount} onChange={(value) => update('cashback', { amount: value })} />
            <Field label="Cashback Label" value={display.cashback.label} onChange={(value) => update('cashback', { label: value })} />
            <Field label="Badge Color" type="color" value={display.cashback.badgeColor} onChange={(value) => update('cashback', { badgeColor: value })} />
          </div>
          <Visibility section={display.cashback} update={(changes) => update('cashback', changes)} />
          <div className="display-editor-grid">
            <Toggle label="Enable Rating" checked={display.rating.enabled} onChange={(value) => update('rating', { enabled: value })} />
            <Field label="Rating Value" type="number" min="0" step=".1" value={display.rating.value} onChange={(value) => update('rating', { value })} />
            <Field label="Review Count" type="number" min="0" value={display.rating.reviewCount} onChange={(value) => update('rating', { reviewCount: value })} />
          </div>
          <Visibility section={display.rating} update={(changes) => update('rating', changes)} />
        </>}

        {activeTab === 'Hero' && <>
          <div className="display-editor-grid">
            <Field label="Hero Image URL" value={display.media.heroImage} onChange={(value) => update('media', { heroImage: value })} />
            <Field label="Hero Badge" value={display.media.heroBadge} onChange={(value) => update('media', { heroBadge: value })} />
            <Toggle label="Verified" checked={display.verified.enabled} onChange={(value) => update('verified', { enabled: value })} />
            <Field label="Verified Badge Label" value={display.verified.label} onChange={(value) => update('verified', { label: value })} />
          </div>
          <Visibility section={display.verified} update={(changes) => update('verified', changes)} />
          <ItemsEditor title="Gallery Images" type="image" items={display.media.gallery} fields={['title', 'url', 'enabled']} onChange={(gallery) => update('media', { gallery })} />
        </>}

        {activeTab === 'Features' && <>
          <Visibility section={display.featureChips} update={(changes) => update('featureChips', changes)} />
          <ItemsEditor title="Feature Chips" items={display.featureChips.items} type="feature" fields={['title', 'icon', 'enabled']} onChange={(items) => update('featureChips', { items })} />
          <Visibility section={display.quickStats} update={(changes) => update('quickStats', changes)} />
          <ItemsEditor title="Quick Stats" items={display.quickStats.items} type="stat" onChange={(items) => update('quickStats', { items })} />
          <Visibility section={display.amenities} update={(changes) => update('amenities', changes)} />
          <ItemsEditor title="Amenities" items={display.amenities.items} type="amenity" fields={['title', 'enabled']} onChange={(items) => update('amenities', { items })} />
        </>}

        {activeTab === 'Documents' && <>
          <Visibility section={display.documents} update={(changes) => update('documents', changes)} />
          <ItemsEditor title="Verified Documents" items={display.documents.items} type="document" fields={['title', 'url', 'type', 'verified', 'showOnDetails', 'enabled']} onChange={(items) => update('documents', { items })} />
          <p className="display-editor-note">File uploads remain available in the existing Media &amp; Documents manager. This tab controls document presentation and visibility.</p>
        </>}

        {activeTab === 'Location' && <>
          <div className="display-editor-grid">
            <Toggle label="Enable Map" checked={display.map.enabled} onChange={(value) => update('map', { enabled: value })} />
            <Field label="Latitude" type="number" step=".000001" value={display.map.latitude} onChange={(value) => update('map', { latitude: value })} />
            <Field label="Longitude" type="number" step=".000001" value={display.map.longitude} onChange={(value) => update('map', { longitude: value })} />
            <Field label="Address" value={display.map.address} onChange={(value) => update('map', { address: value })} />
            <Field label="Google Maps Link" value={display.map.googleMapsLink} onChange={(value) => update('map', { googleMapsLink: value })} />
            <Field label="Directions Link" value={display.map.directionsLink} onChange={(value) => update('map', { directionsLink: value })} />
          </div>
          <Visibility section={display.map} update={(changes) => update('map', changes)} />
        </>}

        {activeTab === 'Visibility' && <>
          {['featureChips', 'quickStats', 'overview', 'amenities', 'documents', 'map', 'trust'].map((key) => (
            <div className="display-visibility-row" key={key}><strong>{key.replace(/([A-Z])/g, ' $1')}</strong><Visibility section={display[key]} update={(changes) => update(key, changes)} /></div>
          ))}
          <Field label="Display Order (comma separated section keys)" value={display.visibility.displayOrder.join(', ')} onChange={(value) => update('visibility', { displayOrder: value.split(',').map((item) => item.trim()).filter(Boolean) })} />
          <div className="display-editor-grid">
            <Toggle label="Show View Details" checked={display.actions.showViewDetails} onChange={(value) => update('actions', { showViewDetails: value })} />
            <Toggle label="Show Favourite" checked={display.actions.showFavourite} onChange={(value) => update('actions', { showFavourite: value })} />
            <Toggle label="Show Share" checked={display.actions.showShare} onChange={(value) => update('actions', { showShare: value })} />
            <Toggle label="Show Call" checked={display.actions.showCall} onChange={(value) => update('actions', { showCall: value })} />
            <Toggle label="Show View on Map" checked={display.actions.showMap} onChange={(value) => update('actions', { showMap: value })} />
            <Toggle label="Show Book Site Visit" checked={display.actions.showBookVisit} onChange={(value) => update('actions', { showBookVisit: value })} />
            <Toggle label="Show View Layout" checked={display.actions.showViewLayout} onChange={(value) => update('actions', { showViewLayout: value })} />
            <Field label="View Details Label" value={display.actions.viewDetailsLabel} onChange={(value) => update('actions', { viewDetailsLabel: value })} />
            <Field label="Call Label" value={display.actions.callLabel} onChange={(value) => update('actions', { callLabel: value })} />
            <Field label="Map Label" value={display.actions.mapLabel} onChange={(value) => update('actions', { mapLabel: value })} />
            <Field label="Book Visit Label" value={display.actions.bookVisitLabel} onChange={(value) => update('actions', { bookVisitLabel: value })} />
            <Field label="View Layout Label" value={display.actions.viewLayoutLabel} onChange={(value) => update('actions', { viewLayoutLabel: value })} />
          </div>
        </>}

        {activeTab === 'Advanced' && <>
          <Visibility section={display.trust} update={(changes) => update('trust', changes)} />
          <ItemsEditor title="Trust Information" items={display.trust.items} type="trust" onChange={(items) => update('trust', { items })} />
          <div className="display-editor-grid"><Field label="Call Number" value={display.actions.callNumber} onChange={(value) => update('actions', { callNumber: value })} /></div>
        </>}
      </div>
    </section>
  );
}
