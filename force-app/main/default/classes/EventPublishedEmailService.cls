public class EventPublishedEmailService implements Queueable, Database.AllowsCallouts {

    private Set<Id> eventIds;

    public EventPublishedEmailService(Set<Id> eventIds) {
        this.eventIds = eventIds;
    }

    public void execute(QueueableContext context) {

        if (eventIds == null || eventIds.isEmpty()) {
            return;
        }

        // Get Published Events
        List<Event_Mng__c> events = [
            SELECT Id, Name, Name__c, Status__c
            FROM Event_Mng__c
            WHERE Id IN :eventIds
            AND Status__c = 'Published'
        ];

        if (events.isEmpty()) {
            return;
        }

        // Get ALL Attendees who have Email
        List<Attendees__c> attendees = [
            SELECT Id, Name, Email__c
            FROM Attendees__c
            WHERE Email__c != null
        ];

        if (attendees.isEmpty()) {
            return;
        }

        List<Messaging.SingleEmailMessage> emailList =
            new List<Messaging.SingleEmailMessage>();

        /*
         * Currently every attendee receives the invitation
         * for every published event.
         */
        for (Event_Mng__c eventRecord : events) {

            for (Attendees__c attendee : attendees) {

                /*
                 * IMPORTANT:
                 * Replace YOUR_VF_PAGE_NAME with the actual
                 * Visualforce Page API Name.
                 *
                 * Example:
                 * PageReference pageRef = Page.EventInvitation;
                 */
                PageReference pageRef = Page.EventInvitationController;

                // Send Event Id to VF Controller
                pageRef.getParameters().put(
                    'eventId',
                    String.valueOf(eventRecord.Id)
                );

                // Send Attendee Id to VF Controller
                pageRef.getParameters().put(
                    'attendeeId',
                    String.valueOf(attendee.Id)
                );

                // Generate VF Page HTML
                String htmlBody;

                try {
                    htmlBody = pageRef.getContent().toString();
                }
                catch (Exception e) {
                    System.debug(
                        'VF Page rendering failed: ' + e.getMessage()
                    );
                    continue;
                }

                Messaging.SingleEmailMessage mail =
                    new Messaging.SingleEmailMessage();

                // Individual attendee email
                mail.setToAddresses(
                    new List<String>{ attendee.Email__c }
                );

                // Email Subject
                mail.setSubject(
                    'Event Invitation - ' +
                    (eventRecord.Name__c != null
                        ? eventRecord.Name__c
                        : eventRecord.Name)
                );

                // VF Page as Email Body
                mail.setHtmlBody(htmlBody);

                mail.setSaveAsActivity(false);

                emailList.add(mail);
            }
        }

        /*
         * Salesforce allows only a limited number of
         * email messages per sendEmail call.
         *
         * Send in chunks of 10.
         */
        Integer batchSize = 10;

        for (Integer i = 0; i < emailList.size(); i += batchSize) {

            List<Messaging.SingleEmailMessage> batch =
                new List<Messaging.SingleEmailMessage>();

            Integer endIndex =
                Math.min(i + batchSize, emailList.size());

            for (Integer j = i; j < endIndex; j++) {
                batch.add(emailList[j]);
            }

            if (!batch.isEmpty()) {
                Messaging.sendEmail(batch);
            }
        }
    }
}