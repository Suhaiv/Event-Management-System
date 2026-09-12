import { LightningElement, api, wire } from "lwc";

import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";

import STATUS_FIELD from "@salesforce/schema/Event_Mng__c.Status__c";
import REASON_FIELD from "@salesforce/schema/Event_Mng__c.Reason__c";

const FIELDS = [STATUS_FIELD, REASON_FIELD];

export default class EventStatusPath extends LightningElement {
  @api recordId;

  currentStatus;

  showCancelModal = false;
  cancelReason = "";
  showReasonError = false;

  statusOrder = [
    "Created",
    "Published",
    "In Progress",
    "Completed",
    "Post Poned",
    "Cancelled"
  ];

  // ==========================================
  // GET EVENT RECORD
  // ==========================================

  @wire(getRecord, {
    recordId: "$recordId",
    fields: FIELDS
  })
  wiredEvent({ data, error }) {
    if (data) {
      this.currentStatus = getFieldValue(data, STATUS_FIELD);

      console.log("Current Status:", this.currentStatus);
    }

    if (error) {
      console.error("Error loading Event:", error);
    }
  }

  // ==========================================
  // NORMALIZE STATUS
  // ==========================================

  normalize(str) {
    return (str || "").trim().toLowerCase();
  }

  // ==========================================
  // OPEN CANCEL POPUP
  // ==========================================

  openCancelModal() {
    this.showCancelModal = true;

    this.cancelReason = "";

    this.showReasonError = false;
  }

  // ==========================================
  // CLOSE CANCEL POPUP
  // ==========================================

  closeCancelModal() {
    this.showCancelModal = false;

    this.cancelReason = "";

    this.showReasonError = false;
  }

  // ==========================================
  // REASON CHANGE
  // ==========================================

  handleReasonChange(event) {
    this.cancelReason = event.target.value;

    console.log("Reason:", this.cancelReason);

    if (this.cancelReason.trim().length > 0) {
      this.showReasonError = false;
    }
  }

  // ==========================================
  // SAVE CANCELLATION
  // ==========================================

  async saveCancellation() {
    const reason = (this.cancelReason || "").trim();

    console.log("Save clicked");
    console.log("Record Id:", this.recordId);
    console.log("Reason:", reason);

    // Reason required
    if (!reason) {
      this.showReasonError = true;

      return;
    }

    try {
      const fields = {};

      // Record Id
      fields.Id = this.recordId;

      // Status = Cancelled
      fields[STATUS_FIELD.fieldApiName] = "Cancelled";

      // Cancellation Reason
      fields[REASON_FIELD.fieldApiName] = reason;

      console.log("Fields to update:", JSON.stringify(fields));

      // Update Salesforce Record
      await updateRecord({
        fields: fields
      });

      console.log("Event cancelled successfully");

      // Update Path immediately
      this.currentStatus = "Cancelled";

      // Close popup
      this.showCancelModal = false;

      this.cancelReason = "";

      this.showReasonError = false;
    } catch (error) {
      console.error("ERROR WHILE SAVING:", JSON.stringify(error));

      console.error("ERROR MESSAGE:", error?.body?.message);
    }
  }

  // ==========================================
  // CANCEL BUTTON DISABLED
  // ==========================================

  get isCancelDisabled() {
    return this.currentStatus === "Cancelled";
  }

  // ==========================================
  // STATUS PATH
  // ==========================================

  get steps() {
    const currentNorm = this.normalize(this.currentStatus);

    const currentIndex = this.statusOrder.findIndex(
      (status) => this.normalize(status) === currentNorm
    );

    if (currentIndex === -1 && this.currentStatus) {
      console.warn(
        'Status__c value "' +
          this.currentStatus +
          '" statusOrder mein nahi mila.'
      );
    }

    return this.statusOrder.map((status, index) => {
      let className = "step future";

      let showCheck = false;

      const statusNorm = this.normalize(status);

      // ==================================
      // CANCELLED
      // ==================================

      if (currentNorm === "cancelled") {
        const cancelledIndex = this.statusOrder.findIndex(
          (s) => this.normalize(s) === "cancelled"
        );

        if (statusNorm === "cancelled") {
          className = "step cancelled";
        } else if (index < cancelledIndex) {
          className = "step completed";

          showCheck = true;
        }
      }

      // ==================================
      // POST PONED
      // ==================================
      else if (currentNorm === "post poned") {
        const postponedIndex = this.statusOrder.findIndex(
          (s) => this.normalize(s) === "post poned"
        );

        if (statusNorm === "post poned") {
          className = "step postponed";
        } else if (index < postponedIndex) {
          className = "step completed";

          showCheck = true;
        }
      }

      // ==================================
      // NORMAL STATUS
      // ==================================
      else {
        if (index < currentIndex) {
          className = "step completed";

          showCheck = true;
        } else if (index === currentIndex) {
          className = "step active";
        }
      }

      return {
        label: status,

        value: status,

        className: className,

        showCheck: showCheck
      };
    });
  }
}
