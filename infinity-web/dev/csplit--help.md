Usage: csplit [OPTION]... FILE PATTERN...
Output pieces of FILE separated by PATTERN(s) to files 'xx00', 'xx01', ...,
and output byte counts of each piece to standard output.

Read standard input if FILE is -

Mandatory arguments to long options are mandatory for short options too.
  ]8;;https://www.gnu.org/software/coreutils/manual/coreutils.html#csplit-b\[1m-b, --suffix-format=FORMAT[0m]8;;\
         use sprintf FORMAT instead of %02d
  ]8;;https://www.gnu.org/software/coreutils/manual/coreutils.html#csplit-f\[1m-f, --prefix=PREFIX[0m]8;;\
         use PREFIX instead of 'xx'
  ]8;;https://www.gnu.org/software/coreutils/manual/coreutils.html#csplit-k\[1m-k, --keep-files[0m]8;;\
         do not remove output files on errors
      ]8;;https://www.gnu.org/software/coreutils/manual/coreutils.html#csplit--suppress-matched\[1m--suppress-matched[0m]8;;\
         suppress the lines matching PATTERN
  ]8;;https://www.gnu.org/software/coreutils/manual/coreutils.html#csplit-n\[1m-n, --digits=DIGITS[0m]8;;\
         use specified number of digits instead of 2
  ]8;;https://www.gnu.org/software/coreutils/manual/coreutils.html#csplit-s\[1m-s, --quiet, --silent[0m]8;;\
         do not print counts of output file sizes
  ]8;;https://www.gnu.org/software/coreutils/manual/coreutils.html#csplit-z\[1m-z, --elide-empty-files[0m]8;;\
         suppress empty output files
      ]8;;https://www.gnu.org/software/coreutils/csplit#csplit--help\[1m--help[0m]8;;\
         display this help and exit
      ]8;;https://www.gnu.org/software/coreutils/csplit#csplit--version\[1m--version[0m]8;;\
         output version information and exit

Each PATTERN may be:
  INTEGER            copy up to but not including specified line number
  /REGEXP/[OFFSET]   copy up to but not including a matching line
  %REGEXP%[OFFSET]   skip to, but not including a matching line
  {INTEGER}          repeat the previous pattern specified number of times
  {*}                repeat the previous pattern as many times as possible

A line OFFSET is an integer optionally preceded by '+' or '-'

Report bugs to: bug-coreutils@gnu.org
GNU coreutils home page: <https://www.gnu.org/software/coreutils/>
General help using GNU software: <https://www.gnu.org/gethelp/>
Report any translation bugs to <https://translationproject.org/team/>
Full documentation <https://www.gnu.org/software/coreutils/csplit>
or available locally via: info '(coreutils) csplit invocation'
