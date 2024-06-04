// What should be the approach for regestering user

// 1. YOU should check for those fields in your request body which are required like the username email and password
//    If any of these fields are missing then you would just return a bad request response
//    It is be the job of front end developer to validate request before sending
//    But as a backend developer its our job to validate request, if its a valid request then check if that user 
//    already exist or not, if yes again return a bad reequest as response otherwise create the user 