Module.register('smartmirror-speechrecognition', {

    /** @member {string} icon - Microphone icon. */
    icon: 'fa-microphone-slash',
    /** @member {boolean} pulsing - Flag to indicate listening state. */
    pulsing: true,
    /**
     */
    defaults: {
        
    },

    /**
     * @function start
     * @description Sets mode to initialising.
     * @override
     */
    start() {
        Log.info(`Starting module: ${this.name}`);
        this.mode = this.translate('INIT');
        Log.info(`${this.name} is waiting for voice command registrations.`);
		this.sendSocketNotification('SPEECH_REC_START', this.config);
		this.debugInformation_en = "";
		this.debugInformation_ger = "";
    },

    /**
     * @function getStyles
     * @description Style dependencies for this module.
     * @override
     *
     * @returns {string[]} List of the style dependency filepaths.
     */
    getStyles() {
        return ['font-awesome.css', 'smartmirror-speechrecognition.css'];
    },

    /**
     * @function getDom
     * @description Creates the UI as DOM for displaying in MagicMirror application.
     * @override
     *
     * @returns {Element}
     */
    getDom() {
        const wrapper = document.createElement('div');
        const voice = document.createElement('div');
        voice.classList.add('small', 'align-right');

        const icon = document.createElement('i');
        icon.classList.add('fa', this.icon, 'icon');
        if (this.pulsing) {
            icon.classList.add('pulse');
        }
        voice.appendChild(icon);

        const modeSpan = document.createElement('span');
        modeSpan.innerHTML = " Speech recognition results";
        voice.appendChild(modeSpan);
        if (this.config.debug) {
            const debug_en = document.createElement('div');
            debug_en.innerHTML = this.debugInformation_en;
            voice.appendChild(debug_en);
			const debug_ger = document.createElement('div');
            debug_ger.innerHTML = this.debugInformation_ger;
            voice.appendChild(debug_ger);
        }

       wrapper.appendChild(voice);

        return wrapper;
    },

     /**
     * @function socketNotificationReceived
     * @description Handles incoming messages from node_helper.
     * @override
     *
     * @param {string} notification - Notification name
     * @param {*} payload - Detailed payload of the notification.
     */
    socketNotificationReceived(notification, payload) {
        if (notification === 'SPEECH_REC_READY') {
            this.icon = 'fa-microphone';
            this.mode = this.translate('NO_MODE');
            this.pulsing = false;
        } else if (notification === 'SPEECH_REC_RESULT_EN') {
			this.debugInformation_en = payload;
			this.sendNotification("TRANSCRIPT_EN", payload);
		} else if (notification === 'SPEECH_REC_RESULT_GER') {
			this.debugInformation_ger = payload;
			this.sendNotification("TRANSCRIPT_DE", payload);
		} 
        this.updateDom(300);
    }
});
