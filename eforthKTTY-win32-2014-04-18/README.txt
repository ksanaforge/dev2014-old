eforthKTTY -- node webkit serial port 328eforth ksana tty

>>> A. unzip eforthKTTY

A01. Unzip the eforthKTTY working directory

>>> B. start eforthKTTY

B01. DblClick run.bat or nw.exe to start eforthKTTY.
B02. Make sure the name of serial port is correct.
B03. Click 'connect' to open the port.

>>> C. Operations:

C01. Sending command line to 328eforth
     Click 'sendCmd' or press ENTER key in command line box, the
     command line will be sent. 

C02. Retrieving previous command line
     In the command line box, UP and DOWN keys could be used to
     retrieve any previously sent command line.

C03. Pasting text as command lines
     Pasting text into empty command line box, the text will be
     treated as command lines to be sent automatically one by one.

C04. Transfering file as command lines
     Click 'sendFile' or press ENTER key in file name box, the
     file will be sent.

C05. Selecting file 
     In the file name box, UP and DOWN keys could be used to
     select a file in specified directory.

>>> D. Features

D01. Colorful output.
     Blue for command line input, red for error or warning, green
     for system ok prompt, black for other output.

D02. Extra processing to show stack and words
     After a single command line, end of file transering, or end
     of multi-line pasting being sent, eforthKTTY might
     apend an extra hidden command line '1 EMIT CR .S CR WORDS'
     or '[ 1 EMIT CR .S CR WORDS ]' to show data stack and
     328eforth words.

D03. Fast processing
     When file transfering or multi-line pasting, each time
     328eforth (or any other forth) executes '6 EMIT', giving
     acknowlage for next command line, eforthKTTY will send
     the next command line as soon as possible, before end of
     non-zero line-delay.

>>> E. To do:

D01. "7 EMIT" in output as error.
D02. "6 EMIT" at last output as ready for next command.
D03. "5 EMIT" at last output as ready for next input.
D04. "1 EMIT" at first output as hidden info. (data stack and words)
D05. show the number of  UTF8 bytes of the command line.
D06. show the number of unique command lines.
D07. prevent pending command lines when error.
D08. prevent 2 oks for ESC.
D10. checkBox to show recieved bytes for debugging.
D11. unit test.
D12. listBox to select port.

>>> E. to report bugs:

E01. email samsuanchem@gmail.com
E02. call 0920-714-028 ���n