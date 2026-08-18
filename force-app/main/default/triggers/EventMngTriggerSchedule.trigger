trigger EventMngTriggerSchedule on Event_Mng__c (after update) {

    List<Event_Mng__c> eventsToSchedule = new List<Event_Mng__c>();

    for (Event_Mng__c newEvent : Trigger.new) {

        Event_Mng__c oldEvent = Trigger.oldMap.get(newEvent.Id);

        // Created → Published
        if (oldEvent.Status__c != 'Published' &&
            newEvent.Status__c == 'Published') {

            eventsToSchedule.add(newEvent);
        }
    }

    for (Event_Mng__c eventRecord : eventsToSchedule) {

        EventStatusSchedulerHelper.scheduleEventStatus(eventRecord);
    }
}