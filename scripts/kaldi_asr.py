#download model from http://alphacephei.com/kaldi/kaldi-ru-0.2.tar.gz
MODEL = '/atom_tb/kaldi-ru-0.2/'
SCP = '/atom_tb/scp/' #folder for temp files

import random
import tqdm
import os
from subprocess import Popen
from multiprocessing import Pool

def process_files(filelist, processes_num = 5):
    filelist = [fl for fl in filelist if fl.endswith(".wav")]
    pool = Pool(processes=processes_num)
    for _ in tqdm.tqdm(pool.imap_unordered(process_file, filelist), total=len(filelist)):
        pass

def process_file(filename, model_folder = MODEL, scp_folder = SCP):
    #print('started ' + filename)
    resultname = filename + '.out'
    scp_name = scp_folder + str(random.randint(0, 1000000000000))
    f = open(scp_name, 'w').write('decoder-test ' + filename)

    cmd = '''cd ''' + model_folder + ''';
            export KALDI_ROOT=/kaldi/;
            export PATH=$PWD/utils:$KALDI_ROOT/src/bin:$KALDI_ROOT/tools/openfst/bin:$KALDI_ROOT/src/fstbin:$KALDI_ROOT/src/gmmbin:$KALDI_ROOT/src/featbin:$KALDI_ROOT/src/lm:$KALDI_ROOT/src/sgmmbin:$KALDI_ROOT/src/sgmm2bin:$KALDI_ROOT/src/fgmmbin:$KALDI_ROOT/src/latbin:$KALDI_ROOT/src/nnetbin:$KALDI_ROOT/src/nnet2bin:$KALDI_ROOT/src/online2bin:$KALDI_ROOT/src/ivectorbin:$KALDI_ROOT/src/lmbin:$KALDI_ROOT/src/chainbin:$KALDI_ROOT/src/nnet3bin:$PWD:$PATH:$KALDI_ROOT/tools/sph2pipe_v2.5;
            export LC_ALL=C;
            compute-mfcc-feats --config=conf/mfcc.conf  --allow_downsample=true --subtract-mean=true scp:''' + scp_name + ''' ark:- |
                nnet3-latgen-faster --word-symbol-table=exp/tdnn/graph/words.txt --frame-subsampling-factor=3 --frames-per-chunk=51 \
                     --acoustic-scale=0.9 --beam=12.0 --lattice-beam=6.0 --max-active=10000 exp/tdnn/final.mdl exp/tdnn/graph/HCLG.fst ark:- ark:- |
                lattice-lmrescore --lm-scale=-1.0 ark:- 'fstproject --project_output=true data/lang_test_rescore/G.fst |' ark:- |
                lattice-lmrescore-const-arpa ark:- data/lang_test_rescore/G.carpa ark:- |
                lattice-1best --acoustic-scale=0.9 ark:- ark,t:- |
                lattice-align-words data/lang_test_rescore/phones/word_boundary.int exp/tdnn/final.mdl ark:- ark:- |
                nbest-to-ctm ark:- - |
                local/int2sym.pl -f 5 data/lang_test_rescore/words.txt - ->''' + resultname
    Popen(cmd, shell=True).wait()
    os.remove(scp_name)
