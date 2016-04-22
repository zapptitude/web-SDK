;var zapptitude = (function (){

    //region Constants

    var POSITIVE_INDEX = 100000000;
    var RANDOM_LENGTH_INDEX = 900000000000000000;

    var Z_EVENT_KEY = "ZEvent";
    var Z_BEGIN_TASK_KEY = "ZBeginTask";
    var Z_SOLVE_TASK_KEY = "ZSolveTask";

    var EVENT_KEY = "event";
    var TASK_KEY = "task";
    var CONTEXT_KEY = "contex";
    var TYPE_KEY = "type";
    var EXPECTED_KEY = "expected";
    var TOPICS_KEY = "topics";
    var ACTUAL_KEY = "actual";
    var AMONG_KEY = "among";
    var BINARY_KEY = "binary";
    var INT_KEY = "binary";
    var FLOAT_KEY = "float";
    var MC_KEY = "mc";
    var GRAD_KEY = "grad";

    var ZID_KEY = "zid";
    var ZID_SESSION = "session";
    var ZID_DURATION = "duration";
    var ZID_TIME = "time";

    var Z_URL_PART = "https://zapptitude-dev.herokuapp.com/api";

    var REGULAR_EXPRESSION = "[^a-zA-Z0-9.-]";
    var REPLACEMENT = "_";

    var UNKNOWN_APP_TEXT = "unknownApp";


    var APP_NAME_KEY = "appName";
    var APP_VERSION_KEY = "appVersion";
    var APP_IDENTIFIER_KEY = "appIdentifier";
    var APP_ID_KEY = "appId";
    var SESSION_ID_KEY = "sessionId";

    //endregion

    //region ZappInternal

    function ZappInternal() {
        if (ZappInternal.instance) {
            return ZappInternal.instance;
        }

        this.sessionId = randomId();
        var zappId = "";
        var taskName = "";
        var contextName = "";
        var sessionStartTime = new Date().getTime();
        var taskStartTime = 0;

        // var appVersion = localStorage.getItem(APP_VERSION_KEY)
        // var appIdentifier = localStorage.getItem(APP_IDENTIFIER_KEY)


        // var appId = (appIdentifier && appVersion) ? appIdentifier : UNKNOWN_APP_TEXT;

        // var cleanedAppId = replaceAll(appId, REGULAR_EXPRESSION, REPLACEMENT);
        //
        // // zappEventLogger.loggerWithAppID(cleanedAppId);
        //
        this.replaceAll = function(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        };

        this.sessionInfo = function() {
            var result = {};

            result[ZID_KEY] = localStorage.getItem(ZID_KEY) || zappId;
            result[ZID_SESSION] = randomId();
            result[ZID_TIME] = String.valueOf(new Date().getTime() - sessionStartTime);
            return result;
        };

        this.sessionInfoForTask = function(task, context) {
            var result = {};

            result[ZID_KEY] = localStorage.getItem(ZID_KEY) || zappId;
            result[ZID_SESSION] = randomId();
            result[ZID_DURATION] = String.valueOf(zappInternal.taskDuration(task, context).toFixed(3));
            result[ZID_TIME] = String.valueOf(new Date().getTime() - sessionStartTime);

            return result;
        };

        function taskDuration(task, context) {
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

        function randomId() {
            return "Z-" + Math.floor(POSITIVE_INDEX + Math.random() * RANDOM_LENGTH_INDEX);
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

        this.requestZappId = function() {
            var zappId = prompt("Please enter your ZappId");
            checkZappId(zappId);
        };

        function checkZappId(zappId) {
            var url = Z_URL_PART + "/" + "check" + "/" + zappId;
            zappConnectionService.getData(url);
        }

        return ZappInternal.instance = this;
    }

    var zappInternal = new ZappInternal;

    //endregion

    //region ZappEventManager

    function ZappEventManager() {
        if (ZappEventManager.instance) {
            return ZappEventManager.instance;
        }

        this.logEvent = function(event, info) {
            var loggedArray = {info};

            loggedArray[EVENT_KEY] = event;

            zappEventLogger.logEvent(Z_EVENT_KEY, loggedArray)
        };

        this.logBeginTask = function(task, context, info) {
            var loggedArray = {info};

            loggedArray[TASK_KEY] = task;
            loggedArray[CONTEXT_KEY] = context;

            zappEventLogger.logEvent(Z_BEGIN_TASK_KEY, loggedArray)
        };

        this.logSolveTask = function(type, task, context, topics, expected, actual, among, info) {
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

        return ZappEventManager.instance = this;
    }

    var zappEventManager = new ZappEventManager;

    //endregion

    //region ZappEventLogger

    function ZappEventLogger() {
        if (ZappEventLogger.instance) {
            return ZappEventLogger.instance;
        }

        this.loggerWithAppID = function(appId) {

            debugger;

            if(!appIdIsValid(appId))
                return;

            var sessionId = generateSessionId(appId);
            localStorage.setItem(APP_ID_KEY, appId)
            localStorage.setItem(SESSION_ID_KEY, sessionId);

            debugger;

            this.logEvent("start_session");
        }

        function appIdIsValid(appId) {
            return (appId);
        }

        function generateSessionId(appId) {
            var timeInMilliseconds = (new Date()).getTime();
            text = String.valueOf(timeInMilliseconds);
            // TODO: add encryption
            return "encrypted_session";
        }

        this.logEvent = function(eventType, data) {
            var event = new Event(eventType, zappInfoCollector.location(), zappInfoCollector.connectionState(), data);
            var requestData = new RequestData(event, zappInfoCollector.browserInfo(), zappInfoCollector.appInfo());

            var url = Z_URL_PART + "/" + "events" + "/" + localStorage.getItem(APP_ID_KEY);

            zappConnectionService.postData(url, getQueryString(getJsonList(requestData)));
        };

        function Event(eventType, location, connectionState, payload) {
            this.name = eventType;
            this.session = zappInternal.sessionId;
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
            pairs['items'] = JSON.stringify([requestData.event.event]);
            pairs['device'] = JSON.stringify(requestData.browserInfo);
            pairs['application'] = JSON.stringify(requestData.appInfo);
            pairs['timestamp'] = JSON.stringify(requestData.timeStamp);
            return pairs;
        }

        function getQueryString(pairs) {
            var str = [];
            for(var p in pairs)
                str.push(p + "=" + encodeURIComponent(pairs[p]));
            return str.join("&");
        }

        return ZappEventLogger.instance = this;
    }

    var zappEventLogger = new ZappEventLogger;

    //endregion

    //region ZappInfoCollector

    function ZappInfoCollector() {
        if (ZappInfoCollector.instance) {
            return ZappInfoCollector.instance;
        }

        this.location = function() {
            var result = {};
            result["lat"] = "some latitude";
            result["long"] = "some longitude";
            return result;
        };

        this.connectionState = function() {
            return "connected";
        };

        this.browserInfo = function() {
            var result = {};
            result["type"] = "some_browser_type";
            result["version"] = "some_browser_version";
            return result;
        };

        this.appInfo = function() {
            var result = {};
            result["name"] = localStorage.getItem(APP_NAME_KEY);
            result["version"] = localStorage.getItem(APP_VERSION_KEY);
            return result;
        };

        return ZappInfoCollector.instance = this;
    }

    var zappInfoCollector = new ZappInfoCollector;

    //endregion

    //region ZappConnectionService

    function ZappConnectionService() {
        if (ZappConnectionService.instance) {
            return ZappConnectionService.instance;
        }

        this.postData=function(URL, jsonData) {

            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("POST", URL, true);
            xmlHttp.setRequestHeader("content-type", "application/x-www-form-urlencoded");

            xmlHttp.onreadystatechange = function() {

                if (this.readyState === 4) {
                    var response = JSON.parse(this.responseText);
                    if (response.status)
                        alert("Event logged successfully!");
                    else
                        alert("Ooops! Seems like some problem appeared..");
                }
            };

            xmlHttp.send(jsonData);
        };

        this.getData=function(URL) {

            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", URL, true);

            xmlHttp.onreadystatechange = function() {

                if (this.readyState === 4) {
                    var response = JSON.parse(this.responseText);
                    if (response.status) {
                        alert("Welcome " + response.result + "!");
                        localStorage.setItem(ZID_KEY, response.result);
                    }
                    else
                        alert("Sorry, no such user!");
                }
            };

            xmlHttp.send(null);
        };

        return ZappConnectionService.instance = this;
    }

    var zappConnectionService = new ZappConnectionService;

    //endregion

    //region ZappView

    // function ZappView() {
    //     if (ZappView.instance) {
    //         return ZappView.instance;
    //     }
    //
    //     function showZappIdDialog() {
    //         var zappId = prompt("Please enter your ZappId");
    //         zappInternal.checkZappId(zappId);
    //     };
    //
    //     this.showZappIdDialog = showZappIdDialog();
    //
    //     return ZappView.instance = this;
    // }
    //
    // var zappView = new ZappView;

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


