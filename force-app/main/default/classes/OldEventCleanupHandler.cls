public class OldEventCleanupHandler {

    public static void deleteEvents(List<Event_Mng__c> events) {
        try {
            delete events;
        } catch (Exception e) {
            ErrorHandler.logError('OldEventCleanupBatch', e);
        }
    }
}