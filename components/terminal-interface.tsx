"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Terminal, Send, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TerminalLine {
    type: "input" | "output" | "error"
    content: string
}

export function TerminalInterface() {
    const [history, setHistory] = useState<TerminalLine[]>([
        { type: "output", content: "Kali Linux Terminal Bridge v1.0 [Online]" },
        { type: "output", content: "Connected to local system. Type 'help' context." },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [promptOpen, setPromptOpen] = useState(false)
    const [currentTool, setCurrentTool] = useState<{ cmd: string, placeholder: string } | null>(null)
    const [toolArgs, setToolArgs] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    // Configuration for Quick Actions
    const actionCategories = {
        "Reconnaissance": [
            { name: "Nmap (Simple)", cmd: "nmap -F", args: true, placeholder: "Target IP/Domain (e.g., 127.0.0.1)" },
            { name: "Ping", cmd: "ping -c 4", args: true, placeholder: "Target Host (e.g., google.com)" },
            { name: "Whois", cmd: "whois", args: true, placeholder: "Domain Name (e.g., example.com)" },
            { name: "WhatWeb", cmd: "whatweb", args: true, placeholder: "URL (e.g., http://target.com)" },
            { name: "Dig (DNS)", cmd: "dig", args: true, placeholder: "Domain (e.g., google.com)" },
        ],
        "System Info": [
            { name: "Whoami", cmd: "whoami", args: false },
            { name: "User ID", cmd: "id", args: false },
            { name: "Uptime", cmd: "uptime -p", args: false },
            { name: "OS Release", cmd: "cat /etc/os-release", args: false },
            { name: "Disk Usage", cmd: "df -h", args: false },
        ],
        "Network": [
            { name: "IP Address", cmd: "ip a", args: false },
            { name: "Open Ports (Local)", cmd: "netstat -tulpn", args: false },
            { name: "Route Table", cmd: "ip route", args: false },
            { name: "ARP Table", cmd: "arp -a", args: false },
        ],
        "Exploitation / Misc": [
            { name: "History", cmd: "history | tail -n 10", args: false },
            { name: "Active Processes", cmd: "ps aux | head -n 10", args: false },
            { name: "Python Version", cmd: "python3 --version", args: false },
            { name: "Check Sudoers", cmd: "sudo -l", args: false },
        ]
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [history])

    const executeCommand = async (cmd: string) => {
        if (!cmd.trim()) return

        setHistory(prev => [...prev, { type: "input", content: cmd }])
        setInput("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/system/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: cmd }),
            })

            const data = await res.json()
            setHistory(prev => [...prev, { type: "output", content: data.output || "[No Output]" }])
        } catch (err) {
            setHistory(prev => [...prev, { type: "error", content: "Failed to connect to backend API." }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isLoading) {
            executeCommand(input)
        }
    }

    const handleToolClick = (tool: any) => {
        if (tool.args) {
            setCurrentTool({ cmd: tool.cmd, placeholder: tool.placeholder || "Enter arguments..." })
            setToolArgs("")
            setPromptOpen(true)
        } else {
            executeCommand(tool.cmd)
        }
    }

    const submitToolArgs = () => {
        if (currentTool && toolArgs.trim()) {
            executeCommand(`${currentTool.cmd} ${toolArgs}`)
            setPromptOpen(false)
            setCurrentTool(null)
        }
    }

    return (
        <div className="grid gap-6">
            <Card className="bg-black text-green-500 font-mono p-0 overflow-hidden border-zinc-800 shadow-xl min-h-[500px] flex flex-col relative">
                {/* Custom Modal for Inputs */}
                {promptOpen && currentTool && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg w-full max-w-md shadow-2xl">
                            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-green-500" />
                                {currentTool.cmd}
                            </h3>
                            <Input
                                autoFocus
                                value={toolArgs}
                                onChange={(e) => setToolArgs(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && submitToolArgs()}
                                placeholder={currentTool.placeholder}
                                className="bg-black border-zinc-700 text-green-500 font-mono mb-4"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setPromptOpen(false)}>Cancel</Button>
                                <Button onClick={submitToolArgs}>Execute</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Terminal Header */}
                <div className="bg-zinc-900 p-2 flex items-center justify-between border-b border-zinc-800 px-4">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        <span className="text-sm font-bold">kali@ctf-omnitool:~</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                </div>

                {/* Output Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 p-4 overflow-y-auto max-h-[60vh] space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                >
                    {history.map((line, i) => (
                        <div key={i} className={`whitespace-pre-wrap break-all ${line.type === "input" ? "text-blue-400 font-bold mt-4" : line.type === "error" ? "text-red-500" : "text-green-500"}`}>
                            {line.type === "input" ? `┌──(kali㉿omnitool)-[~]\n└─$ ${line.content}` : line.content}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="animate-pulse text-green-500/50">Processing command...</div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-2 bg-zinc-900 border-t border-zinc-800">
                    <div className="flex gap-2">
                        <span className="text-blue-400 font-bold py-2 pl-2 hidden md:block">$</span>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            placeholder="Type a command (e.g., nmap 127.0.0.1)..."
                            className="bg-transparent border-none text-green-500 focus-visible:ring-0 placeholder:text-zinc-600 font-mono text-base"
                            autoFocus
                        />
                        <Button
                            className="bg-zinc-800 hover:bg-zinc-700 text-green-500 rounded-md"
                            size="icon"
                            onClick={() => executeCommand(input)}
                            disabled={isLoading}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Quick Actions Sections */}
            <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(actionCategories).map(([category, tools], idx) => (
                    <Card key={idx} className="p-4 border-l-4 border-l-primary/50">
                        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                            {tools.map((tool, tIdx) => (
                                <Button
                                    key={tIdx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToolClick(tool)}
                                    className="font-mono text-xs"
                                >
                                    {tool.name} {tool.args && "..."}
                                </Button>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
