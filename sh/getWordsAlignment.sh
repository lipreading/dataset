#!/bin/bash

export ROOT_PATH=/Users/denstep/Workarea/Projects/benderlip
for i in $ROOT_PATH/res/videos/* ; do
  if [ -d "$i" ]; then
    rm -f $ROOT_PATH/res/videos/$(basename "$i")/wordsMapAeneas.json && \
    python -m aeneas.tools.execute_task \
        $ROOT_PATH/res/videos/$(basename "$i")/$(basename "$i")_alignment-trim.mp3 \
        $ROOT_PATH/res/videos/$(basename "$i")/words.txt \
        "task_language=ru|os_task_file_format=json|is_text_type=plain" \
        $ROOT_PATH/res/videos/$(basename "$i")/wordsMapAeneas.json \
    && node $ROOT_PATH/scripts/replaceUnicodeInWordsMapAndSetOffset.js --name $(basename "$i")
  fi
done