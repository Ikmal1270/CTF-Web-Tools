"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Trash, Plus, Play, Loader2 } from "lucide-react"

export function RequestBuilder() {
    const [url, setUrl] = useState("https://example.com")
    const [method, setMethod] = useState("GET")
    const [headers, setHeaders] = useState<{ key: string, value: string }[]>([{ key: "", value: "" }])
    const [body, setBody] = useState("")
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const addHeader = () => setHeaders([...headers, { key: "", value: "" }])
    const removeHeader = (index: number) => {
        const newHeaders = [...headers]
        newHeaders.splice(index, 1)
        setHeaders(newHeaders)
    }
    const updateHeader = (index: number, field: "key" | "value", val: string) => {
        const newHeaders = [...headers]
        newHeaders[index][field] = val
        setHeaders(newHeaders)
    }

    const sendRequest = async () => {
        setLoading(true)
        setResponse(null)
        try {
            const headerObj: Record<string, string> = {}
            headers.forEach(h => {
                if (h.key) headerObj[h.key] = h.value
            })

            const res = await fetch("/api/proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url,
                    method,
                    headers: headerObj,
                    body: method !== "GET" ? body : undefined
                })
            })
            const data = await res.json()
            setResponse(data)
        } catch (e) {
            setResponse({ error: (e as Error).message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2 h-full">
            <div className="space-y-6 flex flex-col h-full">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Request Config</CardTitle>
                        <CardDescription>Construct your HTTP request</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                    <SelectItem value="HEAD">HEAD</SelectItem>
                                    <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://target.com" />
                            <Button onClick={sendRequest} disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Headers</Label>
                                <Button variant="ghost" size="sm" onClick={addHeader}><Plus className="h-3 w-3" /></Button>
                            </div>
                            {headers.map((h, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input placeholder="Key" value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} className="h-8 text-xs" />
                                    <Input placeholder="Value" value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} className="h-8 text-xs" />
                                    <Button variant="ghost" size="sm" onClick={() => removeHeader(i)}><Trash className="h-3 w-3" /></Button>
                                </div>
                            ))}
                        </div>

                        {method !== "GET" && (
                            <div className="space-y-2">
                                <Label>Body</Label>
                                <Textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="min-h-[150px] font-mono text-xs"
                                    placeholder='{"foo": "bar"}'
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6 flex flex-col h-full">
                <Card className="flex-1 overflow-hidden flex flex-col">
                    <CardHeader>
                        <CardTitle>Response</CardTitle>
                        <CardDescription>
                            {response ? (
                                <span className={response.status >= 400 ? "text-destructive" : "text-green-500"}>
                                    {response.status} {response.statusText}
                                </span>
                            ) : "Waiting for response..."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto bg-muted/30 p-0">
                        {response && (
                            <div className="p-4 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Headers</Label>
                                    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                                        {JSON.stringify(response.headers, null, 2)}
                                    </pre>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Body</Label>
                                    <pre className="text-xs font-mono whitespace-pre-wrap bg-background p-2 rounded border">
                                        {response.body}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
