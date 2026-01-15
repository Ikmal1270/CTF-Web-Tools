"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export function FrequencyAnalyzer() {
    const [text, setText] = useState("")

    const frequencies = useMemo(() => {
        const counts: Record<string, number> = {}
        const total = text.replace(/[^a-zA-Z]/g, "").length
        if (total === 0) return []

        for (const char of text.toLowerCase()) {
            if (/[a-z]/.test(char)) {
                counts[char] = (counts[char] || 0) + 1
            }
        }

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([char, count]) => ({
                char,
                count,
                percentage: (count / total) * 100
            }))
    }, [text])

    const englishFreqs = "ETAOINSHRDLCUMWFGYPBVKJXQZ"

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Frequency Analysis</CardTitle>
                <CardDescription>Analyze letter distribution to break substitution ciphers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Textarea
                    placeholder="Paste ciphertext here..."
                    className="min-h-[150px] font-mono"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {frequencies.length > 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 gap-y-2 text-sm">
                            <div className="font-bold border-b pb-1">Letter</div>
                            <div className="font-bold border-b pb-1">Count</div>
                            <div className="font-bold border-b pb-1">%</div>

                            {frequencies.map((item) => (
                                <>
                                    <div className="font-mono">{item.char.toUpperCase()}</div>
                                    <div className="font-mono">{item.count}</div>
                                    <div className="font-mono">{item.percentage.toFixed(1)}%</div>
                                </>
                            ))}
                        </div>

                        <div className="p-4 bg-muted rounded-md text-xs">
                            <p className="font-bold mb-2">English Language Standard Frequency:</p>
                            <p className="font-mono break-all tracking-widest">{englishFreqs}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
