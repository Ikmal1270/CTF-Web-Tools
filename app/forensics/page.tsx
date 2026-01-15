"use client"

import { FileAnalyzer } from "@/components/file-analyzer"
import { SmartScanner } from "@/components/smart-scanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ForensicsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg border border-indigo-500/10">
                <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Smart Digital Forensics
                </h1>
                <p className="text-lg text-muted-foreground">
                    Advanced automated analysis and manual inspection tools for digital artifacts.
                    Select a mode below to begin your investigation.
                </p>
            </div>

            <Tabs defaultValue="smart" className="h-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                    <TabsTrigger value="smart" className="text-base">🧠 Smart Auto-Scan</TabsTrigger>
                    <TabsTrigger value="manual" className="text-base">🛠️ Manual Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="smart" className="border-none p-0 outline-none">
                    <SmartScanner />
                </TabsContent>

                <TabsContent value="manual" className="border-none p-0 outline-none">
                    <FileAnalyzer />
                </TabsContent>
            </Tabs>
        </div>
    )
}
