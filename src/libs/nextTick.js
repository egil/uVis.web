// Only add setZeroTimeout to the window object, and hide everything
// else in a closure.
(function () {
    var timeouts = [];
    var messageName = "zero-timeout-message";

    // Like setTimeout, but only takes a function argument.  There's
    // no time argument (always zero) and no arguments (you have to
    // use a closure).
    function setZeroTimeout(fn) {
        timeouts.push(fn);
        window.postMessage(messageName, "*");
    }

    function handleMessage(event) {
        if (event.source == window && event.data == messageName) {
            event.stopPropagation();
            if (timeouts.length > 0) {
                var fn = timeouts.shift();
                fn();
            }
        }
    }

    window.addEventListener("message", handleMessage, true);

    // Add the one thing we want added to the window object.
    window.setZeroTimeout = setZeroTimeout;
})();

// nextTick - by stagas / public domain
(function () {
    var queue = [];
    var dirty = false;
    var fn;
    var hasPostMessage = !!window.postMessage;
    var messageName = 'nexttick';
    var trigger = (function () {
        return hasPostMessage
            ? function trigger() {
                window.postMessage(messageName, '*');
            }
            : function trigger() {
                setTimeout(function () { processQueue() }, 0);
            };
    }());
    
    var processQueue = (function () {
        return hasPostMessage
            ? function processQueue(event) {
                if (event.source === window && event.data === messageName) {
                    event.stopPropagation();
                    flushQueue();
                }
            }
            : flushQueue;
    })();

    function flushQueue() {
        while (fn = queue.shift()) {
            fn();
        }
        dirty = false;
    }

    function nextTick(fn) {
        queue.push(fn);
        if (dirty) return;
        dirty = true;
        trigger();
    }

    if (hasPostMessage) window.addEventListener('message', processQueue, true);

    nextTick.removeListener = function() {
        window.removeEventListener('message', processQueue, true);
    };

    window.nextTick = nextTick;
})();