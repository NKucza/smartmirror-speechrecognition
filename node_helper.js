const NodeHelper = require('node_helper');
const {PythonShell} = require('python-shell');

module.exports = NodeHelper.create({

    /** @member {boolean} listening - Flag to indicate listen state. */
    listening: false,

    /** @member {(boolean|string)} mode - Contains active module mode. */
    mode: false,

    /** @member {boolean} hdmi - Flag to indicate hdmi output state. */
    hdmi: true,

    /** @member {boolean} help - Flag to toggle help modal. */
    help: false,

    /** @member {string[]} words - List of all words that are registered by the modules. */
    words: [],

    /**
     * @function start
     * @description Logs a start message to the console.
     * @override
     */
    start() {
        console.log(`Starting module helper: ${this.name}`);
    },

    start_deepspeech_python_script: function () {
		const self = this;
		console.log("[MSG " + self.name + "] " + " starting speech recognition");
		self.en_pyshell = new PythonShell('modules/' + this.name + '/pythonDeepSpeech/deepspeechclient.py', {pythonPath: 'python' });

    		self.en_pyshell.on('message', function (message_string) {
		try{	
			var message = JSON.parse(message_string)
			//console.log("[MSG " + self.name + "] " + message);
      			if (message.hasOwnProperty('status')){
      				console.log("[" + self.name + "] " + message.status);
      			}
			if (message.hasOwnProperty('result')){
				self.sendSocketNotification('SPEECH_REC_RESULT_EN', message.result);
      			}
		}
		catch(err) {
			console.log("[" + self.name + "] not a jason answer");
		}
    		});

	/**	self.ger_pyshell = new PythonShell('modules/' + this.name + '/pythonDeepSpeech/deepspeechclient.py', { mode: 'json', args : ["--host_port=8087"]});

		self.ger_pyshell.on('message', function (message) {
			//console.log("[MSG " + self.name + "] " + message);
      			if (message.hasOwnProperty('status')){
      				console.log("[" + self.name + "] " + message.status);
      			}
			if (message.hasOwnProperty('result')){
				self.sendSocketNotification('SPEECH_REC_RESULT_GER', message.result);
      			}
    		}); */
	},

	 /**
     * @function socketNotificationReceived
     * @description Receives socket notifications from the module.
     * @override
     *
     * @param {string} notification - Notification name
     * @param {*} payload - Detailed payload of the notification.
     */
    socketNotificationReceived(notification, payload) {
		const self = this;
        if (notification === 'SPEECH_REC_START') {
            /** @member {Object} config - Module config. */
            this.config = payload;
			this.start_deepspeech_python_script();
			console.log("[MSG " + self.name + "] " + " started");
        }
    },

	stop: function() {
		const self = this;
		self.en_pyshell.childProcess.kill('SIGKILL');
		self.en_pyshell.end(function (err) {
           	if (err){
        		//throw err;
    		};
    		console.log('finished');
		});
	}
});
