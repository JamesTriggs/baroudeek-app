import React, { createContext, useContext, useState } from 'react'

interface MapHighlightContextType {
  highlightedSegment: number | null
  setHighlightedSegment: (segment: number | null) => void
}

const MapHighlightContext = createContext<MapHighlightContextType | undefined>(undefined)

export const useMapHighlight = () => {
  const context = useContext(MapHighlightContext)
  if (!context) {
    throw new Error('useMapHighlight must be used within a MapHighlightProvider')
  }
  return context
}

interface MapHighlightProviderProps {
  children: React.ReactNode
}

export const MapHighlightProvider = ({ children }: MapHighlightProviderProps) => {
  const [highlightedSegment, setHighlightedSegment] = useState<number | null>(null)

  return (
    <MapHighlightContext.Provider value={{ highlightedSegment, setHighlightedSegment }}>
      {children}
    </MapHighlightContext.Provider>
  )
}