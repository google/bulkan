#!/bin/bash

for d in load-lodash load-top10 load-top25 load-top50 ; do
  cd $d
  npm i
  npx bulkan build
  cd -
done
