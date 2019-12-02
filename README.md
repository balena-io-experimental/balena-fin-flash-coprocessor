# balena-fin-flash-coprocessor

This is a balena application template that has a service that allows for flashing of the balenaFin co-processor with a compiled application. For more information on how to compile your own co-processor applications, see [coprocessor-base](https://github.com/balena-io-playground/balena-fin-coprocessor-base/). This application will detect which version of Fin you are using and correctly handle the flashing procedure. We include the settings required for use under Raspbian here too (please use our [balenaFin compiled version of Raspbian](https://github.com/balena-os/pi-gen/releases/latest) as it includes necessary drivers and overlays).

**NOTE:** While this interface exposes itself to external connections can be useful for development (you can consume this interface from your PC in order to flash and test your balenaFin), we highly recommend to changing the docker-compose configuration for the co-processor service (`network_mode: host`) once you have implemented your own business logic so that only the services on local to the device will be able to access it.

## proceedure

As the co-processor is directly attached to its corresponding compute module, via PCB traces on the balenaFin, there are a couple of steps involved to prepare the co-processor for flashing.

1. Configure the [device tree overlay](#device-tree-overlay)
2. Toggle the [balenaFin multiplexer](#balenaFin-multiplexer) 
3. Install [OpenOCD](#openocd) with RPi GPIO bitbanging + FTDI configurations
4. Run OpenOCD with co-processor configurations enabled (see the [config directory](co-processor/app/openocd/config) for your version specific configuration)

## co-processor REST interface

Default port: `1337`

For example:

`your-device-ip:1337/v1/flash/your-firmware.hex`

## flash firmware

_POST_ `/v1/flash/:firmware`

Flashes the given firmware name from the service fs ( ie `your-firmware.hex` ). The co-processor service has a volume (`/data`) that you can add to other service and use as a way to share different firmwares to flash. Within balenaFin v1.1 and above, this action will trigger a device reboot.

### custom bootloader

A custom bootloader can be specified by setting `CUSTOM_BOOTLOADER` in your application/device [environment variables](https://www.balena.io/docs/learn/manage/serv-vars/).

## additional info

### device tree overlay

In order to connect the Raspberry Pi Compute Module to the co-processor via, you will need to set the following [configuration variable](https://www.balena.io/docs/learn/manage/configuration/) on your device. This allows us to map UART1 to the PCB traces that are tied to the coprocessor.

`BALENA_HOST_CONFIG_dtoverlay` = `"balena-fin","uart1,txd1_pin=32,rxd1_pin=33"`

#### raspbian

The same overlay configuration as before can be place into the `/boot` directory of your device and the `dtoverlay` variable can be set in `config.txt`.

`dtoverlay` = `"balena-fin","uart1,txd1_pin=32,rxd1_pin=33"`

If you attempt to later use the UART1 mapping to communicate to the co-processor over UART, please ensure you apply this setting to your device overlay as this allows the UART1 clock to scale correctly:

`core_freq`=`250`

### balenaFin multiplexer

In order to maintain as many available compute module GPIO, we use a high speed multiplexer to share the pins used for SWD (for flashing/debugging) with a serial UART (for communication). This is performed via an I2C IO expander that we handily include the drivers for in both our balenaOS and Raspbian distributions. 

The mux select pin is mapped to `GPIO 41` where `1` selects the coprocessor's SWD pin and `0` selects UART pins.

For example, this can be toggled directly from your shell:

```bash
echo 41 > /sys/class/gpio/export
echo "out" > /sys/class/gpio/gpio41/direction
echo 0 > /sys/class/gpio/gpio41/value # UART
echo 1 > /sys/class/gpio/gpio41/value # SWD
```

#### raspbian

The instructions are the same as above (provided you have the driver included with our version of [Raspbian for the balenaFin](https://github.com/balena-os/pi-gen/releases/latest). If you are using a custom image, we load the [`gpio-pca953x.c`](https://github.com/torvalds/linux/blob/master/drivers/gpio/gpio-pca953x.c) kernel module for the I2C IO expander.

### openocd

This example demonstrates how to use OpenOCD however any tool that provides an SWD flashing interface over the RPi GPIO will also work. You can see how we setup and install OpenOCD in this application's [Dockerfile](https://github.com/balena-io-playground/balena-fin-flash-coprocessor/blob/master/co-processor/Dockerfile.template).

When compiling OpenOCD ensure that you first configure the build for these settings:

`./configure --enable-sysfsgpio --enable-ft2232_libftdi`

This enables the required configuration for the balenaFin versions v1.0 (using an FTDI chip) and v1.1 (using the RPi GPIO).

#### raspbian

See above.

