"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import bigInt from "big-integer"

export function RSACalculator() {
    // Key Generation State
    const [p, setP] = useState("")
    const [q, setQ] = useState("")
    const [e, setE] = useState("65537")
    const [n, setN] = useState("")
    const [phi, setPhi] = useState("")
    const [d, setD] = useState("")

    // Decryption State
    const [cipherC, setCipherC] = useState("")
    const [decryptD, setDecryptD] = useState("")
    const [decryptN, setDecryptN] = useState("")
    const [messageM, setMessageM] = useState("")
    const [messageStr, setMessageStr] = useState("")

    const calculateKeys = () => {
        try {
            if (!p || !q || !e) return
            const bigP = bigInt(p)
            const bigQ = bigInt(q)
            const bigE = bigInt(e)

            const bigN = bigP.multiply(bigQ)
            const bigPhi = bigP.minus(1).multiply(bigQ.minus(1))

            let bigD
            try {
                bigD = bigE.modInv(bigPhi)
            } catch (err) {
                bigD = bigInt(0) // Error: e and phi are not coprime
            }

            setN(bigN.toString())
            setPhi(bigPhi.toString())
            setD(bigD.toString() === "0" ? "Error: e is not coprime to phi(n)" : bigD.toString())
        } catch (err) {
            // Handle parse errors
        }
    }

    const decryptMessage = () => {
        try {
            if (!cipherC || !decryptD || !decryptN) return
            const bigC = bigInt(cipherC)
            const bigD = bigInt(decryptD)
            const bigN = bigInt(decryptN)

            const m = bigC.modPow(bigD, bigN)
            setMessageM(m.toString())

            // Try to convert to string (hex -> ascii)
            let hex = m.toString(16)
            if (hex.length % 2 !== 0) hex = "0" + hex
            let str = ""
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
            }
            setMessageStr(str)
        } catch (err) {
            setMessageM("Error")
            setMessageStr("Error")
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Key Calculation</CardTitle>
                    <CardDescription>Calculate N, Phi, and D from P, Q, E</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <Label>P (prime)</Label>
                            <Input value={p} onChange={(e) => setP(e.target.value)} placeholder="61" />
                        </div>
                        <div className="space-y-1">
                            <Label>Q (prime)</Label>
                            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="53" />
                        </div>
                        <div className="space-y-1">
                            <Label>e (exponent)</Label>
                            <Input value={e} onChange={(e) => setE(e.target.value)} placeholder="65537" />
                        </div>
                    </div>
                    <Button onClick={calculateKeys} className="w-full">Calculate Keys</Button>

                    <div className="space-y-2 mt-4 pt-4 border-t">
                        <div className="space-y-1">
                            <Label>N (Modulus)</Label>
                            <Input readOnly value={n} className="font-mono bg-muted" />
                        </div>
                        <div className="space-y-1">
                            <Label>Phi (Totient)</Label>
                            <Input readOnly value={phi} className="font-mono bg-muted" />
                        </div>
                        <div className="space-y-1">
                            <Label>D (Private Key)</Label>
                            <Textarea readOnly value={d} className="font-mono bg-muted min-h-[80px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Decryptor</CardTitle>
                    <CardDescription>Decrypt message C using D and N (m = c^d mod n)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label>Ciphertext (c)</Label>
                        <Input value={cipherC} onChange={(e) => setCipherC(e.target.value)} placeholder="Integer value" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label>Private Key (d)</Label>
                            <Input value={decryptD} onChange={(e) => setDecryptD(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Modulus (n)</Label>
                            <Input value={decryptN} onChange={(e) => setDecryptN(e.target.value)} />
                        </div>
                    </div>
                    <Button onClick={decryptMessage} className="w-full" variant="secondary">Decrypt Message</Button>

                    <div className="space-y-2 mt-4 pt-4 border-t">
                        <div className="space-y-1">
                            <Label>Message (m as Integer)</Label>
                            <Input readOnly value={messageM} className="font-mono bg-muted" />
                        </div>
                        <div className="space-y-1">
                            <Label>Message (m as String)</Label>
                            <Textarea readOnly value={messageStr} className="font-mono bg-muted min-h-[80px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
