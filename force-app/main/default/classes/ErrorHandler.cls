public class ErrorHandler {

    public static void logError(
        String processName,
        Exception e
    ) {
        try {
            Error_Log__c errorLog = new Error_Log__c();
            errorLog.Process_Name__c = processName;
            errorLog.Log_Details__c = e.getMessage();
            
            errorLog.Log__c = System.now();

            insert errorLog;
        } catch (Exception ex) {
            // Avoid infinite loop
            System.debug('Error while logging error: ' + ex.getMessage());
        }
    }
}