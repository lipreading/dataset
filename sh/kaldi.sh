#!/bin/bash

export KALDI_ROOT=/Users/denstep/Workarea/Projects/benderlip/kaldi-trunk
export KALDI_RU_ROOT=/Users/denstep/Workarea/Projects/benderlip/kaldi-trunk/kaldi-ru-0.5

export PATH=$PATH:$KALDI_RU_ROOT/utils:$KALDI_ROOT/src/bin:$KALDI_ROOT/tools/openfst/bin:$KALDI_ROOT/src/fstbin:$KALDI_ROOT/src/gmmbin:$KALDI_ROOT/src/featbin:$KALDI_ROOT/src/lm:$KALDI_ROOT/src/sgmmbin:$KALDI_ROOT/src/sgmm2bin:$KALDI_ROOT/src/fgmmbin:$KALDI_ROOT/src/latbin:$KALDI_ROOT/src/nnetbin:$KALDI_ROOT/src/nnet2bin:$KALDI_ROOT/src/online2bin:$KALDI_ROOT/src/ivectorbin:$KALDI_ROOT/src/lmbin:$KALDI_ROOT/src/chainbin:$KALDI_ROOT/src/nnet3bin:$KALDI_RU_ROOT:$KALDI_ROOT/tools/sph2pipe_v2.5
export LC_ALL=C

online2-wav-nnet3-latgen-faster \
      --word-symbol-table=$KALDI_RU_ROOT/exp/tdnn/graph/words.txt --frame-subsampling-factor=3 --frames-per-chunk=51 \
      --acoustic-scale=1.0 --beam=12.0 --lattice-beam=6.0 --max-active=10000 \
      --config=$KALDI_RU_ROOT/exp/tdnn/conf/online.conf \
      $KALDI_RU_ROOT/exp/tdnn/final.mdl $KALDI_RU_ROOT/exp/tdnn/graph/HCLG.fst ark:$1.utt2spk scp:$1.scp ark:- |
    lattice-lmrescore --lm-scale=-1.0 ark:- 'fstproject --project_output=true /Users/denstep/Workarea/Projects/benderlip/kaldi-trunk/kaldi-ru-0.5/data/lang_test_rescore/G.fst |' ark:- |
    lattice-lmrescore-const-arpa ark:- $KALDI_RU_ROOT/data/lang_test_rescore/G.carpa ark:- |
    lattice-1best --acoustic-scale=0.08333 ark:- ark,t:- |
    lattice-align-words $KALDI_RU_ROOT/data/lang_test_rescore/phones/word_boundary.int $KALDI_RU_ROOT/exp/tdnn/final.mdl ark:- ark:- |
    nbest-to-ctm ark:- - |
    $KALDI_RU_ROOT/local/int2sym.pl -f 5 $KALDI_RU_ROOT/data/lang_test_rescore/words.txt - -
