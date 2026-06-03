@IsTest
public class OldEventCleanupBatchTest {

    @testSetup
    static void setupData() {

        Event_Organizer__c org = new Event_Organizer__c(
            Name = 'Test Organizer'
        );
        insert org;

        // Old Event (eligible for delete)
        Event_Mng__c oldEvt = new Event_Mng__c(
            Name__c = 'Old Event',
            End__c = System.today().addMonths(-3),
            Organizer__c = org.Id,
            Status__c = 'Completed'
        );
        insert oldEvt;

        // New Event (should NOT delete)
        Event_Mng__c newEvt = new Event_Mng__c(
            Name__c = 'New Event',
            End__c = System.today(),
            Organizer__c = org.Id,
            Status__c = 'Completed'
        );
        insert newEvt;
    }

    @IsTest
    static void testBatchExecution() {

        Test.startTest();
        OldEventCleanupBatch batch = new OldEventCleanupBatch();
        Database.executeBatch(batch, 200);
        Test.stopTest();

        // Assert old events deleted
        Integer oldCount =
            [SELECT COUNT()
             FROM Event_Mng__c
             WHERE End__c < :System.today().addMonths(-2)];

        System.assertEquals(
            0,
            oldCount,
            'Old events should be deleted'
        );
    }
}