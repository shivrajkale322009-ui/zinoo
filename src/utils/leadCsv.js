// Parse exported CSV without losing empty fields or quoted commas.
export function parseLeadCsv(text, fallbackDate) {
  const records = [];
  let record = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { record.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      record.push(field); records.push(record); record = []; field = '';
      if (char === '\r' && text[i + 1] === '\n') i += 1;
    } else field += char;
  }
  if (quoted) throw new Error('CSV contains an unclosed quotation mark.');
  if (field || record.length) { record.push(field); records.push(record); }
  let headers = (records[0] || []).map(value => value.replace(/^\uFEFF/, '').trim().toLowerCase());
  let phoneIndex = headers.findIndex(value => ['mobile', 'phone', 'phone number'].includes(value));
  let firstDataRow = 1;
  // Users also paste just the data rows from our five-column export.
  if (phoneIndex < 0 && records[0]?.length === 5 && /^\+?[\d\s()-]+$/.test(records[0][1].trim())) {
    headers = ['name', 'mobile', 'date', 'time', 'source lot'];
    phoneIndex = 1;
    firstDataRow = 0;
  }
  if (phoneIndex < 0) return null;
  const get = (row, header) => String(row[headers.indexOf(header)] || '').trim();
  const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  return records.slice(firstDataRow).filter(row => row.some(value => value.trim())).map((row, index) => {
    const digits = String(row[phoneIndex] || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (digits.length !== 10) throw new Error(`Invalid phone number on CSV row ${index + 2}.`);
    const rawDate = get(row, 'date');
    const named = rawDate.match(/^(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?$/i);
    const date = named ? `${named[3] || fallbackDate.slice(0,4)}-${String(months.findIndex(month => month.startsWith(named[2].toLowerCase())) + 1).padStart(2,'0')}-${named[1].padStart(2,'0')}` : rawDate;
    const parsed = new Date(`${date}T00:00:00Z`);
    if (date && (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10) !== date)) throw new Error(`Invalid date on CSV row ${index + 2}.`);
    const rawTime = get(row, 'time');
    const time = rawTime.match(/^(\d{1,2}):(\d{2})(?:\s*([ap])m)?$/i);
    if (rawTime && (!time || Number(time[2]) > 59 || Number(time[1]) > (time[3] ? 12 : 23) || (time[3] && Number(time[1]) < 1))) throw new Error(`Invalid time on CSV row ${index + 2}.`);
    const hours = time ? (time[3] ? Number(time[1]) % 12 + (time[3].toLowerCase() === 'p' ? 12 : 0) : Number(time[1])) : null;
    return { name: get(row,'name') || 'Unnamed lead', phone: `+91${digits}`, date, importTime: time ? `${String(hours).padStart(2,'0')}:${time[2]}` : '', sourceLot: get(row,'source lot') };
  });
}
