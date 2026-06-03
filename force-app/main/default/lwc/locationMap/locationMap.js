import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Event_Mng__c.Location_event__r.Street__c',
    'Event_Mng__c.Location_event__r.City__c',
    'Event_Mng__c.Location_event__r.State__c',
    'Event_Mng__c.Location_event__r.Country__c'
];

export default class LocationMap extends LightningElement {

    @api recordId;
    mapMarkers = [];

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            const location = data.fields.Location_event__r.value.fields;

            this.mapMarkers = [
                {
                    location: {
                        Street: location.Street__c.value,
                        City: location.City__c.value,
                        State: location.State__c.value,
                        Country: location.Country__c.value
                    },
                    title: 'Event Location'
                }
            ];
        }
    }
}