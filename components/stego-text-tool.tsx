"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, Download, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function StegoTextTool() {
    const [file, setFile] = useState<File | null>(null)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [message, setMessage] = useState("")
    const [decodedMessage, setDecodedMessage] = useState("")
    const [encodedImage, setEncodedImage] = useState<string | null>(null)
    const [status, setStatus] = useState("")
    const [capacity, setCapacity] = useState(0)
    const [usedCapacity, setUsedCapacity] = useState(0)

    // Use a canvas to manipulate pixel data
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
                    setEncodedImage(null)
                    setDecodedMessage("")
                    setStatus("Image loaded. Ready.")

                    // Calculate Capacity
                    const img = new Image()
                    img.onload = () => {
                        const totalPixels = img.width * img.height
                        // 3 channels per pixel (RGB)
                        const totalBits = totalPixels * 3
                        // 1 byte = 8 bits
                        const totalBytes = Math.floor(totalBits / 8)
                        setCapacity(totalBytes)
                    }
                    img.src = src
                }
            }
            reader.readAsDataURL(f)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }
    })

    useEffect(() => {
        setUsedCapacity(new TextEncoder().encode(message).length + 1) // +1 for terminator
    }, [message])

    // Encode Function
    const encodeMessage = () => {
        if (!imageSrc || !message) {
            setStatus("Error: Missing image or message.")
            return
        }

        if (usedCapacity > capacity) {
            setStatus("Error: Message too long for this image.")
            return
        }

        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Message to bits
            const encoder = new TextEncoder()
            const msgBytes = encoder.encode(message)
            let msgBits = "";
            for (let i = 0; i < msgBytes.length; i++) {
                msgBits += msgBytes[i].toString(2).padStart(8, "0");
            }
            msgBits += "00000000"; // Null terminator (0x00)

            let bitIndex = 0;
            // Iterate every pixel
            for (let i = 0; i < data.length; i += 4) {
                if (bitIndex >= msgBits.length) break;

                // Modify RGB channels (0,1,2). Ignore Alpha (3)
                for (let j = 0; j < 3; j++) {
                    if (bitIndex >= msgBits.length) break;

                    const bit = parseInt(msgBits[bitIndex]);
                    // LSB Logic: (val & ~1) | bit
                    data[i + j] = (data[i + j] & 0xFE) | bit;
                    bitIndex++;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            const encodedUrl = canvas.toDataURL("image/png");
            setEncodedImage(encodedUrl);
            setStatus("Encoding successful! Download the result.")
        }
        img.src = imageSrc;
    }

    // Decode Function
    const decodeMessage = () => {
        if (!imageSrc) {
            setStatus("Error: Please upload an image.")
            return
        }

        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let bits = "";
            const maxBits = 100000 * 8; // Safety limit (~100KB)

            for (let i = 0; i < data.length; i += 4) {
                for (let j = 0; j < 3; j++) {
                    if (bits.length >= maxBits) break;
                    const bit = data[i + j] & 1;
                    bits += bit;
                }
                if (bits.length >= maxBits) break;
            }

            // Convert bits to bytes
            const bytes = []
            let rawString = ""
            let foundTerminator = false

            for (let i = 0; i < bits.length; i += 8) {
                const byteStr = bits.substr(i, 8)
                if (byteStr.length < 8) break;
                const byteVal = parseInt(byteStr, 2)

                if (byteVal === 0) {
                    foundTerminator = true
                    break;
                }
                bytes.push(byteVal)
            }

            if (bytes.length > 0) {
                const decoder = new TextDecoder()
                const msg = decoder.decode(new Uint8Array(bytes))
                setDecodedMessage(msg)
                setStatus("Decoding complete.")
            } else {
                setDecodedMessage("")
                setStatus("No message found or empty message.")
            }
        }
        img.src = imageSrc
    }

    return (
        <div className="grid gap-6">
            {/* Top Section: Upload */}
            <Card
                {...getRootProps()}
                className={`border-dashed cursor-pointer transition-colors ${isDragActive ? "bg-accent" : ""}`}
            >
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="font-medium text-sm">Upload Image (Source for Encode or Encoded for Decode)</p>
                    {imageSrc && <p className="text-xs text-green-500 mt-1">Image Loaded!</p>}
                </CardContent>
            </Card>

            <Tabs defaultValue="encode" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="encode">Encode Message</TabsTrigger>
                    <TabsTrigger value="decode">Decode Message</TabsTrigger>
                </TabsList>

                <TabsContent value="encode" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Encode</CardTitle>
                            <CardDescription>
                                Embed secret text into the LSB of the RGB channels.
                                {imageSrc && (
                                    <span className="block mt-1 font-mono text-xs text-muted-foreground">
                                        Capacity: {usedCapacity} / {capacity} bytes ({Math.round((usedCapacity / capacity) * 100)}%)
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Enter your secret message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="min-h-[150px] font-mono"
                            />
                            {usedCapacity > capacity && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Capacity Exceeded</AlertTitle>
                                    <AlertDescription>Message is too long for this image.</AlertDescription>
                                </Alert>
                            )}
                            <Button onClick={encodeMessage} disabled={!imageSrc || !message || usedCapacity > capacity} className="w-full">
                                Encode & Generate
                            </Button>
                        </CardContent>
                    </Card>
                    {encodedImage && (
                        <Card className="bg-muted/30">
                            <CardHeader><CardTitle>Result</CardTitle></CardHeader>
                            <CardContent className="flex flex-col items-center space-y-4">
                                <img src={encodedImage} alt="Encoded" className="max-h-[300px] object-contain shadow-lg rounded-md" />
                                <Button asChild className="w-full">
                                    <a href={encodedImage} download="stego_image.png">
                                        <Download className="mr-2 h-4 w-4" /> Download Encoded Image
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="decode" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Decode</CardTitle>
                            <CardDescription>Extract hidden text from the uploaded image.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={decodeMessage} disabled={!imageSrc} className="w-full" variant="secondary">
                                <RefreshCw className="mr-2 h-4 w-4" /> Decode Message
                            </Button>
                        </CardContent>
                    </Card>
                    {decodedMessage && (
                        <Card className="bg-muted/30">
                            <CardHeader><CardTitle>Decoded Message</CardTitle></CardHeader>
                            <CardContent>
                                <div className="p-4 bg-background rounded-md border font-mono text-sm break-all whitespace-pre-wrap">
                                    {decodedMessage}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            <div className="text-center text-xs text-muted-foreground">
                {status}
            </div>
        </div>
    )
}
