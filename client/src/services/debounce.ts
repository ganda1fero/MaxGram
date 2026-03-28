export function debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number = 100) {
    let timeoutPtr: number | null = null;

    const debouncedFn = function(this: any, ...args: Parameters<T>){
        if (timeoutPtr) clearTimeout(timeoutPtr);
        timeoutPtr = setTimeout(() => fn.apply(this, args), delayMs);
    }

    const cancelTimeout = () => {
        if (timeoutPtr) clearTimeout(timeoutPtr);
        timeoutPtr = null;
    };

    return { debouncedFn, cancelTimeout };
}