@RestResource(urlMapping='/events')
global with sharing class EventRestService {

    @HttpGet
    global static List<EventResponse> getLiveEvents() {

        List<EventResponse> responseList = new List<EventResponse>();

        List<Event_Mng__c> events = [
            SELECT Id,
                   Name,
                   Start__c,
                   End__c,
                   Live__c,
                   Organizer__r.Name,
                   Location_event__r.Name
            FROM Event_Mng__c
            WHERE Live__c = true
            AND Start__c > TODAY
            ORDER BY Start__c ASC
        ];

        for (Event_Mng__c ev : events) {
            EventResponse er = new EventResponse();
            er.eventId = ev.Id;
            er.eventName = ev.Name;
            er.startDate = ev.Start__c;
            er.endDate = ev.End__c;
            er.organizer = ev.Organizer__r != null ? ev.Organizer__r.Name : null;
            er.location = ev.Location_event__r != null ? ev.Location_event__r.Name : null;

            responseList.add(er);
        }

        return responseList;
    }

    // Wrapper class (JSON structure)
    global class EventResponse {
        public String eventId;
        public String eventName;
        public Datetime startDate;
        public Datetime endDate;
        public String organizer;
        public String location;
    }
}