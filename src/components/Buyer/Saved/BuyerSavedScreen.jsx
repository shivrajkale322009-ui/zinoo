import { AlertCircle, Heart, Loader2 } from 'lucide-react';
import PropertyCard from '../../PropertyCard';
import { getPropertyDisplayModel } from '../../../utils/propertyDisplayModel';

export default function BuyerSavedScreen({
  projects,
  savedCount,
  unavailableCount = 0,
  loading = false,
  error = '',
  onProjectSelect,
  onDeveloperSelect,
  authRequired = false,
  onLogin
}) {
  return (
    <main className="buyer-primary-screen buyer-saved-screen" aria-labelledby="buyer-saved-title">
      <div className="buyer-primary-screen-inner">
        <header className="buyer-primary-screen-heading">
          <div>
            <h1 id="buyer-saved-title">Saved properties</h1>
          </div>
          {!loading && !error && savedCount > 0 && <strong className="buyer-saved-count">{savedCount}</strong>}
        </header>

        {loading ? (
          <div className="buyer-saved-status" role="status">
            <Loader2 className="spin" aria-hidden="true" />
            <p>Loading saved properties…</p>
          </div>
        ) : error ? (
          <div className="buyer-saved-status buyer-saved-error" role="alert">
            <AlertCircle aria-hidden="true" />
            <h2>Saved properties could not be loaded</h2>
            <p>{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="buyer-saved-status">
            <Heart aria-hidden="true" />
            <h2>No saved properties yet</h2>
            <p>Save properties you are interested in and they will appear here.</p>
            {unavailableCount > 0 && <small>{unavailableCount === 1 ? 'A previously saved project is no longer available.' : `${unavailableCount} previously saved projects are no longer available.`}</small>}
          </div>
        ) : (
          <>
            {unavailableCount > 0 && (
              <div className="buyer-saved-unavailable" role="status">
                <AlertCircle aria-hidden="true" />
                <span>{unavailableCount === 1 ? 'One saved project is no longer available.' : `${unavailableCount} saved projects are no longer available.`}</span>
              </div>
            )}
            <section className="buyer-saved-grid" aria-label="Saved properties">
              {projects.map((project) => (
                <PropertyCard
                  key={project.id}
                  project={project}
                  display={getPropertyDisplayModel(project)}
                  onViewDetails={onProjectSelect}
                  onDeveloperSelect={onDeveloperSelect}
                />
              ))}
            </section>
          </>
        )}
      </div>
      {authRequired && (
        <div className="buyer-auth-mask" role="region" aria-label="Login required to view saved properties">
          <button type="button" className="buyer-auth-mask-login" onClick={onLogin}>Log in</button>
        </div>
      )}
    </main>
  );
}
