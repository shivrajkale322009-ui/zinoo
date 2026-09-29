import { formatIndianCurrency } from './formatIndian.js';

const cleanText = (value) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();

export const getProjectShareData = (project = {}, url = '') => {
  const name = cleanText(project.name || project.projectName) || 'Zinoo property';
  const price = formatIndianCurrency(project.startingPrice ?? project.priceFrom);
  const address = cleanText(project.completeAddress || project.display?.map?.address || project.locationLabel || project.location || [project.village, project.taluka, project.district, project.area].filter(Boolean).join(', '));
  const details = [
    `🏡 ${name}`,
    price !== 'Price on request' ? `💰Starting from ${price}` : '',
    address ? `📍${address}` : ''
  ].filter(Boolean);

  const text = `${details.join('\n')}\n\nView project details, photos & availability on Zinoo${url ? `\n👉 ${url}` : ''}`;
  return { title: name, text };
};
