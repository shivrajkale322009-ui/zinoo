const PROFILE_FIELDS = Object.freeze([
  'businessName',
  'publicDescription',
  'publicLogo',
  'publicOfficeLocation',
  'publicPhone',
  'publicWebsite',
  'yearsInBusiness',
  'developerProfileVisible'
]);

const cleanString = (value, field, max, { required = false } = {}) => {
  if (typeof value !== 'string') throw new TypeError(`${field} must be a string.`);
  const clean = value.trim();
  if (required && clean.length < 2) throw new TypeError(`${field} must contain at least 2 characters.`);
  if (clean.length > max) throw new TypeError(`${field} must be ${max} characters or fewer.`);
  return clean;
};

const validateDeveloperProfileUpdate = (input = {}) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Developer profile data is required.');
  if (!Object.keys(input).every((key) => PROFILE_FIELDS.includes(key))) throw new TypeError('Developer profile contains unsupported fields.');
  const website = cleanString(input.publicWebsite ?? '', 'Website', 1000);
  if (website && !/^https:\/\//i.test(website)) throw new TypeError('Website must use HTTPS.');
  const logo = cleanString(input.publicLogo ?? '', 'Logo URL', 2000);
  if (logo && !/^https:\/\//i.test(logo)) throw new TypeError('Logo URL must use HTTPS.');
  const years = Number(input.yearsInBusiness);
  if (!Number.isInteger(years) || years < 0 || years > 150) throw new TypeError('Years in business must be a whole number between 0 and 150.');
  if (typeof input.developerProfileVisible !== 'boolean') throw new TypeError('Profile visibility must be true or false.');
  return {
    businessName: cleanString(input.businessName ?? '', 'Developer / Company Name', 120, { required: true }),
    publicDescription: cleanString(input.publicDescription ?? '', 'Business Description', 600),
    publicLogo: logo,
    publicOfficeLocation: cleanString(input.publicOfficeLocation ?? '', 'Office Location', 200),
    publicPhone: cleanString(input.publicPhone ?? '', 'Public Phone', 30),
    publicWebsite: website,
    yearsInBusiness: years,
    developerProfileVisible: input.developerProfileVisible
  };
};

module.exports = { PROFILE_FIELDS, validateDeveloperProfileUpdate };
