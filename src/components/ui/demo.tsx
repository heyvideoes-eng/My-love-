"use client"
import { DynamicIsland, DynamicIslandProps } from "@/components/ui/dynamic-island";
import { useState } from "react"

export default function DemoOne() {
  const [view, setView] = useState<DynamicIslandProps["view"]>("idle")
  return <DynamicIsland view={view} onViewChange={setView} />
}
