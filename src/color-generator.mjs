export class ColorGenerator {
    static getHexColor({ minR, maxR, minG, maxG, minB, maxB }) {
        if (minR === undefined) minR = 0;
        if (maxR === undefined) maxR = 255;
        if (minG === undefined) minG = 0;
        if (maxG === undefined) maxG = 255;
        if (minB === undefined) minB = 0;
        if (maxB === undefined) maxB = 255;

        const r = Math.floor(Math.random() * (maxR - minR + 1)) + minR;
        const g = Math.floor(Math.random() * (maxG - minG + 1)) + minG;
        const b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;

        const rHex = r.toString(16).padStart(2, '0');
        const gHex = g.toString(16).padStart(2, '0');
        const bHex = b.toString(16).padStart(2, '0');
        return `#${rHex}${gHex}${bHex}`;
    }

    static async getColorData(colorHex) {
        if (colorHex && typeof colorHex === 'string') {
            // TODO - add a check for proper hexColor format #RRGGBB using regular expression
            const URL = 'https://api.color.pizza/v1/';
            const queryData = { values: colorHex.replace('#', '') };
            const params = new URLSearchParams(queryData);

            try {
                const response = await fetch(`${URL}?${params.toString()}`);

                if (response && response.ok) {
                    const data = await response.json();

                    if (data.colors && data.colors.length > 0) {
                        const colorData = data.colors[0];

                        return {
                            colorHex,
                            colorName: colorData.name,
                            bestContrast: colorData.bestContrast
                        }
                    }
                }
            } catch (error) {
                console.error(`Error: ${error}`);
            }
        }

        return undefined;
    }
}
