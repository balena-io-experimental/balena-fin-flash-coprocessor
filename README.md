# balena-fin-flash

 This is a balena application template that has a service that allows for flashing of the balenaFin co-processor with a compiled application. For more information on how to compile your own co-processor applications see (coprocessor-base)[]. This application will detect which version of Fin you are using and correctly handle the flashing proceedure.

**NOTE:** While this interface exposes itself to external connections can be useful for development (you can consume this interface from your PC in order to flash and test your balenaFin), we highly recommend to changing the docker-compose configuration for the co-processor service ( `network_mode: host` ) once you have implemented your own business logic so that only the services on the device will be able to access it.

## device tree overlay

In order to allow the Raspberry Pi Compute Module to communicate via UART to the co-processor, you need to set the following configuration variable on your device.

`BALENA_HOST_CONFIG_dtoverlay` = `"balena-fin","uart1,txd1_pin=32,rxd1_pin=33"`

## co-processor REST interface (port 1337)

default port: `1337`

## flash firmware

_POST_ `/v1/flash/:firmware`

Flashes the given firmware name from the service fs ( ie `firmware/firmata-balena-0.0.2.hex` ). The co-processor service has a volume (`/data`) that you can add to other service and use as a way to share different firmwares to flash. on balenaFin v1.1 and above, this action will trigger a reboot.
