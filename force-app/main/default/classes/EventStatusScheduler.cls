public class EventStatusScheduler implements Schedulable {

    private Id eventId;
    private String targetStatus;

    public EventStatusScheduler(Id eventId, String targetStatus) {
        this.eventId = eventId;
        this.targetStatus = targetStatus;
    }

    public void execute(SchedulableContext sc) {

        Event_Mng__c eventRecord = [
            SELECT Id, Status__c, Start__c, End__c
            FROM Event_Mng__c
            WHERE Id = :eventId
            LIMIT 1
        ];

        // Start time
        if (targetStatus == 'In Progress') {

            // Only Published event can become In Progress
            if (eventRecord.Status__c == 'Published') {
                eventRecord.Status__c = 'In Progress';
                update eventRecord;
            }
        }

        // End time
        else if (targetStatus == 'Completed') {

            // Only In Progress event can become Completed
            if (eventRecord.Status__c == 'In Progress') {
                eventRecord.Status__c = 'Completed';
                update eventRecord;
            }
        }
    }
}