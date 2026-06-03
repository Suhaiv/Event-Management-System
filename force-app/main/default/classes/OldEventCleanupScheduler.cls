public class OldEventCleanupScheduler
implements Schedulable {

    public void execute(SchedulableContext sc) {

        OldEventCleanupBatch batch =
            new OldEventCleanupBatch();

        Database.executeBatch(batch, 200);
    }
}