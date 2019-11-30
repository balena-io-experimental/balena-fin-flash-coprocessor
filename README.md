# balena-fin-flash

This is a balena application template that has a service that allows for flashing of the balenaFin co-processor with a compiled application. For more information on how to compile your own co-processor applications, see [coprocessor-base](https://github.com/balena-io-playground/balena-fin-coprocessor-base/). This application will detect which version of Fin you are using and correctly handle the flashing procedure.

**NOTE:** While this interface exposes itself to external connections can be useful for development (you can consume this interface from your PC in order to flash and test your balenaFin), we highly recommend to changing the docker-compose configuration for the co-processor service (`network_mode: host`) once you have implemented your own business logic so that only the services on the device will be able to access it.

## device tree overlay

In order to connect the Raspberry Pi Compute Module to the co-processor via, you will need to set the following [configuration variable](https://www.balena.io/docs/learn/manage/configuration/) on your device.

`BALENA_HOST_CONFIG_dtoverlay` = `"balena-fin","uart1,txd1_pin=32,rxd1_pin=33"`

## co-processor REST interface

Default port: `1337`

For example:

`your-device-ip:1337/v1/flash/your-firmware.hex`

## flash firmware

_POST_ `/v1/flash/:firmware`

Flashes the given firmware name from the service fs ( ie `your-firmware.hex` ). The co-processor service has a volume (`/data`) that you can add to other service and use as a way to share different firmwares to flash. Within balenaFin v1.1 and above, this action will trigger a device reboot.

### custom bootloader

A custom bootloader can be specified by setting `CUSTOM_BOOTLOADER` in your application/device [environment variables](https://www.balena.io/docs/learn/manage/serv-vars/).
