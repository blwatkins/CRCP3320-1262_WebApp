export function parseRGBComponent(input) {
    if (typeof input === 'number' && !isNaN(input) && input >= 0 && input <= 255) {
        return Math.floor(input);
    }

    if (input === undefined) {
        return undefined;
    }

    const parsed = parseInt(input, 10);

    if (!isNaN(parsed) && parsed >= 0 && parsed <= 255) {
        return Math.floor(parsed);
    }

    return null;
}
