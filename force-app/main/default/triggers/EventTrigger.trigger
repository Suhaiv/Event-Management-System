trigger EventTrigger on Event_Mng__c (before insert, before update) {
  EventTriggerHandler.validateLocationAvailability(Trigger.new);
}