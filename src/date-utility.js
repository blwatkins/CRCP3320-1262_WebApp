export class DateUtility {
    static dateExpression = /^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

    static isValidDate(input) {
        if (typeof input !== 'string') {
            return false;
        }

        const dateMatch = input.match(DateUtility.dateExpression);

        if (dateMatch) {
            const year = Number.parseInt(dateMatch[1], 10);
            const month = Number.parseInt(dateMatch[2], 10);
            const day = Number.parseInt(dateMatch[3], 10);
            const parsedDate = new Date(year, month - 1, day);
            return parsedDate.getFullYear() === year
                && parsedDate.getMonth() === month - 1
                && parsedDate.getDate() === day;
        }

        return false;
    }

    static getCurrentDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    static getCurrentTimestamp() {
        const date = new Date();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const milliseconds = date.getMilliseconds();
        return `${DateUtility.getCurrentDate()} ${hour}:${minute}:${second}.${milliseconds}`;
    }
}