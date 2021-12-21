import React, { useRef, useEffect } from "react";

const useElementOnScreen = (options, refetch, paginatedEntries) => {
  const containerRef = useRef(null)

  const callbackFunction = (entries) => {
    const [ entry ] = entries
    if (entry.isIntersecting && paginatedEntries && paginatedEntries.entries.length < paginatedEntries.totalEntries) {
      refetch(1, paginatedEntries.entries.length + 10)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options)
    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current)
    }
  }, [containerRef, options])

  return [containerRef]
}

export default useElementOnScreen
