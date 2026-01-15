"use client"

import { StegoAnalyzer } from "@/components/stego-analyzer"

export default function StegoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Steganography</h2>
                <p className="text-muted-foreground">
                    Analyze images for hidden messages (LSB, Exif).
                </p>
            </div>
            <StegoAnalyzer />
        </div>
    )
}
