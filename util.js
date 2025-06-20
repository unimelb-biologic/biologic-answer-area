export function globalConsoleLog(category = "any", ...args) {
    const allowedCategories = [/*"geom", "undo", "any","net"*/"conn"];

    if (allowedCategories.includes(category)) {
        console.log(`[${category}]`, ...args); // Spread to preserve multiple arguments
    }
};