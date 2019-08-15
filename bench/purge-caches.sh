#!/bin/bash
# Source + More info: https://stackoverflow.com/a/44266604
DISK=$(df ./ | awk 'END{print $1}')
sync
echo 3 > /proc/sys/vm/drop_caches
blockdev --flushbufs $DISK
# hdparm -F $DISK
sleep $1