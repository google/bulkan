const Benchmark = require('benchmark');
const { execSync } = require('child_process');

const makeBench = (dir, { useBulkan = false } = {}) => {
  return () => {
    execSync(`node ${useBulkan ? '-r bulkan' : ''} ./`, { cwd: dir });
  };
};

const bulkanHotLoadSuite = new Benchmark.Suite()
  .add('HotReload:vanilla:lodash', makeBench('load-lodash'))
  .add('HotReload:bulkan:lodash', makeBench('load-lodash', { useBulkan: true }))
  .add('HotReload:vanilla:top10', makeBench('load-top10'))
  .add('HotReload:bulkan:top10', makeBench('load-top10', { useBulkan: true }))
  .add('HotReload:vanilla:top25', makeBench('load-top25'))
  .add('HotReload:bulkan:top25', makeBench('load-top25', { useBulkan: true }))
  .add('HotReload:vanilla:top50', makeBench('load-top50'))
  .add('HotReload:bulkan:top50', makeBench('load-top50', { useBulkan: true }))
  .on('error', ({ target: { name, error } }) => {
    console.error(`Failure in ${name}`);
    throw error;
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .run();
