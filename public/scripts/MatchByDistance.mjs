import { distance } from 'fastest-levenshtein';

export default ({ threshold, definition1, definition2 }) => {
    let match = false;
    try {
        const json1 = JSON.parse(definition1.definition);
        const json2 = JSON.parse(definition2.definition);

        const text1 = json1.data.description;
        const text2 = json2.data.description;

        const measurement = distance(text1, text2);
        const maxLength = Math.max(text1.length, text2.length);
        const normalizedDistance = measurement / maxLength;
        const similarity = 1 - normalizedDistance;

        match = similarity >= threshold;
    } catch {
        // Ignore
    }

    return match ? { parentId: definition1.id, childId: definition2.id } : undefined;
};
