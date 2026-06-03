public class LocationAddressQueueable
implements Queueable, Database.AllowsCallouts {
    
    private Set<Id> locationIds;
    
    public LocationAddressQueueable(Set<Id> locationIds) {
        this.locationIds = locationIds;
    }
    
    public void execute(QueueableContext qc) {
        
        List<Location_event__c> locations = [SELECT Id, Street__c, City__c, State__c, Postal_Code__c FROM Location_event__c WHERE Id IN :locationIds];
        
        List<Location_event__c> updates = new List<Location_event__c>();
        
        for (Location_event__c loc : locations) {
                Boolean verified = NominatimLocationService.verifyAddress(
                loc.Street__c,
                loc.City__c,
                loc.State__c,
                loc.Postal_Code__c
            );
            
            
            updates.add(new Location_event__c(
                Id = loc.Id,
                Verified__c = verified
            ));
        }
        
        if (!updates.isEmpty()) {
            update updates;
        }
    }
}