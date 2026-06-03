trigger EventSpeakerTrigger on Event_Speaker__c (
    before insert,
    before update
) {
    try {
        EventSpeakerTriggerHandler.checkDuplicate(
            Trigger.new,
            Trigger.oldMap
        );
    } catch (Exception e) {
        ErrorHandler.logError('EventSpeakerTrigger', e);
        throw e;
    }
}