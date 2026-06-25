'use strict';

const REDIS_CONFIG = { host: '127.0.0.1', port: 6379 };
const Queue = require('bull');
const instances = {};

function createQueue(name, opts = {}) {
    if (instances[name]) return instances[name];

    const queue = new Queue(name, {
        redis: REDIS_CONFIG,
        limiter: { max: 15, duration: 60000 },
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 4000 },
            removeOnComplete: 100,
            removeOnFail: 50
        },
        ...opts
    });

    queue.on('completed', (job, result) => {
        console.log(`[queue:${name}] Job ${job.id} completed`);
    });

    queue.on('failed', (job, err) => {
        console.error(`[queue:${name}] Job ${job.id} failed:`, err.message);
    });

    queue.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') return;
        console.error(`[queue:${name}] Error:`, err.message);
    });

    instances[name] = queue;
    return queue;
}

module.exports = { createQueue };
