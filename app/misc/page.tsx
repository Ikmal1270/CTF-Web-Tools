"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XORCalculator } from "@/components/xor-calculator"
import { AsciiTable } from "@/components/ascii-table"

export default function MiscPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-8rem)]">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Miscellaneous</h2>
                <p className="text-muted-foreground">
                    Calculators, tables, and other useful utilities.
                </p>
            </div>

            <Tabs defaultValue="xor" className="h-full flex flex-col">
                <TabsList className="w-[300px]">
                    <TabsTrigger value="xor">XOR Tool</TabsTrigger>
                    <TabsTrigger value="ascii">ASCII Table</TabsTrigger>
                </TabsList>
                <TabsContent value="xor" className="flex-1 mt-6">
                    <XORCalculator />
                </TabsContent>
                <TabsContent value="ascii" className="flex-1 mt-6 overflow-hidden">
                    <AsciiTable />
                </TabsContent>
            </Tabs>
        </div>
    )
}
