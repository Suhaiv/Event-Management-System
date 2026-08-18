trigger EventMngTrigger on Event_Mng__c (after insert, after update) {

    Set<Id> eventIds = new Set<Id>();

    for (Event_Mng__c eventRecord : Trigger.new) {

        // When Event is created with Published status
        if (Trigger.isInsert) {

            if (eventRecord.Status__c == 'Published') {
                eventIds.add(eventRecord.Id);
            }
        }

        // When existing Event changes to Published
        if (Trigger.isUpdate) {

            Event_Mng__c oldEvent =
                Trigger.oldMap.get(eventRecord.Id);

            if (
                eventRecord.Status__c == 'Published' &&
                oldEvent.Status__c != 'Published'
            ) {
                eventIds.add(eventRecord.Id);
            }
        }
    }

    // Send all Event IDs to Queueable class
    if (!eventIds.isEmpty()) {

        System.enqueueJob(
            new EventPublishedEmailService(eventIds)
        );
    }
}