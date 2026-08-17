public with sharing class EventInvitationController {

    public Event_Mng__c eventRecord { get; set; }
    public SObject attendeeRecord { get; set; }

    public EventInvitationController() {
        // Read either 'eventId' or 'id'
        String eventId = ApexPages.currentPage().getParameters().get('eventId');
        if (String.isBlank(eventId)) {
            eventId = ApexPages.currentPage().getParameters().get('id');
        }

        String attendeeId = ApexPages.currentPage().getParameters().get('attendeeId');

        // Safe query into a List instead of direct single-record assignment
        if (String.isNotBlank(eventId)) {
            List<Event_Mng__c> eventList = [
                SELECT Id,
                       Name,
                       Name__c,
                       Event_Type__c,
                       Start__c,
                       End__c,
                       Location_event__c,
                       Location_event__r.Name,
                       Location_event__r.Street__c,
                       Location_event__r.City__c,
                       Location_event__r.State__c,
                       Location_event__r.Postal_Code__c,
                       Location_event__r.Country__c,
                       Organizer__c,
                       Organizer__r.Name,
                       Organizer__r.Email__c,
                       Organizer__r.Phone__c,
                       Max_Seats__c,
                       Remaining_Seats__c,
                       Status__c,
                       Live__c
                FROM Event_Mng__c
                WHERE Id = :eventId
                LIMIT 1
            ];

            if (!eventList.isEmpty()) {
                eventRecord = eventList[0];
            }
        }

        // Fetch Attendee details using correct Object API Name (Attendees__c)
        if (String.isNotBlank(attendeeId)) {
            try {
                List<Attendees__c> attendeeList = [
                    SELECT Id, Name, Email__c, Phone__c 
                    FROM Attendees__c 
                    WHERE Id = :attendeeId 
                    LIMIT 1
                ];
                if (!attendeeList.isEmpty()) {
                    attendeeRecord = attendeeList[0];
                }
            } catch (Exception e) {
                System.debug('Attendee fetch error: ' + e.getMessage());
            }
        }
    }

    // --- Keep your existing getter methods below ---
    public String getEventName() {
        return (eventRecord != null && String.isNotBlank(eventRecord.Name__c)) ? eventRecord.Name__c : 'Event Name Here';
    }

    public String getEventCategory() {
        return (eventRecord != null && String.isNotBlank(eventRecord.Event_Type__c)) ? eventRecord.Event_Type__c : 'Event Category';
    }

    public String getGuestName() {
        return (attendeeRecord != null && attendeeRecord.get('Name') != null) ? (String) attendeeRecord.get('Name') : 'Guest';
    }

    public String getEventDate() {
        return (eventRecord != null && eventRecord.Start__c != null) ? eventRecord.Start__c.format('dd MMM yyyy') : 'Event Date';
    }

    public String getEventTime() {
        return (eventRecord != null && eventRecord.Start__c != null) ? eventRecord.Start__c.format('hh:mm a') : 'Event Time';
    }

    public String getVenue() {
        if (eventRecord != null && eventRecord.Location_event__r != null) {
            List<String> addressParts = new List<String>();
            if (String.isNotBlank(eventRecord.Location_event__r.Name)) addressParts.add(eventRecord.Location_event__r.Name);
            if (String.isNotBlank(eventRecord.Location_event__r.Street__c)) addressParts.add(eventRecord.Location_event__r.Street__c);
            if (String.isNotBlank(eventRecord.Location_event__r.City__c)) addressParts.add(eventRecord.Location_event__r.City__c);
            if (String.isNotBlank(eventRecord.Location_event__r.State__c)) addressParts.add(eventRecord.Location_event__r.State__c);
            if (!addressParts.isEmpty()) return String.join(addressParts, ', ');
        }
        return 'Venue / Online Platform';
    }

    public String getOrganizationName() {
        return (eventRecord != null && eventRecord.Organizer__r != null && String.isNotBlank(eventRecord.Organizer__r.Name)) ? eventRecord.Organizer__r.Name : 'Organization Team / Department';
    }

    public String getRsvpUrl() {
        if (eventRecord != null) {
            String url = '/lightning/n/Event_Registration?eventId=' + eventRecord.Id;
            if (attendeeRecord != null) url += '&attendeeId=' + attendeeRecord.Id;
            return url;
        }
        return '#';
    }

    public String getCompanyName() { return getOrganizationName(); }
    public String getCompanyAddress() { return 'Ghaziabad, Uttar Pradesh, India'; }
    public String getSupportEmail() {
        return (eventRecord != null && eventRecord.Organizer__r != null && String.isNotBlank(eventRecord.Organizer__r.Email__c)) ? eventRecord.Organizer__r.Email__c : 'support@company.com';
    }
    public String getSupportPhone() {
        return (eventRecord != null && eventRecord.Organizer__r != null && String.isNotBlank(eventRecord.Organizer__r.Phone__c)) ? eventRecord.Organizer__r.Phone__c : '+91-XXXXXXXXXX';
    }
}