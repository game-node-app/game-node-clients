export function jsonDeepEquals(object1: any, object2: any) {
    return JSON.stringify(object1) === JSON.stringify(object2);
}
