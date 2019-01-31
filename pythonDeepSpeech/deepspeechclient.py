import sys
import signal
import json

def to_node(type, message):
	# convert to json and print (node helper will read from stdout)
	try:
		print(json.dumps({type: message}))
	except Exception:
		pass
	# stdout has to be flushed manually to prevent delays in the node helper communication
	sys.stdout.flush()

to_node("status", "deepspeech client started...")


import pyaudio
import wave
import audioop
from collections import deque
import os
import argparse
import struct
import urllib2
import urllib
import socket
import time
import math

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument(
    "--host_ip",
    default="localhost",
    type=str,
    help="Server IP address. (default: %(default)s)")
parser.add_argument(
    "--host_port",
    default=8086,
    type=int,
    help="Server Port. (default: %(default)s)")
args = parser.parse_args()

LANG_CODE = 'en-US'  # Language to use

FLAC_CONV = 'flac -f'  # We need a WAV to FLAC converter. flac is available
                       # on Linux

# Microphone stream config.
CHUNK = 1024  # CHUNKS of bytes to read each time from mic
FORMAT = pyaudio.paInt32
CHANNELS = 1
RATE = 16000
THRESHOLD = 1800 #2200  # The threshold intensity that defines silence
                  # and noise signal (an int. lower than THRESHOLD is silence).

SILENCE_LIMIT = 1.5  # Silence limit in seconds. The max ammount of seconds where
                   # only silence is recorded. When this time passes the
                   # recording finishes and the file is delivered.

PREV_AUDIO = 2.0  # Previous audio (in seconds) to prepend. When noise
                  # is detected, how much of previously recorded audio is
                  # prepended. This helps to prevent chopping the beggining
                  # of the phrase.

def listen_for_speech(threshold=THRESHOLD, num_phrases=-1):
    """
    Listens to Microphone, extracts phrases from it and sends it to 
    Google's TTS service and returns response. a "phrase" is sound 
    surrounded by silence (according to threshold). num_phrases controls
    how many phrases to process before finishing the listening process 
    (-1 for infinite). 
    """

    #Open stream
    p = pyaudio.PyAudio()

    stream = p.open(format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK)

    audio2send = []
    cur_data = ''  # current chunk  of audio data
    rel = RATE/CHUNK
    slid_win = deque(maxlen=SILENCE_LIMIT * rel)
    #Prepend audio from 0.5 seconds before noise was detected
    prev_audio = deque(maxlen=PREV_AUDIO * rel) 
    started = False
    n = num_phrases
    response = []

    while (num_phrases == -1 or n > 0):
        cur_data = stream.read(CHUNK)
        slid_win.append(math.sqrt(abs(audioop.avg(cur_data, 4))))
        if(sum([x > THRESHOLD for x in slid_win]) > 0):
            if(not started):
                #to_node("status", "Starting record of phrase")
                started = True
            audio2send.append(cur_data)
        elif (started is True):
            if(sum([x < THRESHOLD -200 for x in slid_win]) > 0):
                try:
                    # The limit was reached, finish capture and deliver.
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.connect((args.host_ip, args.host_port))
                    sent = ''.join(list(prev_audio) + audio2send)
                    sock.sendall(struct.pack('>i', len(sent)) + sent)
                    # Receive data from the server and shut down
                    received = sock.recv(1024)
                    to_node("result", "{}".format(received))
                    sock.close()
					         

                    # Remove temp file. Comment line to review.
                    #os.remove(filename)
                    # Reset all
	
                except:
                    to_node("status", "failed to send to ASR server")

                started = False
                slid_win = deque(maxlen=SILENCE_LIMIT * rel)
                prev_audio = deque(maxlen=PREV_AUDIO * rel) 
                audio2send = []
                n -= 1

            else:
                audio2send.append(cur_data)
        else:
            prev_audio.append(cur_data)

    to_node("status", "* Done recording")
    stream.close()
    p.terminate()

    return response


if(__name__ == '__main__'):
    listen_for_speech() 

