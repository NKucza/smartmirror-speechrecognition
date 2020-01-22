python3 pythonDeepSpeech/mic_vad_streaming.py \
 -v 3 \
 -m /opt/dev/DeepSpeech/models/deepspeech-0.5.1-models/output_graph.pbmm  \
 -l /opt/dev/DeepSpeech/models/deepspeech-0.5.1-models/lm.binary \
 -t opt/dev/DeepSpeech/models/deepspeech-0.5.1-models/trie \
 -d 0 \
  -a  /opt/dev/DeepSpeech/models/deepspeech-0.5.1-models/alphabet.txt \
  -w /opt/dev/DeepSpeech/tmp