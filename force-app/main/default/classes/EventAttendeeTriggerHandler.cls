public class EventAttendeeTriggerHandler {

    public static void sendConfirmationEmail(List<Event_Attendee__c> records) {

        Set<Id> eventIds = new Set<Id>();
        Set<Id> attendeeIds = new Set<Id>();

        for (Event_Attendee__c ea : records) {
            if (ea.Event__c != null && ea.Attendees__c != null) {
                eventIds.add(ea.Event__c);
                attendeeIds.add(ea.Attendees__c);
            }
        }

        if (eventIds.isEmpty() || attendeeIds.isEmpty()) return;

        //Correct Event query
        Map<Id, Event_Mng__c> eventMap = new Map<Id, Event_Mng__c>(
            [SELECT Id, Name, Start__c,
                    Location_event__r.Name,
                    Organizer__r.Name
             FROM Event_Mng__c
             WHERE Id IN :eventIds]
        );

        // Correct Attendee query
        Map<Id, Attendees__c> attendeeMap = new Map<Id, Attendees__c>(
            [SELECT Id, Name, Email__c
             FROM Attendees__c
             WHERE Id IN :attendeeIds]
        );

        List<Messaging.SingleEmailMessage> mails =
            new List<Messaging.SingleEmailMessage>();

        for (Event_Attendee__c ea : records) {

            Event_Mng__c evt = eventMap.get(ea.Event__c);
            Attendees__c att = attendeeMap.get(ea.Attendees__c);

            if (evt == null || att == null || att.Email__c == null) continue;

            String locationName =
                evt.Location_event__r != null
                ? evt.Location_event__r.Name
                : 'Location will be shared soon';

            Messaging.SingleEmailMessage mail =
                new Messaging.SingleEmailMessage();

            mail.setToAddresses(new List<String>{ att.Email__c });
            mail.setSubject('Pass for the "' + evt.Name + '"');

            String body =
                'Dear ' + att.Name + ',\n\n' +
                'Thank you for registering for "' + evt.Name + '".\n' + 
                'which will be Organized on Event Date: ' + evt.Start__c + '\n' +
                '& will be held in Location: ' + locationName + '\n\n' +
                'Google Maps:\nhttps://www.google.com/maps/place/' +
                locationName + '\n\n' +
                'Thanks,\n' +
                evt.Organizer__r.Name;

            mail.setPlainTextBody(body);
            mails.add(mail);
        }

        if (!mails.isEmpty()) {
            Messaging.sendEmail(mails);
        }
    }
}