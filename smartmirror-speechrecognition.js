/**
 * @file MMM-voice.js
 *
 * @author fewieden
 * @license MIT
 *
 * @see  https://github.com/fewieden/MMM-voice
 */

/* global Module Log MM */

/**
 * @external Module
 * @see https://github.com/MichMich/MagicMirror/blob/master/js/module.js
 */

/**
 * @external Log
 * @see https://github.com/MichMich/MagicMirror/blob/master/js/logger.js
 */

/**
 * @external MM
 * @see https://github.com/MichMich/MagicMirror/blob/master/js/main.js
 */

/**
 * @module MMM-voice
 * @description Frontend for the module to display data.
 *
 * @requires external:Module
 * @requires external:Log
 * @requires external:MM
 */
Module.register('smartmirror-speechrecognition', {

    /** @member {string} icon - Microphone icon. */
    icon: 'fa-microphone-slash',
    /** @member {boolean} pulsing - Flag to indicate listening state. */
    pulsing: true,
    /** @member {boolean} help - Flag to switch between render help or not. */
    help: false,
    /**
     * @member {Object} defaults - Defines the default config values.
     * @property {int} timeout - Seconds to active listen for commands.
     * @property {string} keyword - Keyword to activate active listening.
     * @property {boolean} debug - Flag to enable debug information.
     */
    defaults: {
        timeout: 15,
        keyword: 'MAGIC MIRROR',
        debug: false,
		show_command_list: ["show", "display", "appear"],
		hide_command_list: ["remove", "hide"],
		module_list: [
			{name : "clock", words : ["clock","time"]}
		]
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
     * @function getTranslations
     * @description Translations for this module.
     * @override
     *
     * @returns {Object.<string, string>} Available translations for this module (key: language code, value: filepath).
     */
    getTranslations() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json',
            id: 'translations/id.json'
        };
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

        const modules = document.querySelectorAll('.module');
        for (let i = 0; i < modules.length; i += 1) {
            if (!modules[i].classList.contains(this.name)) {
                if (this.help) {
                    modules[i].classList.add(`${this.name}-blur`);
                } else {
                    modules[i].classList.remove(`${this.name}-blur`);
                }
            }
        }

       wrapper.appendChild(voice);

        return wrapper;
    },

    /**
     * @function notificationReceived
     * @description Handles incoming broadcasts from other modules or the MagicMirror core.
     * @override
     *
     * @param {string} notification - Notification name
     * @param {*} payload - Detailed payload of the notification.
     */
 /*   notificationReceived(notification, payload) {
        if (notification === 'DOM_OBJECTS_CREATED') {
            this.sendSocketNotification('START', { config: this.config, modules: this.modules });
        } else if (notification === 'REGISTER_VOICE_MODULE') {
            if (Object.prototype.hasOwnProperty.call(payload, 'mode') && Object.prototype.hasOwnProperty.call(payload, 'sentences')) {
                this.modules.push(payload);
            }
        }
    }, */

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
