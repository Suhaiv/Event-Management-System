public with sharing class EventListController {

    @AuraEnabled(cacheable=true)
    public static List<Event_Mng__c> getLiveEvents(String searchKey) {

        String searchPattern = '%' + (searchKey == null ? '' : searchKey.trim()) + '%';

        if (String.isBlank(searchKey)) {

            return [
                SELECT Id,
                       Name__c,
                       Start__c,
                       Event_Type__c,
                       Live__c,
                       Location_event__r.Name
                FROM Event_Mng__c
                WHERE Start__c >= TODAY
                AND (
                    Event_Type__c = 'Virtual'
                    OR Live__c = true
                )
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
            WHERE Start__c >= TODAY
            AND (
                Event_Type__c = 'Virtual'
                OR Live__c = true
            )
            AND (
                Name__c LIKE :searchPattern
                OR Location_event__r.Name LIKE :searchPattern
            )
            ORDER BY Start__c ASC
        ];
    }
}