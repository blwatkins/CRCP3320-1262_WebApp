export class StringValidator {
    /**
     * @type {RegExp}
     */
    static hexColorExpression = /^(#[0-9a-f-A-F]{6}|#[0-9a-f-A-F]{8})$/;

    /**
     * @param input
     * @returns {boolean}
     */
    static isHexColor(input) {
        if (typeof input !== 'string') {
            return false;
        }

        return StringValidator.hexColorExpression.test(input);
    }
}
