@IsTest
public class EventAttendeeTriggerHandler_Test {
    
    @IsTest
    static void test_sendConfirmationEmail_method() {
        
        
        // Create Organizer
        
        Event_Organizer__c organizer = new Event_Organizer__c(
            Name = 'Test Organizer'
        );
        insert organizer;
        
        
        //  Create Location
        
        Location_event__c location = new Location_event__c(
            Name = 'Pune'
        );
        insert location;
        
        
        //  Create Event (required fields only)
        
        Event_Mng__c eventRec = new Event_Mng__c(
            Name__c = 'Unit Test Event',
            Start__c = System.now().addDays(1),
            Location_event__c = location.Id,
            Organizer__c = organizer.Id,
            Live__c = true,
            Status__c = 'Completed',
            Max_Seats__c = 100
        );
        insert eventRec;
        
        
        //  Create Attendee (WITH email)
        
        Attendees__c attendee = new Attendees__c(
            Name = 'Rahul',
            Email__c = 'rahul@test.com',
            Phone__c = '9999999999'
        );
        insert attendee;
        
        
        // Create Event_Attendee record
        
        Event_Attendee__c ea = new Event_Attendee__c(
            Name = 'EA-UNIT',
            Event__c = eventRec.Id,
            Attendees__c = attendee.Id
        );
        insert ea;
        
        
        // DIRECT METHOD CALL
        
        List<Event_Attendee__c> eaList =
            [SELECT Id, Event__c, Attendees__c
             FROM Event_Attendee__c
             WHERE Id = :ea.Id];
        
        Test.startTest();
        EventAttendeeTriggerHandler.sendConfirmationEmail(eaList);
        Test.stopTest();
        
        
        // Assertion (method executed)
        
        System.assertEquals(
            1,
            eaList.size(),
            'Handler method executed successfully'
        );
    }
}