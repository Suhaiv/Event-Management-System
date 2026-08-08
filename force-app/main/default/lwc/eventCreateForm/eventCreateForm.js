import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import EVENT_Object from '@salesforce/schema/Event_Mng__c';
import Name_Object from '@salesforce/schema/Event_Mng__c.Name__c';
import ORGANIZER_Object from '@salesforce/schema/Event_Mng__c.Organizer__c';
import START_Object from '@salesforce/schema/Event_Mng__c.Start__c';
import END_Object from '@salesforce/schema/Event_Mng__c.End__c';
import LOCATION_Object from '@salesforce/schema/Event_Mng__c.Location_event__c';
import MAXSEAT_Object from '@salesforce/schema/Event_Mng__c.Max_Seats__c';
import LIVE_Object from '@salesforce/schema/Event_Mng__c.Live__c';
import EVENTTYPE_Object from '@salesforce/schema/Event_Mng__c.Event_Type__c';

export default class CreateRecordOnPlayers extends LightningElement {

    objectApiName = EVENT_Object;

    fieldName = Name_Object;
    fieldOrganizer = ORGANIZER_Object;
    fieldStart = START_Object;
    fieldEnd = END_Object;
    fieldLocation = LOCATION_Object;
    fieldMaxseat = MAXSEAT_Object;
    fieldLive = LIVE_Object;
    fieldEventType = EVENTTYPE_Object;

    isLoading = false;

    click() {

        const fields = [
            { id: 'name', label: 'Name' },
            { id: 'organizer', label: 'Organizer' },
            { id: 'start', label: 'Start' },
            { id: 'end', label: 'End' },
            { id: 'location', label: 'Location' },
            { id: 'maxSeats', label: 'Max Seats' },
            { id: 'eventType', label: 'Event Type' },
            { id: 'live', label: 'Live' }
        ];

        let missingFields = [];

        fields.forEach(item => {

            const field = this.template.querySelector(
                `lightning-input-field[data-id="${item.id}"]`
            );

            if (!field || !field.value) {
                missingFields.push(`${item.label} is required.`);
            }
        });

        if (missingFields.length > 0) {

            this.showErrorToast(
                missingFields.join('\n')
            );

            return;
        }

        this.isLoading = true;

        const form = this.template.querySelector(
            'lightning-record-edit-form'
        );

        form.submit();
    }

    showErrorToast(message) {

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error',
                mode: 'dismissable'
            })
        );
    }

    handleSuccess() {

        this.isLoading = false;

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Record Created Successfully',
                variant: 'success'
            })
        );

        this.template
            .querySelectorAll('lightning-input-field')
            .forEach(field => {
                field.reset();
            });

        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    handleError(event) {

        this.isLoading = false;

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: event.detail.detail || event.detail.message,
                variant: 'error',
                mode: 'sticky'
            })
        );
    }

    handleCancel() {

        this.isLoading = false;

        this.template
            .querySelectorAll('lightning-input-field')
            .forEach(field => {
                field.reset();
            });
    }
}