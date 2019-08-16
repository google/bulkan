# Bulkan Benchmarks

## How to run

You may need to install node on your root account first.

```sh
npm i

# root privileges are required to purge the disk cache during cold load tests
sudo su
node ./
```

## Example output

Each result is the average period ± the std-dev for that test.

ColdLoad results have a cache settling time subtracted from their mean.
ColdLoad:purge measures the average time the purging script takes on top of
the settling time.

```
ColdLoad:purge x 0.1216 s ± 0.006123 (period±stdev) (10 samples)
ColdLoad:vanilla:lodash x 0.3606 s ± 0.1113 (period±stdev) (10 samples)
ColdLoad:bulkan:lodash x 0.5037 s ± 0.05664 (period±stdev) (10 samples)
ColdLoad:vanilla:top10 x 1.578 s ± 0.1930 (period±stdev) (10 samples)
ColdLoad:bulkan:top10 x 0.9646 s ± 0.06382 (period±stdev) (10 samples)
ColdLoad:vanilla:top25 x 13.89 s ± 0.5292 (period±stdev) (10 samples)
ColdLoad:bulkan:top25 x 4.357 s ± 0.7052 (period±stdev) (10 samples)
ColdLoad:vanilla:top50 x 32.17 s ± 0.6413 (period±stdev) (10 samples)
ColdLoad:bulkan:top50 x 4.883 s ± 0.4288 (period±stdev) (10 samples)
HotLoad:vanilla:lodash x 0.07426 s ± 0.003768 (period±stdev) (43 samples)
HotLoad:bulkan:lodash x 0.1255 s ± 0.005618 (period±stdev) (29 samples)
HotLoad:vanilla:top10 x 0.3588 s ± 0.01442 (period±stdev) (17 samples)
HotLoad:bulkan:top10 x 0.3671 s ± 0.01711 (period±stdev) (16 samples)
HotLoad:vanilla:top25 x 0.8006 s ± 0.01273 (period±stdev) (13 samples)
HotLoad:bulkan:top25 x 0.9904 s ± 0.04732 (period±stdev) (12 samples)
HotLoad:vanilla:top50 x 2.196 s ± 0.08546 (period±stdev) (11 samples)
HotLoad:bulkan:top50 x 1.895 s ± 0.06808 (period±stdev) (11 samples)
```
