"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Binary } from "lucide-react"

// Simple Magic Bytes dictionary
const MAGIC_BYTES: Record<string, string> = {
    "89 50 4E 47": "PNG Image",
    "FF D8 FF": "JPEG Image",
    "25 50 44 46": "PDF Document",
    "50 4B 03 04": "ZIP Archive",
    "7F 45 4C 46": "ELF Executable",
    "4D 5A": "Windows PE Executable",
    "1F 8B": "GZIP Compressed",
    "42 5A 68": "BZIP2 Compressed",
    "52 61 72 21": "RAR Archive",
    "37 7A BC AF": "7-Zip Archive",
    "00 00 01 00": "ICO Image",

    "47 49 46 38": "GIF Image",
}

export function FileAnalyzer() {
    const [file, setFile] = useState<File | null>(null)
    const [hexView, setHexView] = useState<string>("")
    const [strings, setStrings] = useState<string[]>([]);
    const [fileType, setFileType] = useState<string>("Unknown")
    const [loading, setLoading] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0]
        if (f) {
            setFile(f)
            processFile(f)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const processFile = (f: File) => {
        setLoading(true)
        const reader = new FileReader()

        reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer
            const uint8 = new Uint8Array(buffer)

            // Generate Hex View (first 512 bytes)
            const hexParts = []
            for (let i = 0; i < Math.min(uint8.length, 512); i++) {
                hexParts.push(uint8[i].toString(16).padStart(2, "0").toUpperCase())
            }
            setHexView(hexParts.join(" "))

            // Identify Type
            const header = hexParts.slice(0, 4).join(" ")
            let type = "Unknown / Octet Stream"
            for (const [magic, name] of Object.entries(MAGIC_BYTES)) {
                // Check if hex sequence starts with magic bytes
                // We construct a string of the first N bytes
                const checkStr = hexParts.slice(0, magic.split(" ").length).join(" ")
                if (checkStr === magic) {
                    type = name
                    break
                }
            }
            setFileType(type)

            // Extract Strings (min length 4)
            // This is a naive implementation for small files
            // For large files, we should process in chunks. Here we limit to first 1MB for safety
            const textDecoder = new TextDecoder("ansi", { fatal: false }); // 'ansi' or 'utf-8', let's just try to interpret bytes as char codes roughly

            const contentStr = Array.from(uint8.slice(0, 1024 * 1024)).map(b => String.fromCharCode(b)).join("");
            const foundStrings = contentStr.match(/[ -~]{4,}/g) || []
            setStrings(foundStrings.slice(0, 1000)) // Limit to 1000 strings

            setLoading(false)
        }

        reader.readAsArrayBuffer(f)
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-10rem)]">
            <div className="space-y-6">
                <Card
                    {...getRootProps()}
                    className={`border-dashed cursor-pointer transition-colors ${isDragActive ? "bg-accent" : ""}`}
                >
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <input {...getInputProps()} />
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Drag & drop files here</p>
                        <p className="text-sm text-muted-foreground">or click to select file</p>
                    </CardContent>
                </Card>

                {file && (
                    <Card>
                        <CardHeader>
                            <CardTitle>File Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-mono">{file.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Size:</span>
                                <span className="font-mono">{file.size} bytes</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Detected Type:</span>
                                <span className="font-bold text-primary">{fileType}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="h-full">
                <Tabs defaultValue="hex" className="h-full flex flex-col">
                    <TabsList className="w-full">
                        <TabsTrigger value="hex" className="flex-1">Hex Header</TabsTrigger>
                        <TabsTrigger value="strings" className="flex-1">Extracted Strings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hex" className="flex-1 mt-4 overflow-hidden">
                        <Card className="h-full flex flex-col">
                            <CardContent className="flex-1 p-0">
                                <pre className="p-4 h-full overflow-auto font-mono text-sm bg-muted/30 whitespace-pre-wrap break-all">
                                    {hexView || "Upload a file to view hex"}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="strings" className="flex-1 mt-4 overflow-hidden">
                        <Card className="h-full flex flex-col">
                            <CardContent className="flex-1 p-0 overflow-auto">
                                {strings.length > 0 ? (
                                    <div className="divide-y">
                                        {strings.map((str, i) => (
                                            <div key={i} className="px-4 py-2 font-mono text-sm hover:bg-muted/50">
                                                {str}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-muted-foreground">
                                        {file ? "No strings found" : "Upload a file to extract strings"}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
