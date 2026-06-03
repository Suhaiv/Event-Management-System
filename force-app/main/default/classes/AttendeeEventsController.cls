public with sharing class AttendeeEventsController {

    //  UPCOMING EVENTS
    @AuraEnabled(cacheable=true)
    public static List<Event_Mng__c> getUpcomingEvents(Id attendeeId) {
        return [
            SELECT Id, Name, Start__c, End__c, Status__c
            FROM Event_Mng__c
            WHERE Id IN (
                SELECT Event__c
                FROM Event_Attendee__c
                WHERE Attendees__c = :attendeeId
            )
            AND Start__c >= TODAY
            ORDER BY Start__c ASC
        ];
    }

    //  PAST EVENTS
    @AuraEnabled(cacheable=true)
    public static List<Event_Mng__c> getPastEvents(Id attendeeId) {
        return [
            SELECT Id, Name, Start__c, End__c, Status__c
            FROM Event_Mng__c
            WHERE Id IN (
                SELECT Event__c
                FROM Event_Attendee__c
                WHERE Attendees__c = :attendeeId
            )
            AND Start__c < TODAY
            ORDER BY Start__c DESC
        ];
    }
}