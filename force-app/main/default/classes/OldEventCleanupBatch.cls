public class OldEventCleanupBatch
    implements Database.Batchable<SObject>, Database.Stateful {
    public Integer totalDeleted = 0;    
    // start() – old events fetch    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        Date twoMonthsAgo = System.today().addMonths(-2);
        return Database.getQueryLocator([SELECT Id FROM Event_Mng__c WHERE End__c < :twoMonthsAgo AND Organizer__c != null] );
    }   
    // execute() – delete logic    
    public void execute(Database.BatchableContext bc, List<Event_Mng__c> scope) {
        totalDeleted += scope.size();
        OldEventCleanupHandler.deleteEvents(scope);
    }   
    // finish() – confirmation email    
    public void finish(Database.BatchableContext bc) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(new List<String>{ 'suhaiv@zebratechnosys.com ' });
        mail.setSubject('Batch Execution Completed');
        mail.setPlainTextBody('Old Event Cleanup Batch completed successfully.\n\n' +'Total Events Deleted: ' + totalDeleted + '\n' +'Completed On: ' + System.now()
        );
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ mail }
        );
    }
}