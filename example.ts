/// <reference path="src/.typings/rx.js.binding.d.ts" />
/// <reference path="src/.typings/rx.js.d.ts" />

// Cell A
var A = new Rx.Subject();

// Cell B
var B = new Rx.Subject();

// Cell C, with formula = A + B
var A_Odd = A.where(a => a % 2 === 0);
var C = A_Odd.combineLatest(B, (a, b) => a + b);


// Somebody subscribers to C, e.g. to use its value in a graph
var subscription = C.subscribe(
    nextValue => {
        // This is an anonymous "onNext function.
        // Do something with nextValue from C
    }, error => {
        // This is an anonymous onError function.
        // Do something about the error.
    }, () => {
        // This is an anonymous onCompleted function.
        // React to the completed event from the source subject.
    });

// Set the value of A to 2
A.onNext(2);

// Set the value of B to 40
B.onNext(40);

// Set the value of A to 216
A.onNext(216);

// End the subscription to values from C
subscription.dispose();

// 'rightProp' is a component property created by the 'right' template 
// property of the lblMedicine template.
var rightProp = new Rx.BehaviorSubject(20);
var widthProp = new Rx.BehaviorSubject(100);

// 'leftProp' is a component property created by the 'left' template 
// property of the txtMedOrder template.
var leftProp = rightProp.select(right => right + 10);

// 'widthProp' is a component property created by the 'width' template 
// property of the txtMedOrder template.
var heightProp = leftProp
    .combineLatest(widthProp, (left, width) => left - width);

// The collapsed property is a custom property created
// by the developer to indicate the collapsed/expanded
// state of a visual component.
var collapsedProp = new Rx.BehaviorSubject(true);

// 'leftProp' is a component property created by the 'left' template 
// property of the txtMedOrder template.
var leftProp2 = collapsedProp.select(collapsed => {
    return collapsed ? rightProp : widthProp;
}).switchLatest();

declare class ODataDataSource { constructor(url: string) { } query(q) { } };

// A ODataDataSource object, that can be used to
// create an observable query to an OData web service. 
var patientDS = new ODataDataSource("http://dws.local");

// 'rowsProp' is a special property that template, which the template
// uses to determine how many components it must create.
var rowsProp = patientDS.query("/Patient?$select=ptName&$orderby=ptName");

// 'index' is a special read-only variable that exist on each component
// created by a template. The index number refers to each component's
// position the bundle it belongs to. In this case, our component is 
// located at the 3rd position (zero-indexed) in the bundle it belongs to.
var index = 2;

// 'rowProp' is a component property created automatically by the template 
// the template that created the component, e.g. lblPatient template.
var rowProp = rowsProp.select(data => {
    return Array.isArray(data) ? data[index] : data
});

// 'textProp' is a component property created by the 'Text' template 
// property of the lblPatient template.
var textProp = rowProp.select(function (patient) {
    return patient.ptName;
});


// 'textProp' is a component property created by the 'Text' template 
// property of the tbSearch template.
var textProp = new Rx.BehaviorSubject("");

// 'rowsProp' is a special property that template, which the template
// uses to determine how many components it must create.
var rowsProp = patientDS.query("/Patient?$select=ptName&$where=ptName eq @1", textProp);
