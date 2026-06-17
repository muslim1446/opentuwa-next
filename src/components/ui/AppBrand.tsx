'use client'

export function AppBrand() {
  return (
    <a href="/" className="app-brand" aria-label="Tuwa Home">
      <span className="brand-icon" aria-hidden="true">
        <img src="https://opentuwa.com/assets/ui/favicon.svg" alt="" width={44} height={44} />
      </span>
      <span className="brand-text">Tuwa</span>
    </a>
  )
}
