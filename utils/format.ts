
/**
 * Parses a string representation of GP into a number.
 * Supports suffixes: k (thousand), m (million), b (billion).
 * Case insensitive.
 * Examples: "10m" -> 10000000, "1.5b" -> 1500000000, "100k" -> 100000.
 */
export const parseGP = (value: string): number => {
    if (!value) return 0;

    // Remove non-alphanumeric characters except dot
    const cleanValue = value.toLowerCase().replace(/[^0-9a-z.]/g, '');

    let multiplier = 1;
    if (cleanValue.endsWith('b')) {
        multiplier = 1000000000;
    } else if (cleanValue.endsWith('m')) {
        multiplier = 1000000;
    } else if (cleanValue.endsWith('k')) {
        multiplier = 1000;
    }

    const numericPart = parseFloat(cleanValue.replace(/[kmb]/g, ''));

    if (isNaN(numericPart)) return 0;

    return Math.floor(numericPart * multiplier);
};

/**
 * Formats a number into a readable GP string with suffixes.
 * Examples: 10000000 -> "10M", 1500 -> "1.5K" (optional)
 * Currently just uses standard locale string for display as requested elsewhere,
 * but can be expanded.
 */
export const formatGP = (value: number): string => {
    return value.toLocaleString();
};
