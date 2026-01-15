"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequestBuilder } from "@/components/request-builder"
import { PayloadGenerator } from "@/components/payload-generator"

export default function WebPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-8rem)]">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Web Exploitation</h2>
                <p className="text-muted-foreground">
                    Tools for request manipulation and payload generation.
                </p>
            </div>

            <Tabs defaultValue="request" className="h-full flex flex-col">
                <TabsList className="w-[400px]">
                    <TabsTrigger value="request">Request Builder</TabsTrigger>
                    <TabsTrigger value="payloads">Payload Generator</TabsTrigger>
                </TabsList>
                <TabsContent value="request" className="flex-1 mt-6">
                    <RequestBuilder />
                </TabsContent>
                <TabsContent value="payloads" className="flex-1 mt-6">
                    <PayloadGenerator />
                </TabsContent>
            </Tabs>
        </div>
    )
}
