export async function formatJSON(val: any): Promise<string> {
    const res = JSON.parse(val);
    return JSON.stringify(res, null, 2);
}
