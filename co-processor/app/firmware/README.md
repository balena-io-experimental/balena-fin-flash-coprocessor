# firmware directory

`bootloader.s37` is the standard bootloader for the BGM111. This gets flashed by default when using this application; to disable this, set the [environment variable](https://www.balena.io/docs/learn/manage/serv-vars/) `CUSTOM_BOOTLOADER` to your desired bootloader. Possible variants will be handled by the flash.sh script in the future.

Place your application firmware in this directory.
