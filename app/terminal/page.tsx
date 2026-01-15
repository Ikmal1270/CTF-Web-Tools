"use client"

import { TerminalInterface } from "@/components/terminal-interface"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, AlertTriangle } from "lucide-react"

export default function TerminalPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2 font-mono flex items-center gap-3">
                    <Terminal className="h-8 w-8 text-green-500" />
                    Kali Terminal Bridge
                </h1>
                <p className="text-muted-foreground">
                    Directly execute commands on the underlying Kali Linux system.
                </p>
            </div>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Warning</AlertTitle>
                <AlertDescription>
                    This console executes commands with the privileges of the hosting user.
                    Be careful with destructive commands. There is no confirmation prompt.
                </AlertDescription>
            </Alert>

            <div className="flex-1">
                <TerminalInterface />
            </div>
        </div>
    )
}
