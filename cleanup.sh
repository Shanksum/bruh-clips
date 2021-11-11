#!/bin/bash
exec 3>&1 4>&2
trap 'exec 2>&4 1>&3' 0 1 2 3
exec 1>log.out 2>&1

# Find and delete all clip files older than 2 days
# Warning: Change the filepath to the path of your webserver
find /usr/www/users/bruhnc/clips/ -mindepth 1 -mtime +1 -type f -delete

# Find and delte all upload pages older than 2 days
# Warning: Change the filepath to the path of your webserver
find /usr/www/users/bruhnc/uploads/ -mindepth 1 -mtime +1 -type f -delete