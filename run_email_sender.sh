#!/bin/bash
. /u/local/Modules/default/init/modules.sh
module load python

while :
do
    # loop infinitely
    python email_sender.py
    sleep 300
done
