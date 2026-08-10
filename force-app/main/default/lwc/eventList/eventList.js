import { LightningElement, track } from 'lwc';
import getLiveEvents from '@salesforce/apex/EventListController.getLiveEvents';

const ICON_STYLES = [
    { icon: 'utility:like', bg: '#efe9fd', color: '#7c5cd4' },
    { icon: 'utility:apps', bg: '#e3f0fd', color: '#0176d3' },
    { icon: 'utility:user', bg: '#fdf1de', color: '#c17a1c' },
    { icon: 'utility:apex', bg: '#f2f3f4', color: '#5a6673' }
];

export default class EventList extends LightningElement {

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

            this.eventData = result.map((row, index) => {

                const style = ICON_STYLES[index % ICON_STYLES.length];

                return {
                    Id: row.Id,
                    recordUrl: '/' + row.Id,
                    eventName: row.Name__c,
                    Start__c: row.Start__c,
                    Event_Type__c: row.Event_Type__c,
                    locationName: row.Location_event__r
                        ? row.Location_event__r.Name
                        : '',
                    formattedDate: this.formatDate(row.Start__c),
                    iconName: style.icon,
                    iconBg: `background-color: ${style.bg}; --sds-c-icon-color-foreground-default: ${style.color};`,
                    badgeClass: (row.Event_Type__c || '').trim().toLowerCase() === 'in-person'
                        ? 'badge badge-inperson'
                        : 'badge badge-virtual'
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

    formatDate(value) {

        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    get totalEvents() {
        return this.eventData.length;
    }

    get inPersonCount() {
        return this.eventData.filter(
            e => (e.Event_Type__c || '').trim().toLowerCase() === 'in-person'
        ).length;
    }

    get thisWeekCount() {

        const now = new Date();
        const weekAhead = new Date();
        weekAhead.setDate(now.getDate() + 7);

        return this.eventData.filter(e => {
            const start = new Date(e.Start__c);
            return start >= now && start <= weekAhead;
        }).length;
    }

    get hasEvents() {
        return this.eventData.length > 0;
    }

    get locationSummary() {

        const locations = [...new Set(
            this.eventData
                .map(e => e.locationName)
                .filter(name => !!name)
        )];

        if (locations.length === 0) {
            return '';
        }

        if (locations.length === 1) {
            return locations[0];
        }

        return locations.length + ' locations';
    }
}