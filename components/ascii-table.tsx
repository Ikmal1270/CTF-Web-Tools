"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AsciiTable() {
    const chars = []
    for (let i = 0; i < 128; i++) {
        // Control chars
        let char = String.fromCharCode(i)
        let desc = char
        if (i < 32 || i === 127) {
            if (i === 0) desc = "NUL"
            else if (i === 9) desc = "TAB"
            else if (i === 10) desc = "LF"
            else if (i === 13) desc = "CR"
            else if (i === 27) desc = "ESC"
            else if (i === 127) desc = "DEL"
            else desc = "CTL"
        } else if (i === 32) {
            desc = "SPC"
        }

        chars.push({
            dec: i,
            hex: i.toString(16).toUpperCase().padStart(2, "0"),
            bin: i.toString(2).padStart(8, "0"),
            char: desc
        })
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>ASCII Table</CardTitle>
                <CardDescription>Reference for 7-bit ASCII codes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-px bg-border">
                    {chars.map((c) => (
                        <div key={c.dec} className="bg-background p-2 text-xs flex flex-col items-center hover:bg-muted/50 transition-colors">
                            <span className="font-bold text-primary">{c.char}</span>
                            <div className="text-[10px] text-muted-foreground flex flex-col items-center mt-1">
                                <span>{c.dec}</span>
                                <span>0x{c.hex}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
