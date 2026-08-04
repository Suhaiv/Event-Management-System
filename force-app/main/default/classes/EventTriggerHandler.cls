public class EventTriggerHandler {

    public static void validateLocationAvailability(List<Event_Mng__c> newEvents) {

        Set<Id> locationIds = new Set<Id>();

        for(Event_Mng__c evt : newEvents) {
            if(evt.Location_event__c != null) {
                locationIds.add(evt.Location_event__c);
            }
        }

        if(locationIds.isEmpty()) {
            return;
        }

        List<Event_Mng__c> existingEvents = [
            SELECT Id,
                   Location_event__c,
                   Start__c,
                   End__c
            FROM Event_Mng__c
            WHERE Location_event__c IN :locationIds
        ];

        for(Event_Mng__c newEvt : newEvents) {

            if(newEvt.Location_event__c == null ||
               newEvt.Start__c == null ||
               newEvt.End__c == null) {
                continue;
            }

            for(Event_Mng__c oldEvt : existingEvents) {

                if(oldEvt.Id == newEvt.Id) {
                    continue;
                }

                if(oldEvt.Location_event__c == newEvt.Location_event__c &&
                   oldEvt.Start__c <= newEvt.End__c &&
                   oldEvt.End__c >= newEvt.Start__c) {

                    newEvt.addError(
                        'This location is already booked during the selected time period.'
                    );
                    break;
                }
            }
        }
    }
}