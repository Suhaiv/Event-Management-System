trigger EventAttendeeTrigger on Event_Attendee__c (after insert) {
    try {
        EventAttendeeTriggerHandler.sendConfirmationEmail(Trigger.new);
    } catch (Exception e) {
        ErrorHandler.logError('EventAttendeeTrigger', e);
    }
}