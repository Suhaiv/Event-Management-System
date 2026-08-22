import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";
import REASON_FIELD from "@salesforce/schema/Event_Mng__c.Reason__c";

import STATUS_FIELD from "@salesforce/schema/Event_Mng__c.Status__c";

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

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  wiredEvent({ data, error }) {
    if (data) {
      this.currentStatus = getFieldValue(data, STATUS_FIELD);
    }
    if (error) {
      console.error("Error loading Event:", error);
    }
  }

  normalize(str) {
    return (str || "").trim().toLowerCase();
  }

  openCancelModal() {
    this.showCancelModal = true;

    this.cancelReason = "";

    this.showReasonError = false;
  }
  closeCancelModal() {
    this.showCancelModal = false;

    this.cancelReason = "";

    this.showReasonError = false;
  }

  async saveCancellation() {
    // Reason required
    if (!this.cancelReason || !this.cancelReason.trim()) {
      this.showReasonError = true;

      return;
    }

    try {
      const fields = {
        Id: this.recordId
      };

      // Status = Cancelled
      fields[STATUS_FIELD.fieldApiName] = "Cancelled";

      // Reason save
      fields[REASON_FIELD.fieldApiName] = this.cancelReason.trim();

      await updateRecord({
        fields: fields
      });

      // Update UI immediately
      this.currentStatus = "Cancelled";

      // Close popup
      this.showCancelModal = false;

      this.cancelReason = "";

      this.showReasonError = false;
    } catch (error) {
      console.error("Error cancelling Event:", error);
    }
  }
  get isCancelDisabled() {
    return this.currentStatus === "Cancelled";
  }
  get steps() {
    const currentNorm = this.normalize(this.currentStatus);

    const currentIndex = this.statusOrder.findIndex(
      (status) => this.normalize(status) === currentNorm
    );

    // Agar match hi nahi mila, matlab data abhi load ho raha hai
    // ya picklist value statusOrder se alag hai — console me warning do
    if (currentIndex === -1 && this.currentStatus) {
      console.warn(
        'Status__c value "' +
          this.currentStatus +
          '" statusOrder array me nahi mila. Spelling/case check karo.'
      );
    }

    return this.statusOrder.map((status, index) => {
      let className = "step future";
      let showCheck = false;
      const statusNorm = this.normalize(status);

      if (currentNorm === "cancelled") {
        if (statusNorm === "cancelled") {
          className = "step cancelled";
        } else if (
          index <
          this.statusOrder.findIndex((s) => this.normalize(s) === "cancelled")
        ) {
          className = "step completed";
          showCheck = true;
        }
      } else if (currentNorm === "post poned") {
        if (statusNorm === "post poned") {
          className = "step postponed";
        } else if (
          index <
          this.statusOrder.findIndex((s) => this.normalize(s) === "post poned")
        ) {
          className = "step completed";
          showCheck = true;
        }
      } else {
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
