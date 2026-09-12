import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue, updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

// Schema Field Imports
import STATUS_FIELD from "@salesforce/schema/Event_Mng__c.Status__c";
import REASON_FIELD from "@salesforce/schema/Event_Mng__c.Reason__c";
import START_FIELD from "@salesforce/schema/Event_Mng__c.Start__c";
import END_FIELD from "@salesforce/schema/Event_Mng__c.End__c";
import LOCATION_FIELD from "@salesforce/schema/Event_Mng__c.Location_event__c";
import EVENT_TYPE_FIELD from "@salesforce/schema/Event_Mng__c.Event_Type__c";

// Fields required to load the record data
const FIELDS = [
  STATUS_FIELD,
  REASON_FIELD,
  START_FIELD,
  END_FIELD,
  LOCATION_FIELD,
  EVENT_TYPE_FIELD
];

export default class EventStatusPath extends LightningElement {
  @api recordId;

  currentStatus;
  showCancelModal = false;
  cancelReason = "";
  showReasonError = false;
  showPostponeModal = false;

  // Field references exposed for template usage
  START_FIELD = START_FIELD;
  END_FIELD = END_FIELD;
  LOCATION_FIELD = LOCATION_FIELD;
  REASON_FIELD = REASON_FIELD;
  EVENT_TYPE_FIELD = EVENT_TYPE_FIELD;

  statusOrder = [
    "Created",
    "Published",
    "In Progress",
    "Completed",
    "Post Poned",
    "Cancelled"
  ];

  // Load event record data using UI API wire service
  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  wiredEvent({ data, error }) {
    if (data) {
      this.currentStatus = getFieldValue(data, STATUS_FIELD);
      console.log("Current Status:", this.currentStatus);
    }
    if (error) {
      console.error("Error loading Event:", error);
    }
  }

  // Helper method to normalize string comparison
  normalize(str) {
    return (str || "").trim().toLowerCase();
  }

  // Modal Control Handlers
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

  openPostponeModal() {
    this.showPostponeModal = true;
  }

  closePostponeModal() {
    this.showPostponeModal = false;
  }

  // Handle input change on cancel reason textarea
  handleReasonChange(event) {
    this.cancelReason = event.target.value;
    if (this.cancelReason.trim().length > 0) {
      this.showReasonError = false;
    }
  }

  // Save cancellation updates to record
  async saveCancellation() {
    const reason = (this.cancelReason || "").trim();

    if (!reason) {
      this.showReasonError = true;
      return;
    }

    try {
      const fields = {};
      fields.Id = this.recordId;
      fields[STATUS_FIELD.fieldApiName] = "Cancelled";
      fields[REASON_FIELD.fieldApiName] = reason;

      await updateRecord({ fields });

      this.currentStatus = "Cancelled";
      this.showCancelModal = false;
      this.cancelReason = "";
      this.showReasonError = false;

      this.showToast("Success", "Event cancelled successfully.", "success");
    } catch (error) {
      console.error("ERROR WHILE SAVING:", JSON.stringify(error));
      this.showToast(
        "Error",
        error?.body?.message || "Unable to cancel the event.",
        "error"
      );
    }
  }

  // Handle postpone form submission logic and date validation
  handlePostponeSubmit(event) {
    event.preventDefault();
    const fields = event.detail.fields;

    const startValue = fields[START_FIELD.fieldApiName];
    const endValue = fields[END_FIELD.fieldApiName];

    if (startValue && endValue) {
      const startDate = new Date(startValue);
      const endDate = new Date(endValue);

      if (endDate <= startDate) {
        this.showToast(
          "Error",
          "End date/time must be later than Start date/time.",
          "error"
        );
        return;
      }
    }

    fields[STATUS_FIELD.fieldApiName] = "Post Poned";

    const form = this.template.querySelector("lightning-record-edit-form");
    if (form) {
      form.submit(fields);
    }
  }

  // Handle successful record postpone update
  handlePostponeSuccess(event) {
    console.log("Event postponed successfully:", event.detail.id);
    this.currentStatus = "Post Poned";
    this.showPostponeModal = false;
    this.showToast("Success", "Event postponed successfully.", "success");
  }

  // Handle errors during postpone submission
  handlePostponeError(event) {
    console.error("Error while postponing event:", event.detail);
    let message = "Unable to postpone the event.";
    if (event.detail && event.detail.detail) {
      message = event.detail.detail;
    }
    this.showToast("Error", message, "error");
  }

  // CANCEL BUTTON DISABLED
  get isCancelDisabled() {
    const status = this.normalize(this.currentStatus);

    return status === "cancelled" || status === "completed";
  }

  get isPostponeDisabled() {
    const status = this.normalize(this.currentStatus);
    return (
      status === "cancelled" ||
      status === "completed" ||
      status === "post poned"
    );
  }

  // Toast utility notification helper
  showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }

  // Getter to dynamically build step statuses for path UI
  get steps() {
    const currentNorm = this.normalize(this.currentStatus);
    const currentIndex = this.statusOrder.findIndex(
      (status) => this.normalize(status) === currentNorm
    );

    if (currentIndex === -1 && this.currentStatus) {
      console.warn(
        `Status__c value "${this.currentStatus}" statusOrder mein nahi mila.`
      );
    }

    return this.statusOrder.map((status, index) => {
      let className = "step future";
      let showCheck = false;
      const statusNorm = this.normalize(status);

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
      } else if (currentNorm === "post poned") {
        const postponedIndex = this.statusOrder.findIndex(
          (s) => this.normalize(s) === "post poned"
        );
        if (statusNorm === "post poned") {
          className = "step postponed";
        } else if (index < postponedIndex) {
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
        className,
        showCheck
      };
    });
  }
}
