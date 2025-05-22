"use client"

import { useState } from "react"
import { Sidebar } from "./components/SideBar"
import { DashboardContent } from "./components/DashboardContent"

export default function App() {
  const [activeCategory, setActiveCategory] = useState("productos")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <main className="flex-1 overflow-auto md:ml-16 lg:ml-64 p-4">
          <DashboardContent activeCategory={activeCategory} />
        </main>
      </div>
    </div>
  )
}
