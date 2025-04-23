"use client"

import { useState, useEffect } from "react"

export function useSidebarState(defaultState = true) {
  const [isOpen, setIsOpen] = useState(defaultState)

  // Initialize from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-state")
    if (savedState) {
      setIsOpen(savedState === "open")
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("sidebar-state", isOpen ? "open" : "closed")
  }, [isOpen])

  return [isOpen, setIsOpen] as const
}
