
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

        // sessionId: this.randomId(),
        zappId: "",
        taskName: "",
        contextName: "",
        sessionStartTime: new Date().getTime(),
        taskStartTime: 0,

        // String appIdentifier = LInfoHelper.getInstance().getPackageName();
        // String appVersion = LInfoHelper.getInstance().getVersion();
        // String appId = (appIdentifier == null || appVersion == null) ? UNKNOWN_APP_TEXT : appIdentifier;
        //
        // String cleanedAppId = appId.replaceAll(REGULAR_EXPRESSION, REPLACEMENT);
        // Logger.getInstance().loggerWithAppID(cleanedAppId);

        //endregion

        sessionInfo: function() {
            var result = [];

            result[ZID_KEY] = this.zappId;
            result[ZID_SESSION] = this.randomId();
            result[ZID_TIME] = String.valueOf(new Date().getTime() - this.sessionStartTime);
            return result;
        },

        sessionInfoForTask: function(task, context) {
            var result = [];

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
            return Math.floor(POSITIVE_INDEX + Math.random() * RANDOM_LENGTH_INDEX);
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
        }
    };

//endregion

//region ZappEventManager

    EMPTY_INDEX = 0;

    var zappEventManager = {

        logEvent: function(event, info) {
            var loggedArray = [info];

            loggedArray[EVENT_KEY] = event;

            zappEventLogger.logEvent(Z_EVENT_KEY, loggedArray)
        },

        logBeginTask: function(task, context, info) {
            var loggedArray = [info];

            loggedArray[TASK_KEY] = task;
            loggedArray[CONTEXT_KEY] = context;

            zappEventLogger.logEvent(Z_BEGIN_TASK_KEY, loggedArray)
        },

        logSolveTask: function(type, task, context, topics, expected, actual, among, info) {
            var loggedArray = [info];

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

    Z_URL_PART = "https://zapptitude-dev.herokuapp.com";

    Z_API_URL_PART = "api/events";

    //endregion

    var zappEventLogger = {

        logEvent: function(eventType, data) {
            // //        LLocation currentLocation = LInfoHelper.getInstance().getCurrentLocationInfo();
            var event = new this.event(eventType, zappInfoCollector.location(), zappInfoCollector.connectionState(), data);
            var requestData = new this.requestData(event, zappInfoCollector.browserInfo(), zappInfoCollector.appInfo());

            var url = Z_URL_PART + Z_API_URL_PART + zappInfoCollector.appId()

            zappConnectionService.postData(url, zappJsonManager.convertToJson(requestData));
        },

        event: function(eventType, location, connectionState, payload) {
            this.eventType = eventType;
            this.location = location;
            this.connectionState = connectionState;
            this.payload = payload;
        },

        requestData: function(event, browserInfo, appInfo) {
            this.event = event;
            this.browserInfo = browserInfo;
            this.appInfo = appInfo;
            this.timeStamp = new Date();
        }

    };

//endregion

//region ZappInfoCollector

    var zappInfoCollector = {

        location: function() {
            var result = [];
            result["lat"] = "some latitude";
            result["long"] = "some longitude";
            return result;
        },

        connectionState: function() {
            return "connected";
        },

        browserInfo: function() {
            var result = [];
            result["type"] = "some_browser_type";
            result["version"] = "some_browser_version";
            return result;
        },

        appInfo: function() {
            var result = [];
            result["name"] = "some.app.name";
            result["version"] = "some_app_version";
            return result;
        },

        appId: function() {
            return "app_id";
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

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    document.getElementById("demo").innerHTML = xhttp.responseText;
                }
            };
            xhttp.open("POST", URL, true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(jsonData);
        }

    };

//endregion

//region ZappJsonManager

    var zappJsonManager = {

        convertToJson: function(data) {
            return "";
        }

    };

//endregion

//region Zapptitude

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
