import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

import getSpeakers from '@salesforce/apex/EventDetailController.getSpeakers';
import getLocation from '@salesforce/apex/EventDetailController.getLocation';
import getAttendees from '@salesforce/apex/EventDetailController.getAttendees';

const EVENT_FIELDS = ['Event_Mng__c.Location_event__c'];

export default class EventDetailTabs extends NavigationMixin(LightningElement) {

    @api recordId;

    speakers = [];
    attendees = [];
    location;

    speakerColumns = [
        { label: 'Name', fieldName: 'name' },
        { label: 'Email', fieldName: 'email' },
        { label: 'Phone', fieldName: 'phone' },
        { label: 'Company', fieldName: 'company' }
    ];

    attendeeColumns = [
        { label: 'Name', fieldName: 'name' },
        { label: 'Email', fieldName: 'email' },
        { label: 'Phone', fieldName: 'phone' },
        { label: 'Company', fieldName: 'company' }
    ];

    // 🔹 Get Location using LDS
    @wire(getRecord, { recordId: '$recordId', fields: EVENT_FIELDS })
    wiredEvent({ data }) {
        if (data) {
            const locationId = data.fields.Location_event__c.value;
            if (locationId) {
                getLocation({ locationId })
                    .then(res => this.location = res)
                    .catch(err => console.error(err));
            }
        }
    }

    connectedCallback() {

        // 🔹 Load Speakers
        getSpeakers({ eventId: this.recordId })
            .then(res => {
                this.speakers = res.map(r => ({
                    Id: r.Id,
                    name: r.Speaker__r.Name,
                    email: r.Speaker__r.Email__c,
                    phone: r.Speaker__r.Phone__c,
                    company: r.Speaker__r.Company__c
                }));
            })
            .catch(err => console.error(err));

        // 🔹 Load Attendees
        getAttendees({ eventId: this.recordId })
            .then(res => {
                this.attendees = res.map(r => ({
                    Id: r.Id,
                    name: r.Attendees__r.Name,
                    email: r.Attendees__r.Email__c,
                    phone: r.Attendees__r.Phone__c,
                    company: r.Attendees__r.Company_Name__c
                }));
            })
            .catch(err => console.error(err));
    }

    // 🔴 NEW SPEAKER BUTTON ACTION
    handleNewSpeaker() {

        const defaultValues = encodeDefaultFieldValues({
            Event__c: this.recordId
        });

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Event_Speaker__c',
                actionName: 'new'
            },
            state: {
                defaultFieldValues: defaultValues
            }
        });
    }

    // 🔴 NEW ATTENDEE BUTTON ACTION
    handleNewAttendee() {

        const defaultValues = encodeDefaultFieldValues({
            Event__c: this.recordId
        });

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Event_Attendee__c',
                actionName: 'new'
            },
            state: {
                defaultFieldValues: defaultValues
            }
        });
    }
}