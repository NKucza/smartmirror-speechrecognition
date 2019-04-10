/**
 * @file smartmirror-speechrecongnition.js
 *
 * @author nkucza
 * @license MIT
 *
 * @see  https://github.com/NKucza/smartmirror-speechrecognition
 */

Module.register('smartmirror-speechrecognition', {

    /** @member {boolean} pulsing - Flag to indicate listening state. */
    aktive: false,
    /**
     */
    defaults: {
        debug : true
    },

    /**
     * @function start
     * @description Sets mode to initialising.
     * @override
     */
    start() {
        Log.info(`Starting module: ${this.name}`);
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
		if(this.aktive == true){
       		icon.classList.add('fa', 'fa-microphone', 'icon');
        	icon.classList.add('pulse');
		} else {
			icon.classList.add('fa', 'fa-microphone-slash', 'icon');
		}

        voice.appendChild(icon);

        const modeSpan = document.createElement('span');
        modeSpan.innerHTML = "  Speech recognition results";
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
        if (notification === 'SPEECH_REC_RESULT_EN') {
			this.debugInformation_en = payload;
			this.sendNotification("TRANSCRIPT_EN", payload);
		} else if (notification === 'SPEECH_REC_RESULT_GER') {
			this.debugInformation_ger = payload;
			this.sendNotification("TRANSCRIPT_DE", payload);
		} 
        this.updateDom(300);
    },

	notificationReceived: function(notification, payload, sender) {

		if (notification === 'SPEECHREC_AKTIV') {
			this.aktive = payload;
		}
		this.updateDom(0);
	}
});
