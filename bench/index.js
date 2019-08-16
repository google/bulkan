const Benchmark = require('benchmark');
const { execSync } = require('child_process');

Benchmark.options.minSamples = 10;
const coldSettleTime = 10;
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
  .on('cycle', ({ target: cycle }) => {
    const period = cycle.times.period;
    const deviation = cycle.stats.deviation;
    const samples = cycle.stats.sample.length;
    console.log(`${cycle.name} x \
${period.toPrecision(4)} s ± ${deviation.toPrecision(4)} (period±stdev) \
(${samples} samples)`);
  });

pfx = 'ColdLoad';
const bulkanColdLoadSuite = new Benchmark.Suite()
  .add(`${pfx}:purge`, () => execSync(`./purge-caches.sh ${coldSettleTime}`))
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
  .on('cycle', ({ target: cycle }) => {
    const period = cycle.times.period - coldSettleTime;
    const deviation = cycle.stats.deviation;
    const samples = cycle.stats.sample.length;
    console.log(`${cycle.name} x \
${period.toPrecision(4)} s ± ${deviation.toPrecision(4)} (period±stdev) \
(${samples} samples)`);
  });

console.log(`minSamples: ${Benchmark.options.minSamples} \
purge-settle-time: ${coldSettleTime} s`);
bulkanColdLoadSuite.run();
bulkanHotLoadSuite.run();
