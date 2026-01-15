import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
    try {
        const { command } = await req.json();

        if (!command) {
            return NextResponse.json({ output: "Error: No command provided." }, { status: 400 });
        }

        // execute command
        // Note: This runs with the permissions of the process running the Next.js server.
        // Interactive commands (like top, nano) or those requiring input will fail or hang.
        const { stdout, stderr } = await execAsync(command, { timeout: 30000 });

        return NextResponse.json({ output: stdout || stderr });

    } catch (error: any) {
        // exec throws an error if the command fails (non-zero exit code)
        // We still want to return the stderr/stdout if available
        return NextResponse.json({
            output: error.stderr || error.stdout || `Execution Error: ${error.message}`
        });
    }
}
