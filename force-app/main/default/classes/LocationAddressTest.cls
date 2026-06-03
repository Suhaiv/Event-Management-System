@IsTest
public class LocationAddressTest {

    class SmartyMock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setBody('[{"delivery_line_1":"Valid Address"}]');
            return res;
        }
    }

    @IsTest
    static void testFlow() {

        Test.setMock(HttpCalloutMock.class, new SmartyMock());

        Location_event__c loc = new Location_event__c(
            Street__c = '1600 Amphitheatre Pkwy',
            City__c = 'Mountain View',
            State__c = 'CA',
            Postal_Code__c = '94043'
        );

        insert loc;

        Test.startTest();
        System.enqueueJob(
            new LocationAddressQueueable(new Set<Id>{ loc.Id })
        );
        Test.stopTest();

        Location_event__c result = [
            SELECT Verified__c
            FROM Location_event__c
            WHERE Id = :loc.Id
        ];

        System.assertEquals(true, result.Verified__c);
    }
}