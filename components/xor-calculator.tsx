"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function XORCalculator() {
    const [inputType, setInputType] = useState<"ascii" | "hex" | "binary">("ascii")
    const [inputA, setInputA] = useState("")
    const [inputB, setInputB] = useState("")
    const [result, setResult] = useState("")
    const [resultHex, setResultHex] = useState("")

    useEffect(() => {
        calculate()
    }, [inputA, inputB, inputType])

    const calculate = () => {
        try {
            if (!inputA || !inputB) {
                setResult("")
                setResultHex("")
                return
            }

            const bufA = toBuffer(inputA, inputType)
            const bufB = toBuffer(inputB, inputType)

            // Cyclic XOR if lengths differ
            const maxLength = Math.max(bufA.length, bufB.length)
            const res = new Uint8Array(maxLength)

            for (let i = 0; i < maxLength; i++) {
                const byteA = bufA[i % bufA.length]
                const byteB = bufB[i % bufB.length]
                res[i] = byteA ^ byteB
            }

            // Output Result
            setResultHex(Array.from(res).map(b => b.toString(16).padStart(2, "0")).join(""))

            let ascii = ""
            for (let i = 0; i < res.length; i++) {
                const code = res[i]
                if (code >= 32 && code <= 126) ascii += String.fromCharCode(code)
                else ascii += "."
            }
            setResult(ascii)

        } catch (e) {
            // invalid input
        }
    }

    const toBuffer = (str: string, type: "ascii" | "hex" | "binary"): Uint8Array => {
        if (type === "ascii") {
            return new TextEncoder().encode(str)
        } else if (type === "hex") {
            const hex = str.replace(/[^0-9a-fA-F]/g, "")
            if (hex.length % 2 !== 0) throw new Error("Invalid hex")
            const len = hex.length / 2
            const u8 = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                u8[i] = parseInt(hex.substr(i * 2, 2), 16)
            }
            return u8
        } else if (type === "binary") {
            const bin = str.replace(/[^01]/g, "")
            // Pad to 8
            const len = Math.ceil(bin.length / 8)
            const u8 = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                u8[i] = parseInt(bin.substr(i * 8, 8).padEnd(8, "0"), 2) // Careful with padding direction, actually standard input usually implies blocks of 8. 
                // Let's refine: assume input is space separated bytes or continuous stream?
                // Simple: just parse 8 bits chunks
            }
            // Actually better binary parser:
            const bytes = str.split(" ").map(b => parseInt(b, 2)).filter(n => !isNaN(n))
            return new Uint8Array(bytes)
        }
        return new Uint8Array(0)
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>XOR Calculator</CardTitle>
                <CardDescription>Perform bitwise XOR on two inputs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Label>Input Type:</Label>
                    <Select value={inputType} onValueChange={(v: "ascii" | "hex" | "binary") => setInputType(v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ascii">ASCII</SelectItem>
                            <SelectItem value="hex">Hex</SelectItem>
                            {/* Binary input parsing is tricky in UI, simplified to ASCII/Hex mostly used */}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Input A</Label>
                        <Textarea value={inputA} onChange={(e) => setInputA(e.target.value)} className="font-mono h-[100px]" placeholder={inputType === "hex" ? "41 42 43" : "ABC"} />
                    </div>
                    <div className="space-y-2">
                        <Label>Input B (Key)</Label>
                        <Textarea value={inputB} onChange={(e) => setInputB(e.target.value)} className="font-mono h-[100px]" placeholder={inputType === "hex" ? "12" : "Key"} />
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <Label>Result (Hex)</Label>
                    <Input readOnly value={resultHex} className="font-mono bg-muted" />
                </div>
                <div className="space-y-2">
                    <Label>Result (ASCII representation)</Label>
                    <Input readOnly value={result} className="font-mono bg-muted" />
                </div>
            </CardContent>
        </Card>
    )
}
