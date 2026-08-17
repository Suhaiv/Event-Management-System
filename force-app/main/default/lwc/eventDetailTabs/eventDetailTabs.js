import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

import getSpeakers from '@salesforce/apex/EventDetailController.getSpeakers';
import getLocation from '@salesforce/apex/EventDetailController.getLocation';
import getAttendees from '@salesforce/apex/EventDetailController.getAttendees';
import EVENT_ID from '@salesforce/schema/Event_Mng__c.Id';
import STATUS_FIELD from '@salesforce/schema/Event_Mng__c.Status__c';

const EVENT_FIELDS = [
    'Event_Mng__c.Name',
    'Event_Mng__c.Status__c',
    'Event_Mng__c.Start__c',
    'Event_Mng__c.End__c',
    'Event_Mng__c.Max_Seats__c',
    'Event_Mng__c.Organizer__c',
    'Event_Mng__c.Location_event__c'
];


export default class EventDetailTabs extends NavigationMixin(LightningElement) {

    @api recordId;

    eventName;
    eventStatus;
    eventStart;
    eventEnd;
    maxSeats;
    organizerName;
    location;
    speakers = [];

    get showPublishButton() {
        return this.eventStatus === 'Created';
    }
    speakerColumns = [
        {
            label: 'Name',
            fieldName: 'name'
        },
        {
            label: 'Email',
            fieldName: 'email'
        },
        {
            label: 'Phone',
            fieldName: 'phone'
        },
        {
            label: 'Company',
            fieldName: 'company'
        }
    ];

    attendees = [];

    attendeeColumns = [
        {
            label: 'Name',
            fieldName: 'name'
        },
        {
            label: 'Email',
            fieldName: 'email'
        },
        {
            label: 'Phone',
            fieldName: 'phone'
        },
        {
            label: 'Company',
            fieldName: 'company'
        }
    ];

    @wire(getRecord, {
        recordId: '$recordId',
        fields: EVENT_FIELDS
    })
    wiredEvent({ data, error }) {

        if (data) {

            this.eventName =
                data.fields.Name?.value;

            this.eventStatus =
                data.fields.Status__c?.value;

            this.eventStart =
                data.fields.Start__c?.value;

            this.eventEnd =
                data.fields.End__c?.value;

            this.maxSeats =
                data.fields.Max_Seats__c?.value;

            this.organizerName =
                data.fields.Organizer__c?.displayValue ||
                data.fields.Organizer__c?.value;

            const locationId =
                data.fields.Location_event__c?.value;


            if (locationId) {

                getLocation({
                    locationId: locationId
                })
                    .then(result => {

                        this.location = result;

                    })
                    .catch(error => {

                        console.error(
                            'Location Error:',
                            error
                        );

                    });

            } else {

                this.location = null;

            }

        }


        if (error) {

            console.error(
                'Event Record Error:',
                error
            );

        }

    }

    connectedCallback() {

        getSpeakers({
            eventId: this.recordId
        })
            .then(result => {

                this.speakers = result.map(record => ({

                    Id: record.Id,

                    name: record.Speaker__r
                        ? record.Speaker__r.Name
                        : '',

                    email: record.Speaker__r
                        ? record.Speaker__r.Email__c
                        : '',

                    phone: record.Speaker__r
                        ? record.Speaker__r.Phone__c
                        : '',

                    company: record.Speaker__r
                        ? record.Speaker__r.Company__c
                        : ''

                }));

            })
            .catch(error => {

                console.error(
                    'Speaker Error:',
                    error
                );

            });

        getAttendees({
            eventId: this.recordId
        })
            .then(result => {

                this.attendees = result.map(record => ({

                    Id: record.Id,

                    name: record.Attendees__r
                        ? record.Attendees__r.Name
                        : '',

                    email: record.Attendees__r
                        ? record.Attendees__r.Email__c
                        : '',

                    phone: record.Attendees__r
                        ? record.Attendees__r.Phone__c
                        : '',

                    company: record.Attendees__r
                        ? record.Attendees__r.Company_Name__c
                        : ''

                }));

            })
            .catch(error => {

                console.error(
                    'Attendee Error:',
                    error
                );

            });

    }

    handlePublish() {

        const fields = {};

        fields[EVENT_ID.fieldApiName] = this.recordId;
        fields[STATUS_FIELD.fieldApiName] = 'Published';

        const recordInput = {
            fields: fields
        };

        updateRecord(recordInput)
            .then(() => {

                // Update UI immediately
                this.eventStatus = 'Published';

            })
            .catch(error => {

                console.error(
                    'Publish Error:',
                    error
                );

            });
    }

    handleNewSpeaker() {

        const defaultValues =
            encodeDefaultFieldValues({

                Event__c: this.recordId

            });


        this[NavigationMixin.Navigate]({

            type: 'standard__objectPage',

            attributes: {

                objectApiName:
                    'Event_Speaker__c',

                actionName:
                    'new'

            },

            state: {

                defaultFieldValues:
                    defaultValues

            }

        });

    }

    handleNewAttendee() {

        const defaultValues =
            encodeDefaultFieldValues({

                Event__c: this.recordId

            });


        this[NavigationMixin.Navigate]({

            type: 'standard__objectPage',

            attributes: {

                objectApiName:
                    'Event_Attendee__c',

                actionName:
                    'new'

            },

            state: {

                defaultFieldValues:
                    defaultValues

            }

        });

    }

}