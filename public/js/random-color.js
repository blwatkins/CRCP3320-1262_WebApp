'use strict';

(() => {
    async function updateRandomColor() {
        let colorHex = '#000000';
        let colorName = 'Black';

        try {
            const response = await fetch('/api/random-color');

            if (response && response.ok) {
                const data = await response.json();
                ({ colorHex, colorName } = data);
            }
        } catch (error) {
            console.error(error);
        }

        const COLOR_ID = 'color-div';
        const COLOR_NAME_ID = 'color-name-span';
        const COLOR_HEX_ID = 'color-hex-span';
        const colorElement = document.getElementById(COLOR_ID);
        const colorNameElement = document.getElementById(COLOR_NAME_ID);
        const colorHexElement = document.getElementById(COLOR_HEX_ID);

        if (colorElement) {
            colorElement.style.backgroundColor = colorHex;
        }

        if (colorNameElement) {
            colorNameElement.textContent = colorName;
        }

        if (colorHexElement) {
            colorHexElement.textContent = colorHex;
        }
    }

    (async () => {
        await updateRandomColor();
    })();

    const randomColorButton = document.getElementById('random-color');

    if (randomColorButton) {
        randomColorButton.addEventListener('click', updateRandomColor);
    }
})();
