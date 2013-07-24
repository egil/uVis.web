/// <reference path="src/.typings/rx.js.binding.d.ts" />
/// <reference path="src/.typings/rx.js.d.ts" />
// Cell A
var A = new Rx.Subject();

// Cell B
var B = new Rx.Subject();

// Cell C, with formula = A + B
var A_Odd = A.where(function (a) {
    return a % 2 === 0;
});
var C = A_Odd.combineLatest(B, function (a, b) {
    return a + b;
});

// Somebody subscribers to C, e.g. to use its value in a graph
var subscription = C.subscribe(function (nextValue) {
}, function (error) {
}, function () {
});

// Set the value of A to 2
A.onNext(2);

// Set the value of B to 40
B.onNext(40);

// Set the value of A to 216
A.onNext(216);

// End the subscription to values from C
subscription.dispose();

// The rightProperty belongs to a lblMedicine component
var rightProperty = new Rx.BehaviorSubject(20);

// The left property belongs to a txtMedOrder component
var leftProperty = rightProperty.select(function (right) {
    return right + 10;
});
//@ sourceMappingURL=example.js.map
