export function templateMedia(template) {
  const header = template?.components?.find((part) => part.type === 'HEADER');
  const format = header?.format;
  const required = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(format);
  const samples = header?.example?.header_handle;
  const url = (Array.isArray(samples) ? samples : []).find((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
    } catch { return false; }
  }) || '';
  return { format, required, url };
}
