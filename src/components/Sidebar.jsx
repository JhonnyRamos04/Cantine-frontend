import React, { useState } from 'react'
import { ProfileIcon } from './icons/ProfileIcon'
import { DishIcon } from './icons/DishIcon'
import { ProductsIcon } from './icons/ProductsIcon'
import { MaterialIcon } from './icons/MaterialIcon'
import { ProviderIcon } from './icons/ProviderIcon'
import { CantineIcon } from './icons/CantineIcon'

export const Sidebar = ({ activeCategory, setActiveCategory }) => {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const menuItems = [
        { id: "perfil", label: "Perfil", icon: <ProfileIcon /> },
        // { id: "platos", label: "Platos", icon: <DishIcon /> },
        { id: "productos", label: "Productos", icon: <ProductsIcon /> },
        { id: "materiales", label: "Materiales", icon: <MaterialIcon /> },
        { id: "provedores", label: "Provedores", icon: <ProviderIcon /> },
    ]

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />}

            {/* Mobile menu button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-5 h-0.5 bg-gray-600"></div>
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
          ${collapsed ? "md:w-16" : "md:w-64"}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className={`text-2xl font-bold text-green-600 items-center justify-center ${collapsed ? "md:hidden" : "flex"}`}>Cantine<CantineIcon /></h1>
                    <button className="hidden md:block p-1 rounded-md hover:bg-gray-100" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? (
                            <div className="w-5 h-5 flex items-center justify-center">
                                <div className="w-0.5 h-3 bg-gray-600"></div>
                                <div className="w-3 h-0.5 bg-gray-600 absolute"></div>
                            </div>
                        ) : (
                            <div className="w-5 h-5 flex items-center justify-center">
                                <div className="w-3 h-0.5 bg-gray-600"></div>
                            </div>
                        )}
                    </button>
                </div>

                {/* Menu items */}
                <nav className="p-2">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.id} className='cursor-pointer'>
                                <button
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2 cursor-pointer  rounded-md text-left font-semibold text-gray-800
                    ${activeCategory === item.id ? "bg-green-50 text-green-600" : "hover:scale-105 hover:bg-green-50"}
                    transition-all
                  `}
                                    onClick={() => {
                                        setActiveCategory(item.id)
                                        if (window.innerWidth < 768) setMobileOpen(false)
                                    }}
                                >
                                    <div className="size-8 p-1 rounded-full bg-green-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className={`absolute bottom-0 w-full p-4 text-sm text-gray-500 border-t ${collapsed ? "md:hidden" : ""}`}>
                    <p>Cantine v1.0</p>
                </div>
            </aside>
        </>
    )
}
