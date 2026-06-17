'use client'

import { useEffect } from 'react'

export function useMediaSession(
  title: string,
  artist: string,
  onNextTrack?: () => void,
  onPrevTrack?: () => void,
) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'Tuwa Audio',
      artwork: [
        {
          src: 'https://opentuwa.com/assets/ui/web_1200.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    })
    if (onNextTrack) {
      navigator.mediaSession.setActionHandler('nexttrack', onNextTrack)
    }
    if (onPrevTrack) {
      navigator.mediaSession.setActionHandler('previoustrack', onPrevTrack)
    }
  }, [title, artist, onNextTrack, onPrevTrack])
}
