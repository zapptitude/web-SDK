# ZappSDK by MEV
JavaScript library

### Project Structure
Javascript file that contains functions and wev views.
Implement this JS library to project to enable event logging. 
### Images
Images used in app and icons for all devices

## Manual
Before starting using zapp methods, developer should init app info (appName as string, appId as string, appVersion as string)
zapptitude.initAppInfo(appName, appId, appVersion);


To request zappId 
zapptitude.requestZappId();

To set zappId (zappId as string)
zapptitude.setZappId(zappId);


To get user provider zappId
zapptitude.userProviderZappId();

Events:
Log event (event as string)
zapptitude.logEvent(event);

Log begin task (task as string, context as string)
zapptitude.logBeginTask(task, context);

Log solved binary task (task as string, context as string, topics as string, expected as boolean, actual as boolean)
zapptitude.logSolveBinaryTask( task, context, topics, expected, actual);

Log solved int task (task as string, context as string, topics as string, expected as int, actual as int)
zapptitude.logSolveIntTask(task, context, topics, expected, actual);

Log solved float task (task as string, context as string, topics as string, expected as float, actual as float)
zapptitude.logSolveFloatTask(task, context, topics, expected, actual);


Log solved MC task (task as string, context as string, topics as string, expected as char, actual as char, among as int)
zapptitude.logSolveMCTask(task, context, topics, expected, actual, among);

Log solved grad task (task as string, context as string, topics as string, expected as int, actual as int, among as int)
zapptitude.logSolveGradTask(task, context, topics, expected, actual, among);