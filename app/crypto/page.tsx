import { CryptoPlayground } from "@/components/crypto-playground"

export default function CryptoPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Cryptography</h2>
                <p className="text-muted-foreground">
                    Tools for encoding, decoding, and breaking common ciphers.
                </p>
            </div>
            <CryptoPlayground />
        </div>
    )
}
