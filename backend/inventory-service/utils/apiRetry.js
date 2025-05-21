const axios = require('axios');

async function callApiWithRetry(options, maxRetries = 3, minDelay = 3000, maxDelay = 5000) {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await axios(options);
        } catch (err) {
            attempt++;
            if (attempt >= maxRetries) throw err;
            const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

module.exports = { callApiWithRetry };