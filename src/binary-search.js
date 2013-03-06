function binarySearch(arr, ele) {
    var beginning = 0, end = arr.length,
        target;
    while (true) {
        target = ((beginning + end) >> 1);
        if ((target === end || target === beginning) && arr[target] !== ele) {
            return -1;
        }
        if (arr[target] > ele) {
            end = target;
        } else if (arr[target] < ele) {
            beginning = target;
        } else {
            return target;
        }
    }
}