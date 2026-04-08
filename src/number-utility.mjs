export class NumberUtility {
    /**
     * @param input {*}
     * @returns {boolean}
     */
    static isNumber(input) {
        return typeof input === 'number'
            && Number.isFinite(input);
    }

    /**
     * @param input {*}
     * @returns {undefined|number}
     */
    static parseNumber(input) {
        if (NumberUtility.isNumber(input)) {
            return input;
        }

        if (typeof input === 'string') {
            const parsed = Number.parseFloat(input);

            if (NumberUtility.isNumber(parsed)) {
                return parsed;
            }
        }

        return undefined;
    }

    /**
     * @param input {*}
     * @returns {undefined|number}
     */
    static parseInteger(input) {
        if (NumberUtility.isNumber(input) && Number.isInteger(input)) {
            return input;
        }

        const parsed = NumberUtility.parseNumber(input);

        if (NumberUtility.isNumber(parsed)) {
            return Math.floor(parsed);
        }

        return undefined;
    }

    /**
     * @param input {number}
     * @param value1 {number}
     * @param value2 {number}
     * @param inclusive {boolean}
     * @returns {boolean}
     * @throws {Error} If typechecks fail for any of the function arguments.
     */
    static isInRange(input, value1, value2, inclusive = true) {
        if (!NumberUtility.isNumber(input) || !NumberUtility.isNumber(value1) || !NumberUtility.isNumber(value2) || typeof inclusive !== 'boolean') {
            throw new Error('Invalid argument for function isInRange(number, number, number[, boolean]).');
        }

        const min = Math.min(value1, value2);
        const max = Math.max(value1, value2);

        if (inclusive) {
            return input >= min && input <= max;
        }

        return input > min && input < max;
    }
}
