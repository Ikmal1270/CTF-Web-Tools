"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { RSACalculator } from "./rsa-calculator"
import { FrequencyAnalyzer } from "./frequency-analyzer"

export function CryptoPlayground() {
    const [activeTab, setActiveTab] = useState("encoders")
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")
    const [mode, setMode] = useState<"encode" | "decode">("encode")

    // Encoder State
    const [encoderAlgo, setEncoderAlgo] = useState("base64")

    // Cipher State
    const [cipherAlgo, setCipherAlgo] = useState("rot13")
    const [cipherKey, setCipherKey] = useState("13") // Default ROT13 is shift 13

    // Hash State
    const [hashAlgo, setHashAlgo] = useState("SHA-256")

    useEffect(() => {
        processInput()
    }, [input, mode, activeTab, encoderAlgo, cipherAlgo, cipherKey, hashAlgo])

    const processInput = async () => {
        if (!input) {
            setOutput("")
            return
        }

        try {
            if (activeTab === "encoders") {
                let res = ""
                switch (encoderAlgo) {
                    case "base64":
                        res = mode === "encode" ? btoa(input) : atob(input)
                        break
                    case "hex":
                        res = mode === "encode"
                            ? Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
                            : input.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join("") || ""
                        break
                    case "url":
                        res = mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input)
                        break
                    case "binary":
                        res = mode === "encode"
                            ? Array.from(input).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
                            : input.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('')
                        break
                }
                setOutput(res)
            } else if (activeTab === "ciphers") {
                let res = ""
                if (cipherAlgo === "rot13") {
                    // ROT13 is Caesar with 13 shift
                    res = caesarCipher(input, 13)
                } else if (cipherAlgo === "caesar") {
                    const shift = parseInt(cipherKey) || 0
                    res = caesarCipher(input, mode === "encode" ? shift : -shift)
                } else if (cipherAlgo === "vigenere") {
                    res = vigenereCipher(input, cipherKey, mode === "encode")
                }
                setOutput(res)
            } else if (activeTab === "hashing") {
                // Hashing is always one-way, "decode" is impossible
                if (mode === "decode") {
                    setOutput("Hashing is one-way. Cannot decode.")
                    return
                }

                const msgBuffer = new TextEncoder().encode(input)
                const hashBuffer = await crypto.subtle.digest(hashAlgo, msgBuffer)
                const hashArray = Array.from(new Uint8Array(hashBuffer))
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
                setOutput(hashHex)
            }
        } catch (e) {
            setOutput("Error processing input: " + (e as Error).message)
        }
    }

    const caesarCipher = (str: string, shift: number) => {
        return str.replace(/[a-zA-Z]/g, (char) => {
            const base = char <= "Z" ? 65 : 97
            return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base)
        })
    }

    const vigenereCipher = (str: string, key: string, encrypt: boolean = true) => {
        if (!key) return str
        const keyNormalized = key.toUpperCase().replace(/[^A-Z]/g, "")
        if (!keyNormalized) return str

        let result = ""
        let keyIndex = 0

        for (let i = 0; i < str.length; i++) {
            const char = str[i]
            if (/[a-zA-Z]/.test(char)) {
                const base = char <= "Z" ? 65 : 97
                const shift = keyNormalized.charCodeAt(keyIndex % keyNormalized.length) - 65
                const charCode = char.charCodeAt(0) - base

                let newCode
                if (encrypt) {
                    newCode = (charCode + shift) % 26
                } else {
                    newCode = (charCode - shift + 26) % 26
                }

                result += String.fromCharCode(newCode + base)
                keyIndex++
            } else {
                result += char
            }
        }
        return result
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="encoders">Encoders</TabsTrigger>
                    <TabsTrigger value="ciphers">Ciphers</TabsTrigger>
                    <TabsTrigger value="hashing">Hashing</TabsTrigger>
                    <TabsTrigger value="rsa">RSA Tool</TabsTrigger>
                    <TabsTrigger value="freq">Analysis</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {activeTab === "rsa" ? (
                        <RSACalculator />
                    ) : activeTab === "freq" ? (
                        <FrequencyAnalyzer />
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Input Column */}
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Input</CardTitle>
                                    <CardDescription>Enter text to process</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        {activeTab === "encoders" && (
                                            <Select value={encoderAlgo} onValueChange={setEncoderAlgo}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Algorithm" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="base64">Base64</SelectItem>
                                                    <SelectItem value="hex">Hex</SelectItem>
                                                    <SelectItem value="url">URL</SelectItem>
                                                    <SelectItem value="binary">Binary</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {activeTab === "ciphers" && (
                                            <Select value={cipherAlgo} onValueChange={(val) => {
                                                setCipherAlgo(val)
                                                if (val === "rot13") setCipherKey("13")
                                                if (val === "caesar") setCipherKey("1")
                                                if (val === "vigenere") setCipherKey("KEY")
                                            }}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Cipher" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="rot13">ROT13</SelectItem>
                                                    <SelectItem value="caesar">Caesar</SelectItem>
                                                    <SelectItem value="vigenere">Vigenère</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                        {activeTab === "hashing" && (
                                            <Select value={hashAlgo} onValueChange={setHashAlgo}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Algorithm" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SHA-1">SHA-1</SelectItem>
                                                    <SelectItem value="SHA-256">SHA-256</SelectItem>
                                                    <SelectItem value="SHA-384">SHA-384</SelectItem>
                                                    <SelectItem value="SHA-512">SHA-512</SelectItem>
                                                    {/* MD5 not supported by subtle crypto directly in browser easily without lib, standardizing on SHA family for now OR I can implement MD5 later */}
                                                </SelectContent>
                                            </Select>
                                        )}

                                        {activeTab === "ciphers" && cipherAlgo === "caesar" && (
                                            <Input
                                                type="number"
                                                value={cipherKey}
                                                onChange={(e) => setCipherKey(e.target.value)}
                                                className="w-20"
                                                placeholder="Shift"
                                            />
                                        )}
                                        {activeTab === "ciphers" && cipherAlgo === "vigenere" && (
                                            <Input
                                                type="text"
                                                value={cipherKey}
                                                onChange={(e) => setCipherKey(e.target.value)}
                                                className="w-40"
                                                placeholder="Key"
                                            />
                                        )}
                                    </div>

                                    <Textarea
                                        placeholder="Type here..."
                                        className="min-h-[200px] font-mono"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                    />
                                </CardContent>
                            </Card>

                            {/* Output Column */}
                            <Card className="h-full bg-muted/50">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Output</CardTitle>
                                            <CardDescription>Result of the operation</CardDescription>
                                        </div>
                                        {activeTab !== "hashing" && (
                                            <div className="flex items-center space-x-2 bg-background p-1 rounded-md border">
                                                <Button
                                                    variant={mode === "encode" ? "secondary" : "ghost"}
                                                    size="sm"
                                                    onClick={() => setMode("encode")}
                                                >
                                                    Encode
                                                </Button>
                                                <Button
                                                    variant={mode === "decode" ? "secondary" : "ghost"}
                                                    size="sm"
                                                    onClick={() => setMode("decode")}
                                                >
                                                    Decode
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea
                                        readOnly
                                        className="min-h-[200px] font-mono bg-background"
                                        value={output}
                                    />
                                    <Button variant="outline" className="w-full" onClick={() => navigator.clipboard.writeText(output)}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Output
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    )
}
