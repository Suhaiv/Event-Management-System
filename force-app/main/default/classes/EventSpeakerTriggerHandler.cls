public class EventSpeakerTriggerHandler {

    public static void checkDuplicate(
        List<Event_Speaker__c> newList,
        Map<Id, Event_Speaker__c> oldMap
    ) {
        Set<String> newCombinations = new Set<String>();
        Set<Id> eventIds = new Set<Id>();
        Set<Id> speakerIds = new Set<Id>();

        // Step 1: Prepare data
        for (Event_Speaker__c es : newList) {

            if (Trigger.isUpdate) {
                Event_Speaker__c oldRec = oldMap.get(es.Id);
                if (es.Event__c == oldRec.Event__c &&
                    es.Speaker__c == oldRec.Speaker__c) {
                    continue;
                }
            }

            if (es.Event__c != null && es.Speaker__c != null) {
                String key = es.Event__c + '-' + es.Speaker__c;
                newCombinations.add(key);
                eventIds.add(es.Event__c);
                speakerIds.add(es.Speaker__c);
            }
        }

        if (newCombinations.isEmpty()) return;

        // Step 2: Check existing records
        List<Event_Speaker__c> existing = [
            SELECT Id, Event__c, Speaker__c
            FROM Event_Speaker__c
            WHERE Event__c IN :eventIds
            AND Speaker__c IN :speakerIds
        ];

        // Step 3: Throw error if duplicate found
        for (Event_Speaker__c es : newList) {
            for (Event_Speaker__c ex : existing) {
                if (
                    es.Event__c == ex.Event__c &&
                    es.Speaker__c == ex.Speaker__c &&
                    es.Id != ex.Id
                ) {
                    es.addError('Speaker already added to this Event');
                }
            }
        }
    }
}