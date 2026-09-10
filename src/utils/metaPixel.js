const safeText = (value, maxLength = 160) => String(value || '').trim().slice(0, maxLength);

export const buildProjectMetaParameters = (project) => {
  const contentName = safeText(project?.name || project?.projectName);
  const contentId = safeText(project?.id || project?.slug || project?.publicSlug, 120);
  return {
    content_type: 'product',
    ...(contentName ? { content_name: contentName } : {}),
    ...(contentId ? { content_ids: [contentId] } : {})
  };
};

export const trackMetaEvent = (eventName, parameters = {}, fbq = globalThis.window?.fbq) => {
  if (typeof fbq !== 'function') return false;
  fbq('track', eventName, parameters);
  return true;
};

export const trackViewContent = (project) => (
  trackMetaEvent('ViewContent', buildProjectMetaParameters(project))
);

export const trackLead = ({ project, leadType }) => (
  trackMetaEvent('Lead', {
    ...buildProjectMetaParameters(project),
    content_category: safeText(leadType, 80) || 'project_enquiry'
  })
);
