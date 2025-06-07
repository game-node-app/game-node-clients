/**
 * Retrieves a single random item from an array.
 * For multiple items, use 'getRandomItems'.
 * @param items
 * @see getRandomItems
 */
export function getRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

/**
 * Retrieves x (max) unique random items from an array.
 * For a single item, use 'getRandomItem'.
 * @param items
 * @param max
 * @see getRandomItem
 */
export function getRandomItems<T>(items: T[], max: number) {
    const insertedItems = new Set<number>();

    const randomItems: T[] = [];
    for (let i = 0; i < items.length && i < max; i++) {
        let randomIndex = Math.floor(Math.random() * items.length);
        while (
            insertedItems.values.length < items.length &&
            insertedItems.has(randomIndex)
        ) {
            randomIndex = Math.floor(Math.random() * items.length);
        }

        randomItems.push(items[randomIndex]);
        insertedItems.add(randomIndex);
    }

    return randomItems;
}
