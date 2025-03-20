#!/bin/bash

cd /Library/WebServer/Documents/test/music4classicalguitar.github.io/docs/swf2js

CreateFlashHtml()
{
 
FILES=`ls *.swf`
for FILE in ${FILES}
  do
  NAME=`echo "${FILE}" | sed 's/[.]swf//g'`
  HTML_FILE="${NAME}_flash.html"
  if [ ! -f "${HTML_FILE}" ]
  then
    CreateFlashHtml
  fi
  ls -l "${FILE}" "${NAME}.html" "${NAME}_flash.html"
  echo
  done

 echo '<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>'"${NAME}"'</title>
  </head>
  <body>
    <object width="100%" height="100%">
      <param name="movie" value="'"${NAME}"'.swf">
      <embed src="'"${NAME}"'.swf" width="100%" height="100%"></embed>
    </object>
  </body>
</html>' > "${HTML_FILE}"
}


FILES=`ls *.swf`
for FILE in ${FILES}
  do
  NAME=`echo "${FILE}" | sed 's/[.]swf//g'`
  HTML_FILE="${NAME}_flash.html"
  git mv "${FILE}" "examples"
  git mv "${NAME}.html" "examples"
  git mv "${NAME}_flash.html" "examples"
  echo "${NAME}"
  done
