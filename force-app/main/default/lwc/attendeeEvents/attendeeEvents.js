import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getUpcomingEvents from '@salesforce/apex/AttendeeEventsController.getUpcomingEvents';
import getPastEvents from '@salesforce/apex/AttendeeEventsController.getPastEvents';

export default class AttendeeEvents extends NavigationMixin(LightningElement) {

    @api recordId; // Attendee Id

    upcomingEvents = [];
    pastEvents = [];

    columns = [
        {
            label: 'Event Name',
            fieldName: 'Name',
            type: 'button',
            typeAttributes: {
                label: { fieldName: 'Name' },
                name: 'view',
                variant: 'base'
            }
        },
        { label: 'Start Date', fieldName: 'Start__c', type: 'date' },
        { label: 'End Date', fieldName: 'End__c', type: 'date' },
        { label: 'Status', fieldName: 'Status__c' }
    ];

    connectedCallback() {
        this.loadUpcomingEvents();
        this.loadPastEvents();
    }

    loadUpcomingEvents() {
        getUpcomingEvents({ attendeeId: this.recordId })
            .then(result => {
                this.upcomingEvents = result;
            })
            .catch(error => {
                console.error(error);
            });
    }

    loadPastEvents() {
        getPastEvents({ attendeeId: this.recordId })
            .then(result => {
                this.pastEvents = result;
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleRowAction(event) {
        const recordId = event.detail.row.Id;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Event_Mng__c',
                actionName: 'view'
            }
        });
    }
}