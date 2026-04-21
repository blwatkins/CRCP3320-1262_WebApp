'use strict';

(() => {
    /**
     * @param {*} input
     * @returns {boolean}
     */
    function isHexColorString(input) {
        const hexColorExpression = /(^#[0-9a-fA-F]{6}$)|(^#[0-9a-fA-F]{8}$)/;

        return (typeof input === 'string' && hexColorExpression.test(input));
    }

    function updatePage() {
        const colorDiv = document.getElementById('color-div');
        const colorHexInput = document.getElementById('colorHex');
        const submitButton = document.getElementById('submit-button');

        if (colorDiv && colorHexInput && submitButton) {
            const colorHexValue = colorHexInput.value;

            if (isHexColorString(colorHexValue)) {
                colorDiv.style.backgroundColor = colorHexValue;
                submitButton.disabled = false;
            } else {
                colorDiv.style.backgroundColor = '#FFFFFF';
                submitButton.disabled = true;
            }
        }
    }

    function addTile() {
        const colorHexInput = document.getElementById('colorHex');
        const formAlertDiv = document.getElementById('form-alert');
        const submitButton = document.getElementById('submit-button');

        if (colorHexInput && formAlertDiv && submitButton) {
            submitButton.disabled = true;
            const colorHexValue = colorHexInput.value;

            if (isHexColorString(colorHexValue)) {
                fetch('/api/tile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ colorHex: colorHexValue })
                }).then((result) => {
                    if (result && result.ok) {
                        formAlertDiv.className = 'alert alert-success';
                        formAlertDiv.textContent = 'Tile added successfully!';
                        formAlertDiv.hidden = false;
                    } else {
                        formAlertDiv.className = 'alert alert-danger';
                        formAlertDiv.textContent = 'Operation failed.';
                        formAlertDiv.hidden = false;
                    }
                }).then(() => {
                    return new Promise((resolve) => {
                        setTimeout(resolve, 5_000);
                    });
                }).then(() => {
                    formAlertDiv.hidden = true;
                    formAlertDiv.classList.remove('alert-success');
                    formAlertDiv.classList.remove('alert-danger');
                    formAlertDiv.textContent = '\u00A0';
                    colorHexInput.value = '';
                }).catch((error) => {
                    console.error(error);
                    formAlertDiv.className = 'alert alert-danger';
                    formAlertDiv.textContent = 'Operation failed.';
                    formAlertDiv.hidden = false;
                }).finally(() => {
                    submitButton.disabled = false;
                    updatePage();
                });
            }
        }
    }

    async function getRandomColor() {
        const colorHexInput = document.getElementById('colorHex');

        if (colorHexInput) {
            try {
                const response = await fetch('/api/random-color');
                let colorHex = '#000000';

                if (response && response.ok) {
                    const data = await response.json();
                    colorHex = data.colorHex;
                }

                colorHexInput.value = colorHex;
            } catch (error) {
                console.error(error);
                colorHexInput.value = '';
            }

            updatePage();
        }
    }

    const colorHexInput = document.getElementById('colorHex');
    const randomColorButton = document.getElementById('random-color');
    const submitButton = document.getElementById('submit-button');

    if (colorHexInput) {
        colorHexInput.addEventListener('input', updatePage);
    }

    if (randomColorButton) {
        randomColorButton.addEventListener('click', getRandomColor);
    }

    if (submitButton) {
        submitButton.addEventListener('click', addTile);
    }
})();
