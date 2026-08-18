public class EventStatusSchedulerHelper {

    public static void scheduleEventStatus(Event_Mng__c eventRecord) {

        // Start Job
        if (eventRecord.Start__c != null &&
            eventRecord.Start__c > System.now()) {

            String startCron = createCron(eventRecord.Start__c);

            System.schedule(
                'Event Start - ' + eventRecord.Id,
                startCron,
                new EventStatusScheduler(
                    eventRecord.Id,
                    'In Progress'
                )
            );
        }

        // End Job
        if (eventRecord.End__c != null &&
            eventRecord.End__c > System.now()) {

            String endCron = createCron(eventRecord.End__c);

            System.schedule(
                'Event End - ' + eventRecord.Id,
                endCron,
                new EventStatusScheduler(
                    eventRecord.Id,
                    'Completed'
                )
            );
        }
    }

    private static String createCron(Datetime dt) {

        return String.valueOf(dt.second()) + ' ' +
               String.valueOf(dt.minute()) + ' ' +
               String.valueOf(dt.hour()) + ' ' +
               String.valueOf(dt.day()) + ' ' +
               String.valueOf(dt.month()) + ' ? ' +
               String.valueOf(dt.year());
    }
}