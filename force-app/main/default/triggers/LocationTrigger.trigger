trigger LocationTrigger on Location_event__c (after insert, after update) {

    Set<Id> locIds = new Set<Id>();

    for (Location_event__c loc : Trigger.new) {
        Location_event__c oldLoc =
            Trigger.isUpdate ? Trigger.oldMap.get(loc.Id) : null;

        if (Trigger.isInsert ||
            (Trigger.isUpdate &&
            (loc.Street__c != oldLoc.Street__c ||
             loc.City__c != oldLoc.City__c ||
             loc.State__c != oldLoc.State__c ||
             loc.Postal_Code__c != oldLoc.Postal_Code__c))) {

            locIds.add(loc.Id);
        }
    }

    if (!locIds.isEmpty()) {
        System.enqueueJob(
            new LocationAddressQueueable(locIds)
        );
    }
}