export function throttle<T extends (...args: any[]) => any>(fn: T, limitMs: number = 100) {
    let isThrottle = false;
    return function (this: any, ...args: Parameters<T>) {
        if (!isThrottle) {
            isThrottle = true;
            fn.apply(this, args);
            setTimeout(() => isThrottle = false, limitMs);
        }
    }
};