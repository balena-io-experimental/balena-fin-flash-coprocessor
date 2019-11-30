#!/bin/bash

FW=$1
REV=$2
if ! [ -z "$CUSTOM_BOOTLOADER" ]
then
  BOOTLOADER=${CUSTOM_BOOTLOADER}
fi
echo "Opening screen terminal for flashing $FW to balenaFin v$REV"
case $REV in
  09)
    screen -dmS swd_program  "./openocd/openocd-v1.0.sh"
    BOOTLOADER="bootloader-bgm111.s37"
    ;;
  10)
    screen -dmS swd_program  "./openocd/openocd-v1.1.sh"
    BOOTLOADER="bootloader-bgm111.s37"
    ;;
  *)
    echo "ERROR: unknown balenaFin revision" >&2
    exit 1
    ;;
esac
sleep 6
  { sleep 5; echo "reset halt"; echo "program firmware/$BOOTLOADER"; sleep 5; echo "reset halt"; echo "program firmware/$FW"; echo "reset run"; sleep 10; } | telnet localhost 4444
sleep 5
echo "closing the openocd process..."
kill $(ps aux | grep '[S]CREEN -dmS swd_program' | awk '{print $2}')
sleep 5
echo "flashing complete"
