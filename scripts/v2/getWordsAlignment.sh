#!/bin/bash

# export ROOT_PATH=/Users/denstep/Workarea/Projects/benderlip
# for i in $ROOT_PATH/res/videos/* ; do
#   if [ -d "$i" ]; then
#     rm -f $ROOT_PATH/res/videos/$(basename "$i")/wordsMapAeneas.json && \
#     python -m aeneas.tools.execute_task \
#         $ROOT_PATH/res/videos/$(basename "$i")/$(basename "$i")_alignment-trim.mp3 \
#         $ROOT_PATH/res/videos/$(basename "$i")/words.txt \
#         "task_language=ru|os_task_file_format=json|is_text_type=plain" \
#         $ROOT_PATH/res/videos/$(basename "$i")/wordsMapAeneas.json \
#     && node $ROOT_PATH/scripts/replaceUnicodeInWordsMapAndSetOffset.js --name $(basename "$i")
#   fi
# done

export ROOT_PATH=/Users/denstep/Workarea/Projects/benderlip

for j in $ROOT_PATH/res/videos/* ; do
  echo "$(basename "$i")"
# array=("_7850nIvQcg")
# for j in ${array[*]} ; do
  if [ -d "$j" ]; then
    VIDEO_PATH=$ROOT_PATH/res/videos/$(basename "$j")
    for i in $VIDEO_PATH/alignment-data/*.mp3 ; do
      IFS='.'
      read -ra DNAME <<< "$(basename "$i")"
      echo $DNAME
      python -m aeneas.tools.execute_task \
          $VIDEO_PATH/alignment-data/$DNAME.mp3 \
          $VIDEO_PATH/alignment-data/$DNAME.txt \
          "task_language=ru|os_task_file_format=json|is_text_type=plain" \
          $VIDEO_PATH/alignment-data/$DNAME.json
    done
  fi
done
