export class StringUtility {
    /**
     * @type {RegExp}
     */
    static hexColorExpression = /(^#[0-9a-fA-F]{6}$)|(^#[0-9a-fA-F]{8}$)/;

    /**
     * @param input
     * @returns {boolean}
     */
    static isHexColor(input) {
        if (typeof input !== 'string') {
            return false;
        }

        return StringUtility.hexColorExpression.test(input);
    }
}
