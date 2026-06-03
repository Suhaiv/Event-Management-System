public with sharing class EventDetailController {

    // ===== SPEAKERS =====
    @AuraEnabled
    public static List<Event_Speaker__c> getSpeakers(Id eventId) {
        return [
            SELECT Id,
                   Speaker__r.Name,
                   Speaker__r.Email__c,
                   Speaker__r.Phone__c,
                   Speaker__r.Company__c
            FROM Event_Speaker__c
            WHERE Event__c = :eventId
        ];
    }

    // ===== LOCATION =====
    @AuraEnabled
    public static Location_event__c getLocation(Id locationId) {
        return [
            SELECT Id, Name, Street__c, City__c, State__c,
                   Postal_Code__c, Verified__c
            FROM Location_event__c
            WHERE Id = :locationId
            LIMIT 1
        ];
    }

    // ===== ATTENDEES =====
    @AuraEnabled
    public static List<Event_Attendee__c> getAttendees(Id eventId) {
        return [
            SELECT Id,
                   Attendees__r.Name,
                   Attendees__r.Email__c,
                   Attendees__r.Phone__c,
                   Attendees__r.Company_Name__c
            FROM Event_Attendee__c
            WHERE Event__c = :eventId
        ];
    }
}