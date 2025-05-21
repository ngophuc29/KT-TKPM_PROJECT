export function createRateLimiter(limit, intervalMs) {
    let calls = 0;
    let lastReset = Date.now();

    return function canCall() {
        const now = Date.now();
        if (now - lastReset > intervalMs) {
            calls = 0;
            lastReset = now;
        }
        if (calls < limit) {
            calls++;
            return { allowed: true };
        }
        // Tính số giây còn lại
        const secondsLeft = Math.ceil((intervalMs - (now - lastReset)) / 1000);
        return { allowed: false, secondsLeft };
    };
}