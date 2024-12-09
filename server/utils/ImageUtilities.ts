import { Readable } from 'node:stream';

async function streamToBuffer(readable: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of readable) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
}

async function streamToUint8Array(readable: Readable): Promise<Uint8Array> {
    const chunks: Uint8Array[] = [];

    for await (const chunk of readable) {
        chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
    }

    // Compute total length
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

    // Concatenate all chunks
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return result;
}

async function processLargeImage(base64Data: string) {
    const chunkSize = 1024 * 1024; // Process 1MB at a time
    let offset = 0;

    return new Readable({
        read(size) {
            if (offset >= base64Data.length) {
                this.push(null);
                return;
            }

            const chunk = base64Data.slice(offset, offset + chunkSize);
            this.push(Buffer.from(chunk, 'base64'));
            offset += chunkSize;
        },
    });
}

export { processLargeImage, streamToBuffer, streamToUint8Array };
