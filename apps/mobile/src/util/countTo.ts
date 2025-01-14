/**
 * Calculates how many items would be necessary to reach a given value
 * e.g. how many items until three items are reached.
 * @param from
 * @param to
 */
export function countTo(from: number, to: number) {
    let remainingItems = 0;
    for (let i = from; i < to; i++) {
        remainingItems++;
    }

    return remainingItems;
}
