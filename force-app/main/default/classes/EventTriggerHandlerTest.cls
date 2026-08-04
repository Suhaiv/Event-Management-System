@isTest
private class EventTriggerHandlerTest {

    @isTest
    static void testLocationConflict() {

        // Existing Location record
        Location_event__c loc = new Location_event__c(
            Name = 'Delhi Hall'
        );
        insert loc;

        // First Event
        Event_Mng__c event1 = new Event_Mng__c(
            Name__c = 'Event 1',
            Location_event__c = loc.Id,
            Start__c = Datetime.newInstance(2026, 6, 3, 12, 0, 0),
            End__c = Datetime.newInstance(2026, 6, 6, 12, 0, 0)
        );
        insert event1;

        // Overlapping Event
        Event_Mng__c event2 = new Event_Mng__c(
            Name__c = 'Event 2',
            Location_event__c = loc.Id,
            Start__c = Datetime.newInstance(2026, 6, 5, 10, 0, 0),
            End__c = Datetime.newInstance(2026, 6, 7, 10, 0, 0)
        );

        Test.startTest();
        Database.SaveResult sr = Database.insert(event2, false);
        Test.stopTest();

        System.assertEquals(false, sr.isSuccess());
        System.assert(
            sr.getErrors()[0].getMessage().contains('already booked')
        );
    }
}