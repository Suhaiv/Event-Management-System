public with sharing class EventListController {

    @AuraEnabled(cacheable=true)
    public static List<Event_Mng__c> getLiveEvents(String searchKey){

        String searchPattern = '%' + searchKey + '%';

        if(String.isBlank(searchKey)){
            return [
                SELECT Id,
                       Name__c,
                       Start__c,
                       
                       Event_Type__c,
                       Live__c,
                       Location_event__r.Name
                FROM Event_Mng__c
                WHERE Live__c = true
                AND Start__c >= TODAY
                ORDER BY Start__c ASC
            ];
        }

        return [
            SELECT Id,
                   Name__c,
                   Start__c,
                   
                   Event_Type__c,
                   Live__c,
                   Location_event__r.Name
            FROM Event_Mng__c
            WHERE Live__c = true
            AND Start__c >= TODAY
            AND (
                Name__c LIKE :searchPattern
                OR Location_event__r.Name LIKE :searchPattern
            )
            ORDER BY Start__c ASC
        ];
    }
}