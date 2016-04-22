;var zapptitude = (function (){

    //region ZappInternal

    //region Constants

    POSITIVE_INDEX = 100000000;
    RANDOM_LENGTH_INDEX = 900000000000000000;

    Z_EVENT_KEY = "ZEvent";
    Z_BEGIN_TASK_KEY = "ZBeginTask";
    Z_SOLVE_TASK_KEY = "ZSolveTask";

    EVENT_KEY = "event";
    TASK_KEY = "task";
    CONTEXT_KEY = "contex";
    TYPE_KEY = "type";
    EXPECTED_KEY = "expected";
    TOPICS_KEY = "topics";
    ACTUAL_KEY = "actual";
    AMONG_KEY = "among";
    BINARY_KEY = "binary";
    INT_KEY = "binary";
    FLOAT_KEY = "float";
    MC_KEY = "mc";
    GRAD_KEY = "grad";

    EMPTY_INDEX = 0;

    ZID_KEY = "zid";
    ZID_SESSION = "session";
    ZID_DURATION = "duration";
    ZID_TIME = "time";

    //endregion

    var zappInternal = {

        //region Properties

        sessionId: "Z-233454645675672249",//this.randomId(),
        zappId: "some_zapp_id",
        taskName: "",
        contextName: "",
        sessionStartTime: new Date().getTime(),
        taskStartTime: 0,

        // TODO: constructor
        // String appIdentifier = LInfoHelper.getInstance().getPackageName();
        // String appVersion = LInfoHelper.getInstance().getVersion();
        // String appId = (appIdentifier == null || appVersion == null) ? UNKNOWN_APP_TEXT : appIdentifier;
        //
        // String cleanedAppId = appId.replaceAll(REGULAR_EXPRESSION, REPLACEMENT);
        // Logger.getInstance().loggerWithAppID(cleanedAppId);

        //endregion

        sessionInfo: function() {
            var result = {};

            result[ZID_KEY] = this.zappId;
            result[ZID_SESSION] = this.randomId();
            result[ZID_TIME] = String.valueOf(new Date().getTime() - this.sessionStartTime);
            return result;
        },

        sessionInfoForTask: function(task, context) {
            var result = {};

            result[ZID_KEY] = this.zappId;
            result[ZID_SESSION] = this.randomId();
            result[ZID_DURATION] = String.valueOf(zappInternal.taskDuration(task, context).toFixed(3));
            result[ZID_TIME] = String.valueOf(new Date().getTime() - this.sessionStartTime);

            return result;
        },

        taskDuration: function(task, context) {
            if (this.taskStartTime <= 0) {
                return -1;
            }
            if ((this.taskName || task) && !this.taskName.equals(task)) {
                return -1;
            }
            if ((this.contextName || context) && !this.contextName.equals(context)) {
                return -1;
            }
            return new Date().getTime() - this.taskStartTime;
        },

        randomId: function() {
            return "Z-" + Math.floor(POSITIVE_INDEX + Math.random() * RANDOM_LENGTH_INDEX);
        },

        setTask: function(task, context) {
            this.taskStartTime = new Date().getTime();

            if (task) {
                this.taskName = null;
            } else {
                this.taskName = new String(task);
            }
            if (context) {
                this.contextName = null;
            } else {
                this.contextName = new String(context);
            }
        },

        checkZappId: function(zappId) {
            var url = Z_URL_PART + "/" + "check" + "/" + zappId;
            zappConnectionService.getData(url)
        }

    };

    //endregion

    //region ZappEventManager

    var zappEventManager = {

        logEvent: function(event, info) {
            var loggedArray = {info};

            loggedArray[EVENT_KEY] = event;

            zappEventLogger.logEvent(Z_EVENT_KEY, loggedArray)
        },

        logBeginTask: function(task, context, info) {
            var loggedArray = {info};

            loggedArray[TASK_KEY] = task;
            loggedArray[CONTEXT_KEY] = context;

            zappEventLogger.logEvent(Z_BEGIN_TASK_KEY, loggedArray)
        },

        logSolveTask: function(type, task, context, topics, expected, actual, among, info) {
            var loggedArray = {info};

            loggedArray[TYPE_KEY] = type;
            loggedArray[EXPECTED_KEY] = expected;
            loggedArray[ACTUAL_KEY] = actual;
            loggedArray[TASK_KEY] = task;
            loggedArray[CONTEXT_KEY] = context;
            loggedArray[TOPICS_KEY] = topics;
            if (among !== undefined) {
                loggedArray[AMONG_KEY] = among;
            }
            zappEventLogger.logEvent(Z_SOLVE_TASK_KEY, loggedArray)
        },

        logSolveBinaryTask: function(task, context, topics, expected, actual, info) {
            this.logSolveTask(BINARY_KEY, task, context, topics, expected, actual, undefined, info)
        },

        logSolveIntTask: function(task, context, topics, expected, actual, info) {
            this.logSolveTask(INT_KEY, task, context, topics, expected, actual, undefined, info)
        },

        logSolveFloatTask: function(task, context, topics, expected, actual, info) {
            this.logSolveTask(FLOAT_KEY, task, context, topics, expected, actual, undefined, info)
        },

        logSolveMCTask: function(task, context, topics, expected, actual, among, info) {
            this.logSolveTask(MC_KEY, task, context, topics, expected, actual, among, info)
        },

        logSolveGradTask: function(task, context, topics, expected, actual, among, info) {
            this.logSolveTask(GRAD_KEY, task, context, topics, expected, actual, among, info)
        }

    };

//endregion

    //region ZappEventLogger

        //region Constants

        var Z_URL_PART = "https://zapptitude-dev.herokuapp.com/api";

        //endregion

        var zappEventLogger = {

            // TODO: add constructor
            loggerWithAppID: function(appId) {;
                // if(!this.appIdIsValid(appId)) {
                //     return instance;
                // } else {
                    var sessionId = this.generateSessionId(appId);
                    localStorage.setItem("appId", appId);
                    localStorage.setItem("sessionId", sessionId);

                    //  TODO: send log
                    // this.logManager.sendLog();
                    // this.addLogEvent("start_session", (HashMap)null);
                // }
            },

            generateSessionId: function(appId) {;
                var timeInMilliseconds = (new Date()).getTime();
                text = String.valueOf(timeInMilliseconds);
                // TODO: add encryption
                return "encrypt_session";
            },

            logEvent: function(eventType, data) {;
                var event = new this.event(eventType, zappInfoCollector.location(), zappInfoCollector.connectionState(), data);
                var requestData = new this.requestData(event, zappInfoCollector.browserInfo(), zappInfoCollector.appInfo());

                var url = Z_URL_PART + "/" + "events" + "/" + zappInfoCollector.appId()

                zappConnectionService.postData(url, this.getQueryString(this.getJsonList(requestData)));
            },

            event: function(eventType, location, connectionState, payload) {
                this.name = eventType;
                this.session = zappInternal.sessionId;
                this.timeStamp = new Date().getTime();
                this.location = location;
                this.payload = payload;
                this.connection_state = connectionState;
            },

            requestData: function(event, browserInfo, appInfo) {
                this.event = {event};
                this.browserInfo = browserInfo;
                this.appInfo = appInfo;
                this.timeStamp = new Date().getTime();
            },

            getJsonList: function(requestData) {
                var pairs = {};
                pairs['items'] = JSON.stringify([{}]);//JSON.stringify([requestData.event.event]);
                pairs['device'] = JSON.stringify(requestData.browserInfo);
                pairs['application'] = JSON.stringify(requestData.appInfo);
                pairs['timestamp'] = JSON.stringify(requestData.timeStamp);
                return pairs;
            },

            getQueryString: function(pairs) {
                var str = [];
                for(var p in pairs)
                    str.push(p + "=" + encodeURIComponent(pairs[p]));
                return str.join("&");
            }


        };

    //endregion

    //region ZappInfoCollector

        var zappInfoCollector = {

            location: function() {
                var result = {};
                result["lat"] = "some latitude";
                result["long"] = "some longitude";
                return result;
            },

            connectionState: function() {
                return "connected";
            },

            browserInfo: function() {
                var result = {};
                result["type"] = "some_browser_type";
                result["version"] = "some_browser_version";
                return result;
            },

            appInfo: function() {
                var result = {};
                result["name"] = "some.app.name";
                result["version"] = "some_app_version";
                return result;
            },

            appId: function() {
                return "app.id";
            }



            // options: function() {
            //     var enableHighAccuracy = true;
            //     var timeout = 5000;
            //     var maximumAge = 0;
            // },
            //
            // success: function(pos) {
            //     var crd = pos.coords;
            //
            //     console.log('Your current position is:');
            //     console.log('Latitude : ' + crd.latitude);
            //     console.log('Longitude: ' + crd.longitude);
            //     console.log('More or less ' + crd.accuracy + ' meters.');
            // },
            //
            // error: function(err) {
            //     console.warn('ERROR(' + err.code + '): ' + err.message);
            // },
            //
            // info: function() {
            //     return navigator.geolocation.getCurrentPosition(this.success, this.error, this.options);
            // },

        };

    //endregion

    //region ZappConnectionService

        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

        var zappConnectionService = {

            postData: function(URL, jsonData) {


                var xhr = new XMLHttpRequest();
                xhr.withCredentials = true;
                xhr.open("POST", "https://zapptitude-dev.herokuapp.com/api/events/some.app");
                xhr.setRequestHeader("cache-control", "no-cache");
                xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");

                var body = 'items=' + encodeURIComponent(JSON.stringify({"a":1})) + '&device=' + encodeURIComponent(JSON.stringify({"a":1})) + '&application=' + encodeURIComponent(JSON.stringify({"a":1})) + '&timestamp=123';

                xhr.addEventListener("readystatechange", function () {

                    console.log(this.status);
                    console.log(this.responseText);

                    if (this.readyState === 4) {
                        console.log(this.responseText);
                    }
                });
                xhr.send(body);
            },

            getData: function(URL) {

                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function() {

                    console.log(xmlHttp.status);

                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                        console.log(xmlHttp.responseText);
                        // TODO: save zappId in localProperties

                    }
                }

                xmlHttp.open("GET", URL, true);
                xmlHttp.send(null);

            }

        };

    //endregion

    //region ZappIdDialog

    var zappIdDialog = {

        // CustomAlert: function() {
        //     this.render = function(dialog){
        //         var winW = window.innerWidth;
        //         var winH = window.innerHeight;
        //         var dialogoverlay = document.getElementById('dialogoverlay');
        //         var dialogbox = document.getElementById('dialogbox');
        //         dialogoverlay.style.display = "block";
        //         dialogoverlay.style.height = winH+"px";
        //         dialogbox.style.left = (winW/2) - (550 * .5)+"px";
        //         dialogbox.style.top = "100px";
        //         dialogbox.style.display = "block";
        //         document.getElementById('dialogboxhead').innerHTML = "Acknowledge This Message";
        //         document.getElementById('dialogboxbody').innerHTML = dialog;
        //         document.getElementById('dialogboxfoot').innerHTML = '<button onclick="Alert.ok()">OK</button>';
        //     }
        //     this.ok = function(){
        //         document.getElementById('dialogbox').style.display = "none";
        //         document.getElementById('dialogoverlay').style.display = "none";
        //     }
        // },
        //
        // var: Alert = new this.CustomAlert(),
        //
        // var: Confirm = new this.CustomConfirm(),
        //
        // CustomConfirm: function() {
        //     this.render = function(dialog,op,id){
        //         var winW = window.innerWidth;
        //         var winH = window.innerHeight;
        //         var dialogoverlay = document.getElementById('dialogoverlay');
        //         var dialogbox = document.getElementById('dialogbox');
        //         dialogoverlay.style.display = "block";
        //         dialogoverlay.style.height = winH+"px";
        //         dialogbox.style.left = (winW/2) - (550 * .5)+"px";
        //         dialogbox.style.top = "100px";
        //         dialogbox.style.display = "block";
        //
        //         document.getElementById('dialogboxhead').innerHTML = "Confirm that action";
        //         document.getElementById('dialogboxbody').innerHTML = dialog;
        //         document.getElementById('dialogboxfoot').innerHTML = '<button onclick="Confirm.yes(\''+op+'\',\''+id+'\')">Yes</button> <button onclick="Confirm.no()">No</button>';
        //     }
        //     this.no = function(){
        //         document.getElementById('dialogbox').style.display = "none";
        //         document.getElementById('dialogoverlay').style.display = "none";
        //     }
        //     this.yes = function(op,id){
        //         if(op == "delete_post"){
        //             deletePost(id);
        //         }
        //         document.getElementById('dialogbox').style.display = "none";
        //         document.getElementById('dialogoverlay').style.display = "none";
        //     }
        // },
        //
        // var: Prompt = new CustomPrompt(),
        //
        // CustomPrompt: function() {
        //     this.render = function(dialog,func){
        //         var winW = window.innerWidth;
        //         var winH = window.innerHeight;
        //         var dialogoverlay = document.getElementById('dialogoverlay');
        //         var dialogbox = document.getElementById('dialogbox');
        //         dialogoverlay.style.display = "block";
        //         dialogoverlay.style.height = winH+"px";
        //         dialogbox.style.left = (winW/2) - (550 * .5)+"px";
        //         dialogbox.style.top = "100px";
        //         dialogbox.style.display = "block";
        //         document.getElementById('dialogboxhead').innerHTML = "A value is required";
        //         document.getElementById('dialogboxbody').innerHTML = dialog;
        //         document.getElementById('dialogboxbody').innerHTML += '<br><input id="prompt_value1">';
        //         document.getElementById('dialogboxfoot').innerHTML = '<button onclick="Prompt.ok(\''+func+'\')">OK</button> <button onclick="Prompt.cancel()">Cancel</button>';
        //     }
        //     this.cancel = function(){
        //         document.getElementById('dialogbox').style.display = "none";
        //         document.getElementById('dialogoverlay').style.display = "none";
        //     }
        //     this.ok = function(func){
        //         var prompt_value1 = document.getElementById('prompt_value1').value;
        //         window[func](prompt_value1);
        //         document.getElementById('dialogbox').style.display = "none";
        //         document.getElementById('dialogoverlay').style.display = "none";
        //     }
        // }

    }

    //endregion

    //region Tests

        module.exports = {

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

            logSolveBinaryTask: function(type, task, context, topics, expected, actual) {
                zappEventManager.logSolveBinaryTask(type, task, context, topics, expected, actual, zappInternal.sessionInfoForTask(task, context));
            },

            logSolveIntTask: function(type, task, context, topics, expected, actual) {
                zappEventManager.logSolveIntTask(type, task, context, topics, expected, actual, zappInternal.sessionInfoForTask(task, context));
            },

            logSolveFloatTask: function(type, task, context, topics, expected, actual) {
                zappEventManager.logSolveFloatTask(type, task, context, topics, expected, actual, zappInternal.sessionInfoForTask(task, context));
            },

            logSolveMCTask: function(type, task, context, topics, expected, actual, among) {
                zappEventManager.logSolveMCTask(type, task, context, topics, expected, actual, among, zappInternal.sessionInfoForTask(task, context));
            },

            logSolveGradTask: function(type, task, context, topics, expected, actual, among) {
                zappEventManager.logSolveGradTask(type, task, context, topics, expected, actual, among, zappInternal.sessionInfoForTask(task, context));
            }
        };

    //endregion

    return {

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

        logSolveBinaryTask: function(type, task, context, topics, expected, actual) {
            zappEventManager.logSolveBinaryTask(type, task, context, topics, expected, actual, zappInternal.sessionInfoForTask(task, context));
        },

        logSolveIntTask: function(type, task, context, topics, expected, actual) {
            zappEventManager.logSolveIntTask(type, task, context, topics, expected, actual, zappInternal.sessionInfoForTask(task, context));
        },

        logSolveFloatTask: function(type, task, context, topics, expected, actual) {
            zappEventManager.logSolveFloatTask(type, task, context, topics, expected, actual, zappInternal.sessionInfoForTask(task, context));
        },

        logSolveMCTask: function(type, task, context, topics, expected, actual, among) {
            zappEventManager.logSolveMCTask(type, task, context, topics, expected, actual, among, zappInternal.sessionInfoForTask(task, context));
        },

        logSolveGradTask: function(type, task, context, topics, expected, actual, among) {
            zappEventManager.logSolveGradTask(type, task, context, topics, expected, actual, among, zappInternal.sessionInfoForTask(task, context));
        }

    };

})();


