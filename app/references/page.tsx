"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToolCard } from "@/components/tool-card"
import { ScrollArea } from "@/components/ui/scroll-area"

const toolData = {
    web: [
        { name: "Burp Suite", description: "The community edition is an essential tool for intercepting, analyzing, and modifying web traffic between a browser and a server.", category: "Proxy/Scanner", url: "https://portswigger.net/burp/communitydownload" },
        { name: "Sqlmap", description: "An automated tool for detecting and exploiting SQL injection vulnerabilities in databases.", category: "SQL Injection", url: "https://sqlmap.org/" },
        { name: "OWASP ZAP", description: "A powerful, free alternative to Burp Suite that also features an intercepting proxy and vulnerability scanner.", category: "Proxy/Scanner", url: "https://www.zaproxy.org/" },
        { name: "Nikto", description: "A web server scanner that checks for known vulnerabilities, misconfigurations, and outdated software versions.", category: "Scanner", url: "https://cirt.net/Nikto2" },
        { name: "Gobuster / Dirb", description: "Tools for brute-forcing directories and files on a web server to discover hidden content.", category: "Enumeration", url: "https://github.com/OJ/gobuster" },
    ],
    re: [
        { name: "Ghidra", description: "The NSA-developed reverse engineering (RE) framework and decompiler is now a staple for analyzing compiled code.", category: "Decompiler", url: "https://ghidra-sre.org/" },
        { name: "GDB", description: "The standard GNU debugger, often used with plugins like Pwndbg or GEF, for dynamic analysis of binaries.", category: "Debugger", url: "https://www.sourceware.org/gdb/" },
        { name: "pwntools", description: "A Python library that greatly simplifies writing exploits for binary challenges.", category: "Exploitation", url: "https://docs.pwntools.com/" },
        { name: "Apktool", description: "Used for reverse engineering Android APK files to view resources and Dalvik bytecode.", category: "Mobile", url: "https://ibotpeaches.github.io/Apktool/" },
    ],
    crypto: [
        { name: "John the Ripper", description: "A powerful offline password cracking tool that supports numerous hash and cipher types using dictionary and brute-force attacks.", category: "Cracker", url: "https://www.openwall.com/john/" },
        { name: "Hashcat", description: "A more advanced password recovery tool known for its speed, leveraging GPU acceleration for cracking hashes.", category: "Cracker", url: "https://hashcat.net/" },
        { name: "RsaCtfTool", description: "A specialized Python tool for performing various attacks to recover RSA private keys.", category: "RSA", url: "https://github.com/RsaCtfTool/RsaCtfTool" },
    ],
    forensics: [
        { name: "Wireshark", description: "The premier network protocol analyzer for capturing and inspecting network traffic (pcap files) in detail.", category: "Network Forensics", url: "https://www.wireshark.org/" },
        { name: "Autopsy", description: "A robust graphical digital forensics platform used to analyze disk images and recover deleted files and data.", category: "Disk Forensics", url: "https://www.autopsy.com/" },
        { name: "Binwalk", description: "Scans files for embedded data and extracts different file types or executable code hidden within firmware images or other files.", category: "Analysis", url: "https://github.com/ReFirmLabs/binwalk" },
        { name: "Foremost", description: "A command-line tool for file carving based on file headers and footers.", category: "Carving", url: "https://github.com/korczis/foremost" },
        { name: "Steghide", description: "A tool for hiding and extracting data in various file types, primarily images and audio files.", category: "Steganography", url: "https://steghide.sourceforge.net/" },
    ],
    net: [
        { name: "Nmap", description: "An indispensable network scanning tool to discover hosts, identify open ports, running services, and operating systems.", category: "Scanning", url: "https://nmap.org/" },
        { name: "Metasploit Framework", description: "A comprehensive exploitation framework used to find, exploit, and validate vulnerabilities.", category: "Exploitation", url: "https://www.metasploit.com/" },
        { name: "Aircrack-ng", description: "A suite of tools for auditing wireless networks, including packet capturing and password cracking of WEP and WPA keys.", category: "Wireless", url: "https://www.aircrack-ng.org/" },
    ]
}

export default function ReferencePage() {
    return (
        <div className="space-y-6 h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Tool Reference Library</h1>
                <p className="text-muted-foreground">Comprehensive list of essential external tools for CTF competitions.</p>
            </div>

            <Tabs defaultValue="web" className="h-[calc(100vh-12rem)] flex flex-col">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
                    <TabsTrigger value="web">Web Exp</TabsTrigger>
                    <TabsTrigger value="re">Pwn / RE</TabsTrigger>
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    <TabsTrigger value="forensics">Forensics</TabsTrigger>
                    <TabsTrigger value="net">Network</TabsTrigger>
                </TabsList>

                {Object.entries(toolData).map(([key, tools]) => (
                    <TabsContent key={key} value={key} className="flex-1 overflow-hidden mt-0">
                        <ScrollArea className="h-full pr-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                                {tools.map((tool, index) => (
                                    <ToolCard
                                        key={index}
                                        name={tool.name}
                                        description={tool.description}
                                        category={tool.category}
                                        url={tool.url}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
