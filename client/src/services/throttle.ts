export function throttle<T extends (...args: any[]) => any>(fn: T, limitMs: number = 100) {
    let isThrottled = false;
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        if (!isThrottled) {
            isThrottled = true;
            setTimeout(() => isThrottled = false, limitMs);
            return fn.apply(this, args);
        }
    }
};