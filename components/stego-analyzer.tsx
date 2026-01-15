"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Image as ImageIcon, MessageSquare } from "lucide-react"
import * as EXIF from "exif-js"
import { StegoTextTool } from "./stego-text-tool"

export function StegoAnalyzer() {
    const [file, setFile] = useState<File | null>(null)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [exifData, setExifData] = useState<any>({})
    const [bitPlane, setBitPlane] = useState<string>("original")

    const canvasRef = useRef<HTMLCanvasElement>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0]
        if (f) {
            setFile(f)
            const reader = new FileReader()
            reader.onload = (e) => {
                if (e.target?.result) {
                    const src = e.target.result as string
                    setImageSrc(src)
                    // Reset bit plane
                    setBitPlane("original")
                }
            }
            reader.readAsDataURL(f)

            // Extract Exif
            const readerExif = new FileReader()
            readerExif.onload = (e) => {
                if (e.target?.result) {
                    try {
                        const exif = EXIF.readFromBinaryFile(e.target.result as ArrayBuffer)
                        setExifData(exif || {})
                    } catch (err) {
                        setExifData({ error: "Could not read EXIF data" })
                    }
                }
            }
            readerExif.readAsArrayBuffer(f)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] }
    })

    useEffect(() => {
        if (!imageSrc || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = new Image()
        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)

            if (bitPlane !== "original") {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data
                const [channel, bit] = bitPlane.split("-") // e.g., "red-0"
                const bitIndex = parseInt(bit)

                for (let i = 0; i < data.length; i += 4) {
                    let val = 0
                    if (channel === "red") val = data[i]
                    else if (channel === "green") val = data[i + 1]
                    else if (channel === "blue") val = data[i + 2]
                    else if (channel === "alpha") val = data[i + 3]

                    // Extract bit
                    const extractedBit = (val >> bitIndex) & 1
                    const pixelVal = extractedBit === 1 ? 255 : 0

                    // Set all to black or white based on bit
                    data[i] = pixelVal
                    data[i + 1] = pixelVal
                    data[i + 2] = pixelVal
                    data[i + 3] = 255 // Alpha full opacity
                }
                ctx.putImageData(imageData, 0, 0)
            }
        }
        img.src = imageSrc
    }, [imageSrc, bitPlane])

    return (
        <div className="h-[calc(100vh-10rem)]">
            <Tabs defaultValue="visual" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="visual">Visual Textures & Exif</TabsTrigger>
                    <TabsTrigger value="text">LSB Text Steganography</TabsTrigger>
                </TabsList>

                <TabsContent value="visual" className="flex-1 mt-0">
                    <div className="grid gap-6 lg:grid-cols-2 h-full">
                        <div className="space-y-6 flex flex-col h-full">
                            <Card
                                {...getRootProps()}
                                className={`border-dashed cursor-pointer transition-colors flex-shrink-0 ${isDragActive ? "bg-accent" : ""}`}
                            >
                                <CardContent className="flex flex-col items-center justify-center py-8">
                                    <input {...getInputProps()} />
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="font-medium text-sm">Upload Image</p>
                                </CardContent>
                            </Card>

                            <Card className="flex-1 overflow-hidden flex flex-col">
                                <CardHeader className="py-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Viewer</CardTitle>
                                        <Select value={bitPlane} onValueChange={setBitPlane}>
                                            <SelectTrigger className="w-[180px] h-8 text-xs">
                                                <SelectValue placeholder="View Mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="original">Original</SelectItem>
                                                <SelectItem value="red-0">Red Bit 0 (LSB)</SelectItem>
                                                <SelectItem value="red-7">Red Bit 7 (MSB)</SelectItem>
                                                <SelectItem value="green-0">Green Bit 0 (LSB)</SelectItem>
                                                <SelectItem value="green-7">Green Bit 7 (MSB)</SelectItem>
                                                <SelectItem value="blue-0">Blue Bit 0 (LSB)</SelectItem>
                                                <SelectItem value="blue-7">Blue Bit 7 (MSB)</SelectItem>
                                                <SelectItem value="alpha-0">Alpha Bit 0</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-auto bg-muted/30 p-4 flex items-center justify-center">
                                    {imageSrc ? (
                                        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-lg" />
                                    ) : (
                                        <div className="text-muted-foreground flex flex-col items-center">
                                            <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                                            <span>No image loaded</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="h-full">
                            <Card className="h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle>Exif Metadata</CardTitle>
                                    <CardDescription>Hidden metadata in image headers</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-auto">
                                    {Object.keys(exifData).length > 0 ? (
                                        <div className="space-y-1">
                                            {Object.entries(exifData).map(([key, val]) => (
                                                <div key={key} className="flex justify-between text-sm py-1 border-b">
                                                    <span className="font-medium text-muted-foreground">{key}</span>
                                                    <span className="font-mono text-xs truncate max-w-[200px]">{String(val)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No Exif data found or image not loaded.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="text" className="flex-1 mt-0">
                    <StegoTextTool />
                </TabsContent>
            </Tabs>
        </div>
    )
}
