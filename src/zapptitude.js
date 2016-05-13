;var zapptitude = (function (){

    //region Constants

    //region Index constants

    var POSITIVE_INDEX = 100000000;
    var RANDOM_LENGTH_INDEX = 900000000000000000;
    var MILLISECONDS_INDEX = 1000;

    var READY_STATE_INDEX = 4;

    var FIRST_INDEX = 0;

    //endregion

    //region ZEvents constants

    var Z_START_SESSION_KEY = "start_session";
    var Z_EVENT_KEY = "ZEvent";
    var Z_BEGIN_TASK_KEY = "ZBeginTask";
    var Z_SOLVE_TASK_KEY = "ZSolveTask";

    //endregion

    //region Hash keys constants

    var EVENT_KEY = "event";
    var TASK_KEY = "task";
    var CONTEXT_KEY = "contex";
    var TYPE_KEY = "type";
    var EXPECTED_KEY = "expected";
    var TOPICS_KEY = "topics";
    var ACTUAL_KEY = "actual";
    var AMONG_KEY = "among";
    var BINARY_KEY = "binary";
    var INT_KEY = "int";
    var FLOAT_KEY = "float";
    var MC_KEY = "mc";
    var GRAD_KEY = "grad";

    var ZID_KEY = "zid";
    var ZID_SESSION = "session";
    var ZID_DURATION = "duration";
    var ZID_TIME = "time";

    var APP_NAME_KEY = "appName";
    var APP_VERSION_KEY = "appVersion";
    var APP_IDENTIFIER_KEY = "appIdentifier";
    var APP_ID_KEY = "appId";
    var SESSION_ID_KEY = "sessionId";

    var ITEMS_KEY = "items";
    var DEVICE_KEY = "device";
    var APPLICATION_KEY = "application";
    var TIMESTAMP_KEY = "timestamp";
    var LATITUDE_KEY = "lat";
    var LONGITUDE_KEY = "long";
    var BROWSER_TYPE_KEY = "browserType";
    var RESOLUTION_KEY = "resolution";

    var PLATFORM_KEY = "platform";
    var PACKAGE_NAME_KEY = "packageName";
    var NAME_KEY = "name";
    var VERSION_KEY = "version";
    var REGION_KEY = "region";

    var OPERA_NAME = "Opera";
    var CHROME_NAME = "Chrome";
    var SAFARI_NAME = "Safari";
    var FIREFOX_NAME = "Firefox";
    var MSIE_USER_AGENT = "MSIE";
    var IE_NAME = "IE";


    //endregion

    //region URL constants

    var Z_URL_PART = "https://zapptitude-dev.herokuapp.com/api";
    // var Z_URL_PART = "https://test.zapptitude.com/api";

    var REQUEST_GET_TYPE = "GET";
    var REQUEST_POST_TYPE = "POST";

    var URL_CHECK_PART =  "/" + "check" + "/";
    var URL_EVENTS_PART =  "/" + "events" + "/";

    //endregion

    var NO_ZAPP_ID_ERROR = "zapp id was not entered"
    var CONNECTION_PROBLEM_ERROR = "Ooops! Seems like some problem appeared..";
    var NO_USER_ERROR = "Sorry, no such user!";

    //region Other constants

    var REGULAR_EXPRESSION = "[^a-zA-Z0-9.-]";
    var REPLACEMENT = "_";

    var UNKNOWN_APP_TEXT = "unknownApp";

    var SESSION_INDEX = "Z--";

    var CONNECTED_TEXT = "connected";
    var DISCONNECTED_TEXT = "disconnected";

    var NOT_AVAILABLE = "n/a";
    var UNKNOWN_TEXT = "unknown";

    //endregion

    //endregion

    //region ZappInternal

    function ZappInternal() {
        if (ZappInternal.instance) {
            return ZappInternal.instance;
        }

        //region Properties

        this.sessionId = randomId();
        var zappId = "";
        var taskName = "";
        var contextName = "";
        var sessionStartTime = new Date().getTime();
        var taskStartTime = 0;
        var isUserDefinedZapp = false;

        //endregion

        //region General functions

        this.replaceAll = function(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        };

        this.sessionInfo = function() {
            var result = {};

            result[ZID_KEY] = localStorage.getItem(ZID_KEY) || zappId;
            result[ZID_SESSION] = localStorage.getItem(SESSION_ID_KEY);
            result[ZID_TIME] = ((new Date().getTime() - sessionStartTime) / MILLISECONDS_INDEX).toFixed(3).toString();

            return result;
        };

        this.sessionInfoForTask = function(task, context) {
            var result = {};

            result[ZID_KEY] = localStorage.getItem(ZID_KEY) || zappId;
            result[ZID_SESSION] = localStorage.getItem(SESSION_ID_KEY);
            result[ZID_DURATION] = this.taskDuration(task, context).toFixed(3).toString();
            result[ZID_TIME] = ((new Date().getTime() - sessionStartTime) / MILLISECONDS_INDEX).toFixed(3).toString();

            return result;
        };

        this.taskDuration = function(task, context) {
            if (taskStartTime <= 0) {
                return -1;
            }
            if ((taskName || task) && !taskName.equals(task)) {
                return -1;
            }
            if ((contextName || context) && !contextName.equals(context)) {
                return -1;
            }
            return new Date().getTime() - taskStartTime;
        }

        this.requestZappId = function() {
            zappView.showZappDialog(isUserDefinedZapp ? this.zappId : null);
        };

        this.setZappId = function(zappId) {
            if (!zappId) {

                if (!isUserDefinedZapp) {
                    return;
                }

                this.zappId = randomId();
                isUserDefinedZapp = false;

            } else if (zappId.localeCompare(this.zappId) === 0) {
                return;
            } else {
                this.zappId = zappId;
                isUserDefinedZapp = true;
                localStorage.setItem(ZID_KEY, zappId);
            }
        };

        this.checkZappId = function(zappId) {
            var url = Z_URL_PART + URL_CHECK_PART + zappId;
            zappConnectionService.getData(url);
        };

        this.userProviderZappId = function() {
            var zappId = localStorage.getItem(ZID_KEY);
            if (!zappId)
                return NO_ZAPP_ID_ERROR;
            return zappId;
        };

        //endregion

        //region Internal function

        function randomId() {
            return SESSION_INDEX + Math.floor(POSITIVE_INDEX + Math.random() * RANDOM_LENGTH_INDEX);
        }

        function setTask(task, context) {
            taskStartTime = new Date().getTime();

            if (task) {
                taskName = null;
            } else {
                taskName = new String(task);
            }
            if (context) {
                contextName = null;
            } else {
                contextName = new String(context);
            }
        }

        //endregion

        return ZappInternal.instance = this;
    }

    var zappInternal = new ZappInternal;

    //endregion

    //region ZappEventManager

    function ZappEventManager() {
        if (ZappEventManager.instance) {
            return ZappEventManager.instance;
        }

        //region General functions

        this.logEvent = function(event, info) {

            info[EVENT_KEY] = event;

            zappEventLogger.logEvent(Z_EVENT_KEY, info);
        };

        this.logBeginTask = function(task, context, info) {

            info[TASK_KEY] = task;
            info[CONTEXT_KEY] = context;

            zappEventLogger.logEvent(Z_BEGIN_TASK_KEY, info);
        };

        this.logSolveTask = function(type, task, context, topics, expected, actual, among, info) {

            info[TYPE_KEY] = type;
            info[EXPECTED_KEY] = expected;
            info[ACTUAL_KEY] = actual;
            info[TASK_KEY] = task;
            info[CONTEXT_KEY] = context;
            info[TOPICS_KEY] = topics;
            if (among !== undefined) {
                info[AMONG_KEY] = among;
            }
            zappEventLogger.logEvent(Z_SOLVE_TASK_KEY, info);
        };

        this.logSolveBinaryTask = function(task, context, topics, expected, actual, info) {
            this.logSolveTask(BINARY_KEY, task, context, topics, expected, actual, undefined, info)
        };

        this.logSolveIntTask = function(task, context, topics, expected, actual, info) {
            this.logSolveTask(INT_KEY, task, context, topics, expected, actual, undefined, info)
        };

        this.logSolveFloatTask = function(task, context, topics, expected, actual, info) {
            this.logSolveTask(FLOAT_KEY, task, context, topics, expected, actual, undefined, info)
        };

        this.logSolveMCTask = function(task, context, topics, expected, actual, among, info) {
            this.logSolveTask(MC_KEY, task, context, topics, expected, actual, among, info)
        };

        this.logSolveGradTask = function(task, context, topics, expected, actual, among, info) {
            this.logSolveTask(GRAD_KEY, task, context, topics, expected, actual, among, info)
        };

        //endregion

        return ZappEventManager.instance = this;
    }

    var zappEventManager = new ZappEventManager;

    //endregion

    //region ZappEventLogger

    function ZappEventLogger() {
        if (ZappEventLogger.instance) {
            return ZappEventLogger.instance;
        }

        //region General functions

        this.loggerWithAppID = function(appId) {

            if(!appIdIsValid(appId))
                return;

            var sessionId = generateSessionId(appId);
            localStorage.setItem(APP_ID_KEY, appId)
            localStorage.setItem(SESSION_ID_KEY, sessionId);
            
            this.logEvent(Z_START_SESSION_KEY);
        }

        this.logEvent = function(eventType, data) {
            var event = new Event(eventType, zappInfoCollector.location(), zappInfoCollector.connectionState(), data);
            var requestData = new RequestData(event, zappInfoCollector.browserInfo(), zappInfoCollector.appInfo());

            var url = Z_URL_PART + URL_EVENTS_PART + localStorage.getItem(APP_ID_KEY);

            zappConnectionService.postData(url, getQueryString(getJsonList(requestData)));
        };

        //endregion

        //region Internal functions

        function appIdIsValid(appId) {
            return (appId);
        }

        function generateSessionId(appId) {
            var timeInMilliseconds = (new Date()).getTime();
            text = String.valueOf(timeInMilliseconds);

            var hash = cryptoHelper.HMAC_SHA256_MAC(text, appId);

            return hash;
        }

        function Event(eventType, location, connectionState, payload) {
            this.name = eventType;
            this.session = localStorage.getItem(SESSION_ID_KEY);
            this.timeStamp = new Date().getTime();
            this.location = location;
            this.payload = payload;
            this.connection_state = connectionState;
        }

        function RequestData(event, browserInfo, appInfo) {
            this.event = {event};
            this.browserInfo = browserInfo;
            this.appInfo = appInfo;
            this.timeStamp = new Date().getTime();
        }

        function getJsonList(requestData) {
            var pairs = {};
            pairs[ITEMS_KEY] = JSON.stringify([requestData.event.event]);
            pairs[DEVICE_KEY] = JSON.stringify(requestData.browserInfo);
            pairs[APPLICATION_KEY] = JSON.stringify(requestData.appInfo);
            pairs[TIMESTAMP_KEY] = JSON.stringify(requestData.timeStamp);
            return pairs;
        }

        function getQueryString(pairs) {
            var str = [];
            for(var p in pairs)
                str.push(p + "=" + encodeURIComponent(pairs[p]));
            return str.join("&");
        }

        //endregion

        return ZappEventLogger.instance = this;
    }

    var zappEventLogger = new ZappEventLogger;

    //endregion

    //region ZappInfoCollector

    function ZappInfoCollector() {
        if (ZappInfoCollector.instance) {
            return ZappInfoCollector.instance;
        }

        //region General functions

        this.location = function() {
            var result = {};
            result[LATITUDE_KEY] = zappLocationManager.latitude;
            result[LONGITUDE_KEY] = zappLocationManager.longitude;
            return result;
        };

        this.connectionState = function() {
            return navigator.onLine ? CONNECTED_TEXT : DISCONNECTED_TEXT;
        };

        this.browserInfo = function() {
            var result = {};
            result[BROWSER_TYPE_KEY] = getBrowserType();
            result[RESOLUTION_KEY] = getBrowserResolution();
            return result;
        };

        this.appInfo = function() {
            var result = {};
            result[PLATFORM_KEY] = navigator.platform;
            result[PACKAGE_NAME_KEY] = localStorage.getItem(APP_IDENTIFIER_KEY);
            result[NAME_KEY] = localStorage.getItem(APP_NAME_KEY);
            result[VERSION_KEY] = localStorage.getItem(APP_VERSION_KEY);
            result[REGION_KEY] = window.navigator.userLanguage || window.navigator.language;
            return result;
        };

        //endregion

        //region Internal functions

        function getBrowserResolution() {
            if (window.document.getElementsByTagName('body').length === 0)
                return NOT_AVAILABLE;
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[FIRST_INDEX],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight|| e.clientHeight|| g.clientHeight;
            return x + ' × ' + y;
        }

        function getBrowserType() {
            if((navigator.userAgent.indexOf(OPERA_NAME) || navigator.userAgent.indexOf('OPR')) != -1)
                return OPERA_NAME;
            if(navigator.userAgent.indexOf(CHROME_NAME) != -1)
                return CHROME_NAME;
            if(navigator.userAgent.indexOf(SAFARI_NAME) != -1)
                return SAFARI_NAME;
            if(navigator.userAgent.indexOf(FIREFOX_NAME) != -1)
                return FIREFOX_NAME;
            if((navigator.userAgent.indexOf(MSIE_USER_AGENT) != -1 ) || (!!document.documentMode == true )) //IF IE > 10
                return IE_NAME;
             return UNKNOWN_TEXT;
        }

        //endregion

        return ZappInfoCollector.instance = this;
    }

    var zappInfoCollector = new ZappInfoCollector;

    //endregion

    //region ZappConnectionService

    function ZappConnectionService() {
        if (ZappConnectionService.instance) {
            return ZappConnectionService.instance;
        }

        //region General functions

        this.postData=function(URL, jsonData) {

            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open(REQUEST_POST_TYPE, URL, true);
            xmlHttp.setRequestHeader("content-type", "application/x-www-form-urlencoded");

            xmlHttp.onreadystatechange = function() {
                if (this.readyState === READY_STATE_INDEX) {
                    var response = JSON.parse(this.responseText);
                    if (!response.status)
                        alert(CONNECTION_PROBLEM_ERROR);
                }
            };

            xmlHttp.send(jsonData);
        };

        this.getData=function(URL) {

            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open(REQUEST_GET_TYPE, URL, true);

            xmlHttp.onreadystatechange = function() {

                if (this.readyState === READY_STATE_INDEX) {
                    var response = JSON.parse(this.responseText);
                    if (response.status && response.result.length > 0) {
                        zappInternal.setZappId(response.result[FIRST_INDEX]);
                    }
                    else
                        alert(NO_USER_ERROR);
                }
            };

            xmlHttp.send(null);
        };

        //endregion

        return ZappConnectionService.instance = this;
    }

    var zappConnectionService = new ZappConnectionService;

    //endregion

    //region ZappLocationManager

    function ZappLocationManager() {
        if (ZappLocationManager.instance) {
            return ZappLocationManager.instance;
        }

        //region Properties

        this.latitude = NOT_AVAILABLE;
        this.longitude = NOT_AVAILABLE;

        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        //endregion

        //region Internal functions

        function success(pos) {
            var crd = pos.coords;
            latitude = crd.latitude
            longitude = crd.longitude
        };

        function error(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
        };

        navigator.geolocation.getCurrentPosition(success, error, options);

        //endregion

        return ZappLocationManager.instance = this;
    }

    var zappLocationManager = new ZappLocationManager;

    //endregion

    //region ZappView
    
    function ZappView() {
        if (ZappView.instance) {
            return ZappView.instance;
        }

        //region ZappIdDialog

        this.showZappDialog = function(zappId) {

            var div = document.createElement('div');

            div.innerHTML =
                '<style>' +
                    '#overlay{ ' +
                        'display: none; ' +
                        'opacity: .8; ' +
                        'position: fixed; ' +
                        'top: 0px; ' +
                        'left: 0px; ' +
                        'background: #FFF; ' +
                        'width: 100%;' +
                        'z-index: 10; ' +
                    '}' +

                    '#zappIdDialog{ display: none; ' +
                        'position: fixed; ' +
                        'width: 550px; ' +
                        'box-sizing: border-box; ' +
                        'border: 5px solid #3c0f93; ' +
                        'border-radius: 8px; ' +
                        'background: #f8eed6 no-repeat; ' +
                        'z-index: 10; ' +
                    '}' +

                    '#zappIdDialog > div{ margin:8px; }' +
                    '#zappIdDialog > div > #zappIdDialogHead{ padding-left:16px; padding-right:16px; text-align:center; }' +
                    '#zappIdDialog > div > #zappIdDialogBody{ padding:16px; text-align:center; }' +
                    '#zappIdDialog > div > #zappIdDialogFoot{ text-align: center; width: 100% }' +

                    '#zappInfoDialog{' +
                        'display: none;' +
                        'position: fixed;' +
                        'width: 550px;' +
                        'box-sizing: border-box;' +
                        'border: 5px solid #3c0f93;' +
                        'border-radius: 8px;' +
                        'background: #FFF no-repeat;' +
                        'z-index: 10; ' +
                    '}' +

                    '#zappInfoDialog > div{ margin:8px; }' +
                    '#zappInfoDialog > div > #zappInfoDialogHead{ padding-left:16px; padding-right:16px; text-align:center; }' +
                    '#zappInfoDialog > div > #zappInfoDialogBody{ padding:16px; text-align:justify; }' +
                    '#zappInfoDialog > div > #zappInfoDialogFoot{ text-align: center; width: 100% }' +

                    '#zappCancelButton{ color: deepskyblue; display:inline; font-family: Arial, Helvetica, sans-serif; }' +
                    '#zappInfoDialogTitle{ color: red; display:inline; font-family: Arial, Helvetica, sans-serif; }' +
                    '#zappInfoDialogText{ font-family: Arial, Helvetica, sans-serif; }' +

                    '.zappButton {' +
                        'border: none;' +
                        'background-color: transparent;' +
                        'outline: none;' +
                    '}' +

                    '.zappButton:focus {' +
                        'border: none;' +
                    '}' +

                    '.zappInput {' +
                        'width: 100%;' +
                        'box-sizing: border-box;' +
                        'border: 3px solid #3c0f93;' +
                        'border-radius: 8px;' +
                        'font-size: 20px;' +
                        'background: white no-repeat 10px 10px;' +
                        'padding: 12px 20px 12px 20px;' +
                    '}' +

                    '.zappInput:focus {' +
                        'outline: none;' +
                    '}' +
                '</style>' +
                '<div id="zappIdOverlay"></div>' +

                    '<div id="zappIdDialog">' +
                        '<div>' +
                            '<div id="zappIdDialogHead">' +
                                '<img src="images/welcome_back.png" width="70%">' +
                                '<img src="images/z_sign.png" width="13%">' +
                            '</div>' +
                        '<div id="zappIdDialogBody"></div>' +
                        '<div id="zappIdDialogFoot"></div>' +
                    '</div>' +
                '</div>' +

                '<div id="zappInfoDialog">' +
                    '<div>' +
                        '<div id="zappInfoDialogHead"></div>' +
                        '<div id="zappInfoDialogBody"></div>' +
                    '</div>' +
                '</div>';

            // TODO: check this
            if (document.getElementsByTagName('body').length === 0)
                return;
            document.getElementsByTagName('body')[FIRST_INDEX].appendChild(div);
            zappIdDialog.show(zappId);
        };

        function ZappIdDialog(){
            this.show = function(zappId){
                var winW = window.innerWidth;
                var winH = window.innerHeight;
                var zappIdOverlay = document.getElementById('zappIdOverlay');
                var dialog = document.getElementById('zappIdDialog');
                zappIdOverlay.style.display = "block";
                zappIdOverlay.style.height = winH+"px";
                dialog.style.left = (winW/2) - (550 * .5)+"px";
                dialog.style.top = "100px";
                dialog.style.display = "block";
                document.getElementById('zappIdDialogBody').innerHTML = '<br><input class="zappInput" id="zappIdInput" width="300px">';
                document.getElementById('zappIdDialogFoot').innerHTML =
                    '<button id="zappAnonymousButton" class="zappButton"><img src="images/anonymous_black.png" width="50px" height="50px"></button>' +
                    '<button id="zappInfoButton" class="zappButton" style="padding-left: 80px; padding-right: 80px;"><img src="images/question.png" width="50px" height="50px"></button>' +
                    '<button id="zappOkButton" class="zappButton"><img src="images/ok.png" width="50px" height="50px"></button>';
                zappAnonymousButton = document.getElementById('zappAnonymousButton');
                zappAnonymousButton.addEventListener ("DOMActivate", onActivate_zappAnonymousButton, false);

                zappInfoButton = document.getElementById('zappInfoButton');
                zappInfoButton.addEventListener ("DOMActivate", onActivate_zappInfoButton, false);

                zappOkButton = document.getElementById('zappOkButton');
                zappOkButton.addEventListener ("DOMActivate", onActivate_zappOkButton, false);

                zappIdInput = document.getElementById('zappIdInput');
                zappIdInput.focus();
                if (zappId)
                    zappIdInput.value = zappId;
            };

            function onActivate_zappAnonymousButton(){
                document.getElementById('zappIdInput').value = "anonymous";
            }

            function onActivate_zappInfoButton(){
                zappInfoDialog.show()
            }

            function onActivate_zappOkButton(){
                var zappId = document.getElementById('zappIdInput').value;
                document.getElementById('zappIdDialog').style.display = "none";
                document.getElementById('zappIdOverlay').style.display = "none";
                if (zappId === "anonymous") {
                    zappInternal.setZappId("");
                    return;
                }
                if (zappId)
                    zappInternal.checkZappId(zappId);
            }
        }

        var zappIdDialog = new ZappIdDialog();

        //endregion

        //region ZappInfoDialog

        function ZappInfoDialog(){
            this.show = function(){
                var winW = window.innerWidth;
                var dialog = document.getElementById('zappInfoDialog');
                dialog.style.left = (winW/2) - (550 * .5)+"px";
                dialog.style.top = "100px";
                dialog.style.display = "block";
                document.getElementById('zappInfoDialogHead').innerHTML =
                    '<div id="zappInfoDialogTitle">' +
                        'What is Zid?' +
                    '</div>' +
                    '<button id="zappCancelButton" class="zappButton">' +
                        '<div id="zappCancelButton">' +
                            'Close' +
                        '</div>' +
                    '</button>' +
                    '<br>';
                document.getElementById('zappInfoDialogBody').innerHTML =
                    '<div id="zappInfoDialogText">' + "This " + localStorage.getItem(APP_NAME_KEY) + " app uses Zapptitude to save some activity crumbs while you are interacting with the app." +
                    "This information can be used by the app developer to better understand how users interact with the app, and improve user experience with the app." + '<br><br>' +
                    "The same information can be compiled into valuable reports for you, the user, assuming you can be linked to your activity crumbs." +
                    "This is the purpose of the Zapptitude ID, or Zid. It can be any alias name of your choosing. It does not need to contain a real name." +
                    "It is case sensitive (lower and upper case matters) and should be complex enough to reduce the chances that another user picks the same Zid." + '<br><br>' +
                    "As an added security measure, only an encrypted form of your Zid is ever stored along with your activity crumbs." +
                    "So, even if you provide personally identifiable data in your Zid, the activity crumbs can never be linked back to you." + '<br><br>' +
                    "If you don’t wish to get a personalized user report of your activity you can select an empty Zid or click to remain anonymous." +
                    "Note that your activity crumbs are still saved for the purpose of helping the app developer." + '<br><br>' +
                    "Finally, by clicking, you agree to the above mentioned data collection." + '</div>';

                zappCancelButton = document.getElementById('zappCancelButton');
                zappCancelButton.addEventListener ("DOMActivate", onActivate_zappCancelButton, false);
            };

            function onActivate_zappCancelButton(){
                document.getElementById('zappInfoDialog').style.display = "none";
            }
        }

        var zappInfoDialog = new ZappInfoDialog();

        //endregion

        return ZappView.instance = this;
    }

    var zappView = new ZappView;
    
    //endregion

    //region CryptoHelper

    function CryptoHelper() {
        if (CryptoHelper.instance) {
            return CryptoHelper.instance;
        }

        /*
         *  jssha256 version 0.1  -  Copyright 2006 B. Poettering
         *
         *  This program is free software; you can redistribute it and/or
         *  modify it under the terms of the GNU General Public License as
         *  published by the Free Software Foundation; either version 2 of the
         *  License, or (at your option) any later version.
         *
         *  This program is distributed in the hope that it will be useful,
         *  but WITHOUT ANY WARRANTY; without even the implied warranty of
         *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
         *  General Public License for more details.
         *
         *  You should have received a copy of the GNU General Public License
         *  along with this program; if not, write to the Free Software
         *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
         *  02111-1307 USA
         */

        /*
         * http://point-at-infinity.org/jssha256/
         *
         * This is a JavaScript implementation of the SHA256 secure hash function
         * and the HMAC-SHA256 message authentication code (MAC).
         *
         * The routines' well-functioning has been verified with the test vectors
         * given in FIPS-180-2, Appendix B and IETF RFC 4231. The HMAC algorithm
         * conforms to IETF RFC 2104.
         *
         * The following code example computes the hash value of the string "abc".
         *
         *    SHA256_init();
         *    SHA256_write("abc");
         *    digest = SHA256_finalize();
         *    digest_hex = array_to_hex_string(digest);
         *
         * Get the same result by calling the shortcut function SHA256_hash:
         *
         *    digest_hex = SHA256_hash("abc");
         *
         * In the following example the calculation of the HMAC of the string "abc"
         * using the key "secret key" is shown:
         *
         *    HMAC_SHA256_init("secret key");
         *    HMAC_SHA256_write("abc");
         *    mac = HMAC_SHA256_finalize();
         *    mac_hex = array_to_hex_string(mac);
         *
         * Again, the same can be done more conveniently:
         *
         *    mac_hex = HMAC_SHA256_MAC("secret key", "abc");
         *
         * Note that the internal state of the hash function is held in global
         * variables. Therefore one hash value calculation has to be completed
         * before the next is begun. The same applies the the HMAC routines.
         *
         * Report bugs to: jssha256 AT point-at-infinity.org
         *
         */

        /******************************************************************************/

        /* Two all purpose helper functions follow */

        /* string_to_array: convert a string to a character (byte) array */

        function string_to_array(str) {
            var len = str.length;
            var res = new Array(len);
            for(var i = 0; i < len; i++)
                res[i] = str.charCodeAt(i);
            return res;
        }

        /* array_to_hex_string: convert a byte array to a hexadecimal string */

        function array_to_hex_string(ary) {
            var res = "";
            for(var i = 0; i < ary.length; i++)
                res += SHA256_hexchars[ary[i] >> 4] + SHA256_hexchars[ary[i] & 0x0f];
            return res;
        }

        /******************************************************************************/

        /* The following are the SHA256 routines */

        /*
         SHA256_init: initialize the internal state of the hash function. Call this
         function before calling the SHA256_write function.
         */

        function SHA256_init() {
            SHA256_H = new Array(0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
                0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19);
            SHA256_buf = new Array();
            SHA256_len = 0;
        }

        /*
         SHA256_write: add a message fragment to the hash function's internal state.
         'msg' may be given as string or as byte array and may have arbitrary length.

         */

        function SHA256_write(msg) {
            if (typeof(msg) == "string")
                SHA256_buf = SHA256_buf.concat(string_to_array(msg));
            else
                SHA256_buf = SHA256_buf.concat(msg);
            for(var i = 0; i + 64 <= SHA256_buf.length; i += 64)
                SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf.slice(i, i + 64));
            SHA256_buf = SHA256_buf.slice(i);
            SHA256_len += msg.length;
        }

        /*
         SHA256_finalize: finalize the hash value calculation. Call this function
         after the last call to SHA256_write. An array of 32 bytes (= 256 bits)
         is returned.
         */

        function SHA256_finalize() {
            SHA256_buf[SHA256_buf.length] = 0x80;

            if (SHA256_buf.length > 64 - 8) {
                for(var i = SHA256_buf.length; i < 64; i++)
                    SHA256_buf[i] = 0;
                SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf);
                SHA256_buf.length = 0;
            }

            for(var i = SHA256_buf.length; i < 64 - 5; i++)
                SHA256_buf[i] = 0;
            SHA256_buf[59] = (SHA256_len >>> 29) & 0xff;
            SHA256_buf[60] = (SHA256_len >>> 21) & 0xff;
            SHA256_buf[61] = (SHA256_len >>> 13) & 0xff;
            SHA256_buf[62] = (SHA256_len >>> 5) & 0xff;
            SHA256_buf[63] = (SHA256_len << 3) & 0xff;
            SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf);

            var res = new Array(32);
            for(var i = 0; i < 8; i++) {
                res[4 * i + 0] = SHA256_H[i] >>> 24;
                res[4 * i + 1] = (SHA256_H[i] >> 16) & 0xff;
                res[4 * i + 2] = (SHA256_H[i] >> 8) & 0xff;
                res[4 * i + 3] = SHA256_H[i] & 0xff;
            }

            delete SHA256_H;
            delete SHA256_buf;
            delete SHA256_len;
            return res;
        }

        /*
         SHA256_hash: calculate the hash value of the string or byte array 'msg'
         and return it as hexadecimal string. This shortcut function may be more
         convenient than calling SHA256_init, SHA256_write, SHA256_finalize
         and array_to_hex_string explicitly.
         */

        function SHA256_hash(msg) {
            var res;
            SHA256_init();
            SHA256_write(msg);
            res = SHA256_finalize();
            return array_to_hex_string(res);
        }

        /******************************************************************************/

        /* The following are the HMAC-SHA256 routines */

        /*
         HMAC_SHA256_init: initialize the MAC's internal state. The MAC key 'key'
         may be given as string or as byte array and may have arbitrary length.
         */

        function HMAC_SHA256_init(key) {
            if (typeof(key) == "string")
                HMAC_SHA256_key = string_to_array(key);
            else
                HMAC_SHA256_key = new Array().concat(key);

            if (HMAC_SHA256_key.length > 64) {
                SHA256_init();
                SHA256_write(HMAC_SHA256_key);
                HMAC_SHA256_key = SHA256_finalize();
            }

            for(var i = HMAC_SHA256_key.length; i < 64; i++)
                HMAC_SHA256_key[i] = 0;
            for(var i = 0; i < 64; i++)
                HMAC_SHA256_key[i] ^=  0x36;
            SHA256_init();
            SHA256_write(HMAC_SHA256_key);
        }

        /*
         HMAC_SHA256_write: process a message fragment. 'msg' may be given as
         string or as byte array and may have arbitrary length.
         */

        function HMAC_SHA256_write(msg) {
            SHA256_write(msg);
        }

        /*
         HMAC_SHA256_finalize: finalize the HMAC calculation. An array of 32 bytes
         (= 256 bits) is returned.
         */

        function HMAC_SHA256_finalize() {
            var md = SHA256_finalize();
            for(var i = 0; i < 64; i++)
                HMAC_SHA256_key[i] ^= 0x36 ^ 0x5c;
            SHA256_init();
            SHA256_write(HMAC_SHA256_key);
            SHA256_write(md);
            for(var i = 0; i < 64; i++)
                HMAC_SHA256_key[i] = 0;
            delete HMAC_SHA256_key;
            return SHA256_finalize();
        }

        /*
         HMAC_SHA256_MAC: calculate the HMAC value of message 'msg' under key 'key'
         (both may be of type string or byte array); return the MAC as hexadecimal
         string. This shortcut function may be more convenient than calling
         HMAC_SHA256_init, HMAC_SHA256_write, HMAC_SHA256_finalize and
         array_to_hex_string explicitly.
         */

        this.HMAC_SHA256_MAC = function(key, msg) {
            var res;
            HMAC_SHA256_init(key);
            HMAC_SHA256_write(msg);
            res = HMAC_SHA256_finalize();
            return array_to_hex_string(res);
        };

        /******************************************************************************/

        /* The following lookup tables and functions are for internal use only! */

        SHA256_hexchars = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f');

        SHA256_K = new Array(
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
            0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
            0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
            0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
            0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
            0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
            0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
            0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
            0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        );

        function SHA256_sigma0(x) {
            return ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        }

        function SHA256_sigma1(x) {
            return ((x >>> 17) | (x << 15)) ^ ((x >>> 19) | (x << 13)) ^ (x >>> 10);
        }

        function SHA256_Sigma0(x) {
            return ((x >>> 2) | (x << 30)) ^ ((x >>> 13) | (x << 19)) ^
                ((x >>> 22) | (x << 10));
        }

        function SHA256_Sigma1(x) {
            return ((x >>> 6) | (x << 26)) ^ ((x >>> 11) | (x << 21)) ^
                ((x >>> 25) | (x << 7));
        }

        function SHA256_Ch(x, y, z) {
            return z ^ (x & (y ^ z));
        }

        function SHA256_Maj(x, y, z) {
            return (x & y) ^ (z & (x ^ y));
        }

        function SHA256_Hash_Word_Block(H, W) {
            for(var i = 16; i < 64; i++)
                W[i] = (SHA256_sigma1(W[i - 2]) +  W[i - 7] +
                    SHA256_sigma0(W[i - 15]) + W[i - 16]) & 0xffffffff;
            var state = new Array().concat(H);
            for(var i = 0; i < 64; i++) {
                var T1 = state[7] + SHA256_Sigma1(state[4]) +
                    SHA256_Ch(state[4], state[5], state[6]) + SHA256_K[i] + W[i];
                var T2 = SHA256_Sigma0(state[0]) + SHA256_Maj(state[0], state[1], state[2]);
                state.pop();
                state.unshift((T1 + T2) & 0xffffffff);
                state[4] = (state[4] + T1) & 0xffffffff;
            }
            for(var i = 0; i < 8; i++)
                H[i] = (H[i] + state[i]) & 0xffffffff;
        }

        function SHA256_Hash_Byte_Block(H, w) {
            var W = new Array(16);
            for(var i = 0; i < 16; i++)
                W[i] = w[4 * i + 0] << 24 | w[4 * i + 1] << 16 |
                    w[4 * i + 2] << 8 | w[4 * i + 3];
            SHA256_Hash_Word_Block(H, W);
        }

    }

    var cryptoHelper = new CryptoHelper;

    //endregion

    return {

        initAppInfo: function(appName, appId, appVersion) {

            localStorage.setItem(APP_NAME_KEY, appName);
            localStorage.setItem(APP_IDENTIFIER_KEY, appId);
            localStorage.setItem(APP_VERSION_KEY, appVersion);
            var cleanedAppId = zappInternal.replaceAll((appId && appVersion) ? appId : UNKNOWN_APP_TEXT, REGULAR_EXPRESSION, REPLACEMENT);
            zappEventLogger.loggerWithAppID(cleanedAppId);
        },

        requestZappId: function() {
            zappInternal.requestZappId();
        },

        setZappId: function(zappId) {
            zappInternal.setZappId(zappId);
        },

        userProviderZappId: function() {
            return zappInternal.userProviderZappId();
        },

        logEvent: function(event) {
            zappEventManager.logEvent(event, zappInternal.sessionInfo());
        },

        logBeginTask: function(task, context) {
            zappEventManager.logBeginTask(task, context, zappInternal.sessionInfo());
        },

        logSolveBinaryTask: function(task, context, topics, expected, actual) {
            zappEventManager.logSolveBinaryTask(task, context, topics, expected, actual, zappInternal.sessionInfoForTask(task, context));
        },

        logSolveIntTask: function(task, context, topics, expected, actual) {
            zappEventManager.logSolveIntTask(task, context, topics, expected, actual, zappInternal.sessionInfoForTask(task, context));
        },

        logSolveFloatTask: function(task, context, topics, expected, actual) {
            zappEventManager.logSolveFloatTask(task, context, topics, expected, actual, zappInternal.sessionInfoForTask(task, context));
        },

        logSolveMCTask: function(task, context, topics, expected, actual, among) {
            zappEventManager.logSolveMCTask(task, context, topics, expected, actual, among, zappInternal.sessionInfoForTask(task, context));
        },

        logSolveGradTask: function(task, context, topics, expected, actual, among) {
            zappEventManager.logSolveGradTask(task, context, topics, expected, actual, among, zappInternal.sessionInfoForTask(task, context));
        }

    };

})();


