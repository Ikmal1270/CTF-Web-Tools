"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Link as LinkIcon, Lock, Globe, Search, Home, Menu, Image, Calculator, BookOpen, Terminal } from "lucide-react"

const sidebarItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Cryptography", href: "/crypto", icon: Lock },
    { name: "Web Tools", href: "/web", icon: Globe },
    { name: "Steganography", href: "/stego", icon: Image },
    { name: "Reference Library", href: "/references", icon: BookOpen },
    { name: "Terminal Bridge", href: "/terminal", icon: Terminal },
    { name: "Misc Tools", href: "/misc", icon: Calculator },
    { name: "Smart Digital Forensics", href: "/forensics", icon: Search },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">CTF OmniTool</h1>
            </div>
            <nav className="flex-1 space-y-1 px-4">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            pathname === item.href && "bg-accent text-accent-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground text-center">v1.0.0 Alpha</p>
                <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
                    Created by M.N.Ikmal with Anti Gravity
                </p>
            </div>
        </div>
    )
}
