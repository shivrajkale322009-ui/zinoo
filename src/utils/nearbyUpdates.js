import { formatRelativeDate } from './formatIndian';
import { getVerifiedDocumentCount } from './projectDocuments';

const dateValue = (value) => {
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export function deriveNearbyUpdates(projects = [], maxItems = 8) {
  return projects
    .map((project) => {
      const updatedAt = project.updatedAt || project.reviewedAt || project.createdAt;
      const verifiedDocuments = getVerifiedDocumentCount(project);
      const type = verifiedDocuments > 0 ? 'verification' : project.createdAt ? 'launch' : 'update';
      const headline = type === 'verification'
        ? `${project.name || 'Project'} has verified documents`
        : type === 'launch'
          ? `${project.name || 'A project'} was recently added`
          : `${project.name || 'Project'} was recently updated`;
      return {
        id: project.id,
        type,
        headline,
        description: verifiedDocuments ? `${verifiedDocuments} verified document${verifiedDocuments === 1 ? '' : 's'} available for review.` : 'Review the latest project details and availability.',
        area: [project.village, project.taluka].filter(Boolean).join(', ') || 'Pune growth corridor',
        timestamp: formatRelativeDate(updatedAt),
        sortValue: dateValue(updatedAt),
        image: project.thumbnail || project.heroImage || '',
        project
      };
    })
    .sort((left, right) => right.sortValue - left.sortValue)
    .slice(0, maxItems);
}
