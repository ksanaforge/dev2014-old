@ECHO OFF
"C:\Program Files (x86)\Atmel\AVR Tools\AvrAssembler2\avrasm2.exe" -S "E:\eforth-ide-win32-20131226\eforth-ide\328eforth\labels.tmp" -fI -W+ie -C V2E -o "E:\eforth-ide-win32-20131226\eforth-ide\328eforth\328eForth.hex" -d "E:\eforth-ide-win32-20131226\eforth-ide\328eforth\328eForth.obj" -e "E:\eforth-ide-win32-20131226\eforth-ide\328eforth\328eForth.eep" -m "E:\eforth-ide-win32-20131226\eforth-ide\328eforth\328eForth.map" -l "E:\eforth-ide-win32-20131226\eforth-ide\328eforth\328eForth.lst" "E:\eforth-ide-win32-20131226\eforth-ide\328eforth\328eForth.asm"
