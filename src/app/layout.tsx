import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Tuwa - Premium Quran Audio Player',
  description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
  authors: [{ name: 'Tuwa Media' }],
  manifest: '/manifest.json',
  openGraph: {
    siteName: 'Tuwa',
    title: 'Tuwa - Premium Quran Audio Player',
    description: 'Distraction-free Quran streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
    type: 'website',
    locale: 'en_US',
    images: ['https://opentuwa.com/assets/ui/web_1200.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tuwa - Premium Quran Audio Player',
    description: 'Distraction-free Quran streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
    site: '@opentuwa',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Tuwa',
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1C1C1E' },
    { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="auto" prefix="og: http://ogp.me/ns# book: http://ogp.me/ns/book#" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta name="application-name" content="Tuwa" />
        <meta name="apple-mobile-web-app-orientations" content="portrait-primary" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" type="image/png" href="https://opentuwa.com/assets/ui/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="https://opentuwa.com/assets/ui/favicon.svg" />
        <link rel="shortcut icon" href="https://opentuwa.com/assets/ui/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="https://opentuwa.com/assets/ui/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="https://opentuwa.com/assets/ui/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="https://opentuwa.com/assets/ui/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="https://opentuwa.com/assets/ui/apple-touch-icon.png" />
        <link rel="mask-icon" href="https://opentuwa.com/assets/ui/favicon.svg" color="#1C1C1E" />
        <link type="text/plain" rel="author" href="humans.txt" />
        <link rel="preconnect" href="https://everyayah.com" />
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  name: 'Tuwa',
                  alternateName: 'Tuwa Quran Audio Player',
                  url: 'https://opentuwa.com/',
                  description: 'Premium distraction-free Quran audio streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
                  publisher: { '@type': 'Organization', name: 'Tuwa Media', url: 'https://opentuwa.com/', logo: { '@type': 'ImageObject', url: 'https://opentuwa.com/assets/ui/favicon-96x96.png' } },
                  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: 'https://opentuwa.com/?search={search_term_string}' }, 'query-input': 'required name=search_term_string' },
                  inLanguage: 'en-US',
                },
                {
                  '@type': 'SoftwareApplication',
                  name: 'Tuwa',
                  alternateName: 'Tuwa Quran Audio Player',
                  applicationCategory: 'MusicApplication',
                  operatingSystem: 'Web, iOS, tvOS, Android',
                  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
                  author: { '@type': 'Organization', name: 'Tuwa Media', url: 'https://opentuwa.com/' },
                  description: 'Distraction-free Quran streaming with verse-by-verse navigation, multiple reciters, and 50+ translations.',
                  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '32000000', bestRating: '5', worstRating: '1' },
                },
              ],
            }),
          }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('DOMContentLoaded', () => {
              const u = new URLSearchParams(window.location.search);
              if (u.has('regex')) { document.querySelectorAll('.app-brand').forEach(e => e.style.setProperty('display','none','important')); }
            });
            (function(){if(!navigator.serviceWorker)return;window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){})})})();
            (function(){document.addEventListener('contextmenu',function(e){e.preventDefault()});document.addEventListener('copy',function(e){e.preventDefault()});document.addEventListener('dragstart',function(e){e.preventDefault()})})();
            (function(){var o=new MutationObserver(function(){document.querySelectorAll('*').forEach(function(n){var c=n.childNodes;for(var i=0;i<c.length;i++){if(c[i].nodeType===3){c[i].textContent=c[i].textContent.replace(/[\\$€£¥₩₽₨₪₸₴₦]/g,'')}}});});o.observe(document.documentElement,{childList:true,subtree:true,characterData:true})})();
            (function(){var s=document.createElement('style');s.textContent='@keyframes eyeFadeActive{0%{opacity:0}100%{opacity:1}}.eye-fade-active{animation:eyeFadeActive 0.5s ease-out both}';document.head.appendChild(s);var o=new MutationObserver(function(){document.querySelectorAll('*').forEach(function(n){if(n.nodeType===1&&!n.classList.contains('eye-fade-active')){n.classList.add('eye-fade-active')}})});o.observe(document.documentElement,{childList:true,subtree:true})})();
            (function(){if(window.location.hostname.includes('github.io')){window.location.replace('https://opentuwa.pages.dev'+window.location.pathname+window.location.search)}})();
          `
        }} />
      </head>
      <body className="home">
        <div id="transition-fade-layer" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
