"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileSearch, Bug, CheckCircle, AlertTriangle, ArrowRight, Link as LinkIcon, Globe, Image as ImageIcon, Lock, Search } from "lucide-react"
import Link from "next/link"

type Finding = {
    type: "flag" | "suspicious" | "metadata" | "info"
    content: string
    description: string
    severity: "critical" | "high" | "medium" | "low" | "info"
    method: string
}

type ToolRecommendation = {
    name: string
    url: string
    icon: any
    reason: string
}

type ScanReport = {
    targetName: string
    targetType: string
    targetSize?: string
    timestamp: string
    findings: Finding[]
    recommendations: ToolRecommendation[]
}

export function SmartScanner() {
    const [isScanning, setIsScanning] = useState(false)
    const [report, setReport] = useState<ScanReport | null>(null)
    const [textInput, setTextInput] = useState("")

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            startFileScan(file)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const identifyMagicBytes = (arr: Uint8Array): string => {
        const header = Array.from(arr.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()

        const signatures: { [key: string]: string } = {
            "89504E47": "PNG Image",
            "FFD8FFE0": "JPEG Image",
            "FFD8FFE1": "JPEG Image",
            "47494638": "GIF Image",
            "25504446": "PDF Document",
            "504B0304": "ZIP Archive",
            "7F454C46": "ELF Executable",
            "4D5A9000": "Windows PE Executable",
            "377ABCAF": "7-Zip Archive",

        }

        if (signatures[header]) return signatures[header]
        if (header.startsWith("424D")) return "BMP Image"

        return "Unknown Binary"
    }

    const getRecommendations = (type: string): ToolRecommendation[] => {
        const recs: ToolRecommendation[] = []

        if (type.includes("Image")) {
            recs.push({
                name: "Steganography Module",
                url: "/stego",
                icon: ImageIcon,
                reason: "Deep LSB analysis and Exif extraction."
            })
        }

        if (type.includes("Text") || type === "Unknown Binary") {
            recs.push({
                name: "Cryptography",
                url: "/crypto",
                icon: Lock,
                reason: "Check for ciphers or encoded strings."
            })
            recs.push({
                name: "Manual Forensics",
                url: "/forensics",
                icon: Search,
                reason: "Inspect raw hex and strings manually."
            })
        }

        if (type === "IP Address" || type === "URL") {
            recs.push({
                name: "Web Exploitation",
                url: "/web",
                icon: Globe,
                reason: "Test for vulnerabilities, fuzzing, or inspect headers."
            })
        }

        return recs
    }

    // --- SCANNERS ---

    const startFileScan = async (file: File) => {
        setIsScanning(true)
        setReport(null)

        try {
            const arrayBuffer = await file.arrayBuffer()
            const buffer = new Uint8Array(arrayBuffer)
            const fileType = identifyMagicBytes(buffer)
            const findings: Finding[] = []

            // 1. Strings Analysis
            let textContent = ""
            for (let i = 0; i < buffer.length; i++) {
                const charCode = buffer[i]
                if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13) {
                    textContent += String.fromCharCode(charCode)
                } else {
                    if (textContent.slice(-1) !== " ") textContent += " "
                }
            }

            // 2. String/Regex Scan
            findings.push(...scanTextForPatterns(textContent, "File Strings"))

            // 3. Recursive Decode
            findings.push(...recursiveDecode(textContent))

            // 4. LSB Logic
            if (fileType.includes("Image")) {
                const lsb = await checkImageLSB(file)
                if (lsb) findings.push(lsb)
            }

            const scanResult: ScanReport = {
                targetName: file.name,
                targetType: fileType,
                targetSize: `${(file.size / 1024).toFixed(2)} KB`,
                timestamp: new Date().toLocaleString(),
                findings: findings.sort((a, b) => getSeverityScore(b.severity) - getSeverityScore(a.severity)),
                recommendations: getRecommendations(fileType)
            }
            setReport(scanResult)

        } catch (error) {
            console.error(error)
        } finally {
            setIsScanning(false)
        }
    }

    const startIpScan = async () => {
        if (!textInput) return
        setIsScanning(true)
        setReport(null)

        // Mock delay for "Network Scan"
        await new Promise(r => setTimeout(r, 1500))

        const target = textInput.trim()
        const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(target)
        const isURL = /^(http|https):\/\/[^ "]+$/.test(target)

        const findings: Finding[] = []
        let type = "Unknown Text"

        if (isIP) {
            type = "IP Address"
            findings.push({
                type: "info",
                content: target,
                description: "Target identified as IPv4 Address.",
                severity: "info",
                method: "Format Validation"
            })
            if (target.startsWith("192.168") || target.startsWith("10.")) {
                findings.push({
                    type: "suspicious",
                    content: "Private Network Class",
                    description: "Target is on a local private network.",
                    severity: "low",
                    method: "IP Class Analysis"
                })
            }
        } else if (isURL) {
            type = "URL"
            findings.push({
                type: "info",
                content: target,
                description: "Target identified as Web URL.",
                severity: "info",
                method: "Format Validation"
            })
        } else {
            // Treat as raw text/hash
            type = "Raw Text / Hash"
            findings.push(...scanTextForPatterns(target, "Raw Input"))
            findings.push(...recursiveDecode(target))
        }

        const scanResult: ScanReport = {
            targetName: target,
            targetType: type,
            timestamp: new Date().toLocaleString(),
            findings: findings.sort((a, b) => getSeverityScore(b.severity) - getSeverityScore(a.severity)),
            recommendations: getRecommendations(type)
        }
        setReport(scanResult)
        setIsScanning(false)
    }

    // --- HELPERS ---

    const scanTextForPatterns = (text: string, source: string): Finding[] => {
        const findings: Finding[] = []
        const flagRegex = /(ctf|flag|key|hackthebox|htb|pico)\{.*?\}/gi
        let match;
        while ((match = flagRegex.exec(text)) !== null) {
            findings.push({
                type: "flag",
                content: match[0],
                description: "Found standard flag pattern",
                severity: "critical",
                method: `Regex match in ${source}`
            })
        }
        return findings
    }

    const recursiveDecode = (text: string): Finding[] => {
        const findings: Finding[] = []
        const b64Regex = /[A-Za-z0-9+/]{20,}={0,2}/g
        let b64Match;
        while ((b64Match = b64Regex.exec(text)) !== null) {
            try {
                const decoded = atob(b64Match[0])
                if (/^[\x20-\x7E]*$/.test(decoded)) {
                    const innerFlags = scanTextForPatterns(decoded, "Base64 Decoded")
                    if (innerFlags.length > 0) {
                        findings.push(...innerFlags)
                    } else if (decoded.length > 8) {
                        findings.push({
                            type: "suspicious",
                            content: `Decoded: "${decoded.substring(0, 40)}..."`,
                            description: "Base64 string decode successful",
                            severity: "medium",
                            method: "Recursive Decode"
                        })
                    }
                }
            } catch (e) { }
        }
        return findings
    }

    const checkImageLSB = (file: File): Promise<Finding | null> => {
        return new Promise((resolve) => {
            const img = new Image()
            const url = URL.createObjectURL(file)
            img.onload = () => {
                const canvas = document.createElement("canvas")
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext("2d")
                if (ctx) {
                    ctx.drawImage(img, 0, 0)
                    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

                    // LSB Logic
                    let bits = "";
                    const maxBits = 5000 * 8;
                    for (let i = 0; i < data.length; i += 4) {
                        for (let j = 0; j < 3; j++) {
                            if (bits.length >= maxBits) break;
                            bits += (data[i + j] & 1);
                        }
                        if (bits.length >= maxBits) break;
                    }

                    const bytes: number[] = []
                    for (let i = 0; i < bits.length; i += 8) {
                        const byteVal = parseInt(bits.substr(i, 8), 2)
                        if (byteVal === 0) break;
                        bytes.push(byteVal)
                    }

                    if (bytes.length > 5) {
                        const textDecoder = new TextDecoder()
                        const msg = textDecoder.decode(new Uint8Array(bytes))
                        const lsbFlags = /(ctf|flag|key|hackthebox|htb|pico)\{.*?\}/gi.exec(msg)

                        if (lsbFlags) {
                            URL.revokeObjectURL(url)
                            resolve({
                                type: "flag",
                                content: lsbFlags[0],
                                description: "Visual LSB Analysis detected a flag.",
                                severity: "critical",
                                method: "Image LSB Extraction"
                            })
                            return
                        }
                    }
                    resolve(null)
                }
            }
            img.onerror = () => resolve(null)
            img.src = url
        })
    }

    const getSeverityScore = (s: string) => {
        switch (s) {
            case "critical": return 5
            case "high": return 4
            case "medium": return 3
            case "low": return 2
            default: return 1
        }
    }

    const downloadReport = () => {
        if (!report) return
        const lines = [
            "CTF OMNITOOL - INTELLIGENCE REPORT",
            `Target: ${report.targetName} (${report.targetType})`,
            "====================================",
            "FINDINGS:",
            ...report.findings.map(f => `[${f.severity.toUpperCase()}] ${f.type}: ${f.content}\nMethod: ${f.method}\nDetails: ${f.description}\n`),
            "",
            "RECOMMENDATIONS:",
            ...report.recommendations.map(r => `- ${r.name}: ${r.reason}`)
        ]
        const blob = new Blob([lines.join("\n")], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Report_${report.targetName}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-14rem)]">
            <div className="space-y-6 flex flex-col">
                <Tabs defaultValue="file" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="file">File Analysis</TabsTrigger>
                        <TabsTrigger value="net">Network / IP</TabsTrigger>
                    </TabsList>

                    <TabsContent value="file" className="mt-4">
                        <Card
                            {...getRootProps()}
                            className={`border-dashed cursor-pointer transition-colors h-64 flex flex-col justify-center items-center ${isScanning ? "opacity-50 pointer-events-none" : isDragActive ? "bg-accent" : ""}`}
                        >
                            <input {...getInputProps()} />
                            {isScanning ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <BotIcon className="h-12 w-12 mb-4 text-primary" />
                                    <p className="font-medium">AI Analyzing File...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center p-4">
                                    <FileSearch className="h-12 w-12 mb-4 text-muted-foreground" />
                                    <p className="font-medium text-lg">Drop Artifact Here</p>
                                    <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                                        Auto-detects file type, scans for flags (Stego/Text), and recommends tools.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="net" className="mt-4">
                        <Card className="h-64 flex flex-col justify-center p-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target IP, URL, or Hash</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="192.168.1.1 or http://example.com"
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                        />
                                        <Button onClick={startIpScan} disabled={isScanning || !textInput}>
                                            {isScanning ? "Scanning..." : "Scan"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <p>Supported inputs:</p>
                                    <ul className="list-disc pl-4 mt-1 space-y-1">
                                        <li>IPv4 Addresses (e.g., 10.10.10.5)</li>
                                        <li>Web URLs (e.g., http://target.htb)</li>
                                        <li>Text / Hashes (e.g., base64 strings)</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Capabilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Magic Byte & File Type Identification</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Image Steganography (LSB Extraction)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Recursive Base64 Decoding</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Network Target Classification (IP/URL)</span>
                        </div>
                    </CardContent>
                </Card>

                {report && report.recommendations.length > 0 && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BotIcon className="h-5 w-5" />
                                Recommended Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {report.recommendations.map((rec, i) => (
                                    <Link key={i} href={rec.url}>
                                        <div className="flex items-center justify-between p-3 bg-background rounded-lg border hover:border-primary transition-all group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 transition-colors">
                                                    <rec.icon className="h-4 w-4 text-foreground group-hover:text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{rec.name}</div>
                                                    <div className="text-xs text-muted-foreground">{rec.reason}</div>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader className="bg-muted/20 flex flex-row items-center justify-between py-4">
                    <div className="space-y-1">
                        <CardTitle>Intelligence Report</CardTitle>
                        <CardDescription>
                            {report ? report.targetName : "Ready for input"}
                        </CardDescription>
                    </div>
                    {report && (
                        <Button size="sm" variant="outline" onClick={downloadReport}>
                            <Upload className="mr-2 h-4 w-4 rotate-180" /> Export
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                    {report ? (
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between text-sm bg-muted/50 p-3 rounded-lg">
                                    <span className="text-muted-foreground">Target Type</span>
                                    <Badge variant="outline" className="font-mono">{report.targetType}</Badge>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <Bug className="h-4 w-4" />
                                        Detected Artefacts ({report.findings.length})
                                    </h3>

                                    {report.findings.length === 0 ? (
                                        <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/5">
                                            <p className="text-muted-foreground font-medium">No threats detected</p>
                                            <p className="text-xs text-muted-foreground mt-1">Target appears clean or obfuscated.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {report.findings.map((f, i) => (
                                                <div key={i} className="group border rounded-lg p-4 bg-card hover:shadow-md transition-all">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <Badge variant={f.severity === 'critical' ? 'destructive' : f.severity === 'high' ? 'destructive' : 'secondary'}>
                                                            {f.severity.toUpperCase()}
                                                        </Badge>
                                                        <span className="text-xs font-mono text-muted-foreground">{f.method}</span>
                                                    </div>
                                                    <div className="bg-black/40 p-2.5 rounded-md mb-2 font-mono text-sm break-all text-green-400 border border-white/5">
                                                        {f.content}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{f.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 p-8 text-center space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                <BotIcon className="relative h-16 w-16 text-muted-foreground/40" />
                            </div>
                            <div className="max-w-xs space-y-2">
                                <p className="font-medium text-foreground/80">Awaiting Target</p>
                                <p className="text-sm">Enter an IP, URL, or drop a file to generate a comprehensive intelligence report.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function BotIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    )
}
