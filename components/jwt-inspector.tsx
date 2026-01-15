"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, Lock, Unlock, Copy } from "lucide-react"

export function JwtInspector() {
    const [token, setToken] = useState("")
    const [header, setHeader] = useState<any>(null)
    const [payload, setPayload] = useState<any>(null)
    const [signature, setSignature] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        if (!token) {
            setHeader(null)
            setPayload(null)
            setSignature("")
            setError("")
            return
        }

        try {
            const parts = token.split(".")
            if (parts.length !== 3) {
                // Try to handle incomplete tokens or just wait
                if (parts.length > 3) throw new Error("Too many segments")
                return
            }

            const headerObj = JSON.parse(atob(parts[0]))
            const payloadObj = JSON.parse(atob(parts[1]))

            setHeader(headerObj)
            setPayload(payloadObj)
            setSignature(parts[2])
            setError("")
        } catch (e: any) {
            setError("Invalid JWT format or Base64 encoding. " + e.message)
            setHeader(null)
            setPayload(null)
            setSignature("")
        }
    }, [token])

    const attackNoneAlgo = () => {
        if (!header || !payload) return

        const newHeader = { ...header, alg: "None" } // 'none' is often case-sensitive, usually 'none' or 'None'
        const h64 = btoa(JSON.stringify(newHeader)).replace(/=/g, "")
        const p64 = btoa(JSON.stringify(payload)).replace(/=/g, "")

        // RFC 7515: Unsecured JWS = header.payload.
        setToken(`${h64}.${p64}.`)
    }

    const copyToken = () => {
        navigator.clipboard.writeText(token)
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2 h-[800px]">
            <div className="space-y-6 flex flex-col h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Encoded Token</CardTitle>
                        <CardDescription>Paste or modify the JWT here.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <Textarea
                            className="font-mono h-full resize-none text-sm break-all"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-4">
                        <Button variant="outline" size="sm" onClick={() => setToken("")}>Clear</Button>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={attackNoneAlgo} disabled={!header}>
                                <Unlock className="h-4 w-4 mr-2" />
                                Attack: Alg=None
                            </Button>
                            <Button size="sm" onClick={copyToken}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Token
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <div className="space-y-6 overflow-hidden flex flex-col h-full">
                {error ? (
                    <Card className="border-destructive/50 bg-destructive/10">
                        <CardContent className="flex items-center p-6 text-destructive">
                            <AlertCircle className="h-5 w-5 mr-3" />
                            {error}
                        </CardContent>
                    </Card>
                ) : header ? (
                    <ScrollArea className="h-full">
                        <div className="space-y-6 pr-4">
                            {/* Header */}
                            <Card className="border-red-500/50 bg-red-500/5">
                                <CardHeader className="py-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base text-red-400">Header</CardTitle>
                                        <Badge variant="outline" className="text-red-400 border-red-500/30">Algorithm & Type</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <pre className="text-sm font-mono text-foreground/80">
                                        {JSON.stringify(header, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>

                            {/* Payload */}
                            <Card className="border-purple-500/50 bg-purple-500/5">
                                <CardHeader className="py-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base text-purple-400">Payload</CardTitle>
                                        <Badge variant="outline" className="text-purple-400 border-purple-500/30">Data</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <pre className="text-sm font-mono text-foreground/80">
                                        {JSON.stringify(payload, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>

                            {/* Signature */}
                            <Card className="border-blue-500/50 bg-blue-500/5">
                                <CardHeader className="py-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base text-blue-400">Signature</CardTitle>
                                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                                            {header.alg === "None" ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                            {header.alg === "None" ? "Unsecured" : "Verified by Secret"}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm font-mono text-muted-foreground break-all">
                                        {signature || "(Empty Signature)"}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed rounded-lg">
                        <Lock className="h-12 w-12 mb-4" />
                        <p>Waiting for token input</p>
                    </div>
                )}
            </div>
        </div>
    )
}
