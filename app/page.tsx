import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Lock, Globe, Search, Image as ImageIcon, Calculator } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const modules = [
    {
      title: "Cryptography",
      description: "Decode, encode, and crack ciphers. Includes Base64, Hex, ROT13, and more.",
      icon: Lock,
      href: "/crypto",
      color: "text-blue-500",
    },
    {
      title: "Web Exploitation",
      description: "Analyze HTTP requests, generate payloads, and decode web artifacts.",
      icon: Globe,
      href: "/web",
      color: "text-green-500",
    },
    {
      title: "Forensics",
      description: "Analyze file signatures, extract metadata, and investigate binary blobs.",
      icon: Search,
      href: "/forensics",
      color: "text-orange-500",
    },
    {
      title: "Steganography",
      description: "Reveal hidden data in images using LSB analysis and Exif metadata.",
      icon: ImageIcon,
      href: "/stego",
      color: "text-purple-500",
    },
    {
      title: "Misc Tools",
      description: "XOR Calculator, ASCII Table, and other utilities.",
      icon: Calculator,
      href: "/misc",
      color: "text-pink-500",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Select a module to get started.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full border-muted">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                  <CardTitle>{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-primary">Open Module &rarr;</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
