export module uvis {
    /**
      * Will search an array using the binary search algorithm.
      * Note: assumes the array is already sorted.
      *
      * @param sortedArray The sorted array to search for
      * @param element The element to search for
      * @return -1 if element was not found, otherwise the index of the element.
      */
    export function binarySearch(sortedArray: any[], element: any): number {
        var beginning = 0, end = sortedArray.length,
            target;
        while (true) {
            target = ((beginning + end) >> 1);
            if ((target === end || target === beginning) && sortedArray[target] !== element) {
                return -1;
            }
            if (sortedArray[target] > element) {
                end = target;
            } else if (sortedArray[target] < element) {
                beginning = target;
            } else {
                return target;
            }
        }
    }

    export function initArray(length: number, value?: any, factory?: () => any): any[] {
        var arr = new Array(length);
        for (var i = 0, len = arr.length; i < len; i += 1) {
            arr[i] = value === undefined ? factory() : value;
        }
        return arr;
    }
}