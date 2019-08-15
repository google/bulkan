const Benchmark = require('benchmark');
const { execSync } = require('child_process');

Benchmark.options.minSamples = 10;
const coldSettleTime = 5
const mb = (dir, { bulkan = false, cold = false } = {}) => {
  if (cold) {
    return () => {
      execSync(`./purge-caches.sh ${coldSettleTime}`);
      execSync(`node ${bulkan ? '-r bulkan/register' : ''} ./`, { cwd: dir });
    };
  } else {
    return () => {
      execSync(`node ${bulkan ? '-r bulkan/register' : ''} ./`, { cwd: dir });
    };
  }
};

let pfx = 'HotLoad';
const bulkanHotLoadSuite = new Benchmark.Suite()
  .add(`${pfx}:vanilla:lodash`, mb('load-lodash'))
  .add(`${pfx}:bulkan:lodash`, mb('load-lodash', { bulkan: true }))
  .add(`${pfx}:vanilla:top10`, mb('load-top10'))
  .add(`${pfx}:bulkan:top10`, mb('load-top10', { bulkan: true }))
  .add(`${pfx}:vanilla:top25`, mb('load-top25'))
  .add(`${pfx}:bulkan:top25`, mb('load-top25', { bulkan: true }))
  .add(`${pfx}:vanilla:top50`, mb('load-top50'))
  .add(`${pfx}:bulkan:top50`, mb('load-top50', { bulkan: true }))
  .on('error', ({ target: { name, error } }) => {
    console.error(`Failure in ${name}`);
    throw error;
  })
  .on('cycle', ({target: cycle}) => {
    const period = cycle.times.period;
    const deviation = cycle.stats.deviation;
    const samples = cycle.stats.sample.length;
    console.log(`${cycle.name} x ${period.toPrecision(4)} s ± ${deviation.toPrecision(4)} (period±stdev) (${samples} samples)`)
  });

pfx = 'ColdLoad';
const bulkanColdLoadSuite = new Benchmark.Suite()
  .add(`${pfx}:vanilla:lodash`, mb('load-lodash', { cold: true }))
  .add(`${pfx}:bulkan:lodash`, mb('load-lodash', { bulkan: true, cold: true }))
  .add(`${pfx}:vanilla:top10`, mb('load-top10', { cold: true }))
  .add(`${pfx}:bulkan:top10`, mb('load-top10', { bulkan: true, cold: true }))
  .add(`${pfx}:vanilla:top25`, mb('load-top25', { cold: true }))
  .add(`${pfx}:bulkan:top25`, mb('load-top25', { bulkan: true, cold: true }))
  .add(`${pfx}:vanilla:top50`, mb('load-top50', { cold: true }))
  .add(`${pfx}:bulkan:top50`, mb('load-top50', { bulkan: true, cold: true }))
  .on('error', ({ target: { name, error } }) => {
    console.error(`Failure in ${name}`);
    throw error;
  })
  .on('cycle', ({target: cycle}) => {
    const period = cycle.times.period - coldSettleTime;
    const deviation = cycle.stats.deviation;
    const samples = cycle.stats.sample.length;
    console.log(`${cycle.name} x ${period.toPrecision(4)} s ± ${deviation.toPrecision(4)} (period±stdev) (${samples} samples)`)
  });

bulkanColdLoadSuite.run();
bulkanHotLoadSuite.run();

/**
 * target: Benchmark {
    name: 'ColdLoad:bulkan:top50',
    options: {
      async: false,
      defer: false,
      delay: 0.005,
      id: undefined,
      initCount: 1,
      maxTime: 5,
      minSamples: 5,
      minTime: 0.05,
      name: undefined,
      onAbort: undefined,
      onComplete: undefined,
      onCycle: undefined,
      onError: undefined,
      onReset: undefined,
      onStart: undefined
    },
    async: false,
    defer: false,
    delay: 0.005,
    initCount: 1,
    maxTime: 5,
    minSamples: 5,
    minTime: 0.05,
    id: 16,
    fn: [Function],
    stats: {
      moe: 0.06424152356217873,
      rme: 0.9946057051640376,
      sem: 0.02314175920827764,
      deviation: 0.05174654670864052,
      mean: 6.4589940746,
      sample: [Array],
      variance: 0.002677705096269515
    },
    times: {
      cycle: 6.4589940746,
      elapsed: 64.686,
      period: 6.4589940746,
      timeStamp: 1565896355055
    },
    running: false,
    count: 1,
    compiled: [Function: anonymous],
    cycles: 1,
    hz: 0.15482287000889208
  }
}
 */