import * as pngText from 'png-chunk-text';
import encode from 'png-chunks-encode';
import extractChunks from 'png-chunks-extract';

// Taken from this answer on StackOverflow: https://stackoverflow.com/a/30106551
// Decoding base64 ⇢ UTF-8
function b64DecodeUnicode(str: string) {
    return decodeURIComponent(
        Array.prototype.map
            .call(atob(str), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );
}

// Taken from this answer on StackOverflow: https://stackoverflow.com/a/30106551
// Encoding UTF-8 ⇢ base64
function b64EncodeUnicode(str: string) {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        })
    );
}

function isBase64PNG(image: string) {
    return image.startsWith('data:image/png;base64,');
}

function splitBase64(image: string) {
    return image.split('base64,')[1];
}

async function extractImageAsync(image: string) {
    if (!isBase64PNG(image)) {
        throw new Error('Invalid PNG image format.');
    }

    const imageString = splitBase64(image);
    const contentArray = await processLargeImage(imageString);
    const chunks = extractChunks(await streamToUint8Array(contentArray));

    const filteredChunks = chunks.filter((chunk) => chunk.name !== 'tEXt');

    const encodedImage = encode(filteredChunks);

    const base64Image = Buffer.from(encodedImage).toString('base64');

    return `data:image/png;base64,${base64Image}`;
}

function extractImage(image: string) {
    if (!isBase64PNG(image)) {
        throw new Error('Invalid PNG image format.');
    }

    return 'data:image/png;base64,' + Buffer.from(encode(extractChunks(Buffer.from(splitBase64(image), 'base64')).filter((chunk) => chunk.name !== 'tEXt'))).toString('base64');
}

function extractDefinition(image: string) {
    if (!isBase64PNG(image)) {
        throw new Error('Invalid PNG image format.');
    }

    const imageString = splitBase64(image);

    const contentArray = Buffer.from(imageString, 'base64');
    const chunks = extractChunks(contentArray);

    const textChunks = chunks
        .filter(function (chunk) {
            return chunk.name === 'tEXt';
        })
        .map(function (chunk) {
            return pngText.decode(chunk.data);
        });

    if (textChunks.length === 0) {
        console.error('PNG metadata does not contain any text chunks.');
    }

    const index = textChunks.findIndex((chunk) => chunk.keyword.toLowerCase() == 'chara');

    if (index === -1) {
        console.error('PNG metadata does not contain any character data.');
    }

    return b64DecodeUnicode(textChunks[index].text);
}

function updateDefinition(image: string, definition: string) {
    if (!isBase64PNG(image)) {
        throw new Error('Invalid PNG image format.');
    }

    const imageString = splitBase64(image);

    const contentArray = Buffer.from(imageString, 'base64');
    const chunks = extractChunks(contentArray);
    const modifiedText = b64EncodeUnicode(definition);

    if (chunks.length > 1) {
        const tEXtChunks = chunks.filter((chunk) => chunk.name === 'tEXt');

        for (const tEXtChunk of tEXtChunks) {
            chunks.splice(chunks.indexOf(tEXtChunk), 1);
        }
    }

    chunks.splice(-1, 0, pngText.encode('chara', modifiedText));
    return 'data:image/png;base64,' + Buffer.from(encode(chunks)).toString('base64');
}

function addDefinition(image: string, definition: string): string {
    if (!isBase64PNG(image)) {
        throw new Error('Invalid PNG image format.');
    }

    const imageString = splitBase64(image);
    const contentArray = Buffer.from(imageString, 'base64');
    const chunks = extractChunks(contentArray);
    let json = '';
    if (definition.includes('\\"spec\\"')) {
        json = JSON.parse(definition);
    } else {
        json = definition;
    }
    const modifiedText = b64EncodeUnicode(json);

    const newTextChunk = pngText.encode('chara', modifiedText);

    chunks.splice(-1, 0, newTextChunk);

    return 'data:image/png;base64,' + Buffer.from(encode(chunks)).toString('base64');
}

function estimateBase64ImageSize(base64String: string) {
    const base64WithoutPrefix = base64String.replace(/^data:image\/\w+;base64,/, '');

    const length = base64WithoutPrefix.length;
    const paddingCount = base64WithoutPrefix.endsWith('==') ? 2 : base64WithoutPrefix.endsWith('=') ? 1 : 0;
    const sizeInBytes = length * 0.75 - paddingCount;

    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;

    return {
        bytes: Math.round(sizeInBytes),
        kilobytes: Math.round(sizeInKB * 100) / 100,
        megabytes: Math.round(sizeInMB * 100) / 100,
    };
}

export {
    addDefinition,
    b64DecodeUnicode,
    b64EncodeUnicode,
    extractDefinition,
    extractImage,
    extractImageAsync,
    isBase64PNG,
    splitBase64,
    updateDefinition,
    estimateBase64ImageSize,
};
