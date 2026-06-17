'use client'

export function LoadingOverlay() {
  return (
    <div id="loading-overlay">
      <nav id="splash-footer">
        <h2 className="heroz-title-text" id="doors-hero-title" />
      </nav>
      <div className="loader-content">
        <div className="loader-spinner" />
        <div className="loader-text" id="loader-text" />
        <button id="start-btn" className="start-btn" data-i18n="player.start">
          Start
        </button>
      </div>
    </div>
  )
}
