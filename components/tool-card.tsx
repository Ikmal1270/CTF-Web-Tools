import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface ToolCardProps {
    name: string
    description: string
    category: string
    url?: string
}

export function ToolCard({ name, description, category, url }: ToolCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">{name}</CardTitle>
                    <Badge variant="outline">{category}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 text-primary hover:underline"
                    >
                        Visit Website <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </CardContent>
        </Card>
    )
}
