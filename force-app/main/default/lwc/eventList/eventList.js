import { LightningElement, track } from 'lwc';
import getLiveEvents from '@salesforce/apex/EventListController.getLiveEvents';

const COLUMNS = [
    {
        label: 'Event Name',
        fieldName: 'recordUrl',
        type: 'url',
        typeAttributes: {
            label: {
                fieldName: 'eventName'
            },
            target: '_self'
        }
    },
    {
        label: 'Start Date',
        fieldName: 'Start__c',
        type: 'date'
    },
    {
        label: 'Status',
        fieldName: 'Status__c',
        type: 'text'
    },
    {
        label: 'Location',
        fieldName: 'locationName',
        type: 'text'
    }
];

export default class EventList extends LightningElement {

    columns = COLUMNS;

    @track eventData = [];

    searchKey = '';

    connectedCallback() {
        this.loadEvents();
    }

    loadEvents() {

        getLiveEvents({
            searchKey: this.searchKey
        })
        .then(result => {

            this.eventData = result.map(row => {

                return {
                    Id: row.Id,
                    recordUrl: '/' + row.Id,
                    eventName: row.Name__c,
                    Start__c: row.Start__c,
                    Status__c: row.Status__c,
                    locationName: row.Location_event__r
                        ? row.Location_event__r.Name
                        : ''
                };

            });

        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    handleSearch(event) {

        this.searchKey = event.target.value;

       if (this.searchKey.trim() === '') {
        this.loadEvents();
    }
    }

searchEvents() {

    this.loadEvents();

}
}