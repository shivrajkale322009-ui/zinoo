import NotificationCenter from '../../NotificationCenter';
import ProfileDropdown from '../../ProfileDropdown';
import BuyerSearchHeader from '../Search/BuyerSearchHeader';

export default function BuyerWorkspaceHeader({
  homeSearchQuery,
  voiceSearchActive,
  searchableProjects,
  placeSuggestions,
  placeSearchError,
  onQueryChange,
  onSearchKeyDown,
  onClearSearch,
  onStartVoiceSearch,
  onProjectSelect,
  onPlaceSelect,
  notifications,
  user,
  isAdmin,
  onThemeToggle,
  isDarkMode,
  permissions,
  currentView,
  onViewChange,
  onBackToAdmin,
  selectedSeller
}) {
  return (
    <header className="buyer-workspace-header">
      <BuyerSearchHeader
        homeSearchQuery={homeSearchQuery}
        voiceSearchActive={voiceSearchActive}
        searchableProjects={searchableProjects}
        placeSuggestions={placeSuggestions}
        placeSearchError={placeSearchError}
        onQueryChange={onQueryChange}
        onSearchKeyDown={onSearchKeyDown}
        onClearSearch={onClearSearch}
        onStartVoiceSearch={onStartVoiceSearch}
        onProjectSelect={onProjectSelect}
        onPlaceSelect={onPlaceSelect}
      />
      <NotificationCenter notifications={notifications} userId={user?.uid} isAdmin={isAdmin} />
      <ProfileDropdown
        user={user}
        onThemeToggle={onThemeToggle}
        isDarkMode={isDarkMode}
        permissions={permissions}
        currentView={currentView}
        onViewChange={onViewChange}
        onBackToAdmin={onBackToAdmin}
        selectedSeller={selectedSeller}
        hideChevron
      />
    </header>
  );
}
