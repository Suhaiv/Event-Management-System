import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import EVENT_Object from '@salesforce/schema/Event_Mng__c';
import Name_Object from '@salesforce/schema/Event_Mng__c.Name__c';
import ORGANIZER_Object from '@salesforce/schema/Event_Mng__c.Organizer__c';
import START_Object from '@salesforce/schema/Event_Mng__c.Start__c';
import END_Object from '@salesforce/schema/Event_Mng__c.End__c';
import LOCATION_Object from '@salesforce/schema/Event_Mng__c.Location_event__c';
import MAXSEAT_Object from '@salesforce/schema/Event_Mng__c.Max_Seats__c';

export default class CreateRecordOnPlayers extends LightningElement {

    objectApiName = EVENT_Object;
    fieldName = Name_Object;
    fieldOrganizer = ORGANIZER_Object;
    fieldStart = START_Object;
    fieldEnd = END_Object;
    fieldLocation = LOCATION_Object;
    fieldMaxseat = MAXSEAT_Object;
   

   

    outsideClickEnabled = false; 

    openModal(event) {
        event.stopPropagation();      
        this.variable = true;

       
        setTimeout(() => {
            this.outsideClickEnabled = true;
        }, 0);
    }

    connectedCallback() {
        this.handleWindowClick = this.handleWindowClick.bind(this);
        window.addEventListener('click', this.handleWindowClick);
    }

    disconnectedCallback() {
        window.removeEventListener('click', this.handleWindowClick);
    }

    handleWindowClick() {
        if (this.variable && this.outsideClickEnabled) {
            this.variable = false;          
            this.outsideClickEnabled = false;
        }
    }

    stopPropagation(event) {
        event.stopPropagation(); 
    }

    
    click() {
        const fieldLocation = this.template.querySelector(
            'lightning-input-field[data-id="amount"]'
        );

        const amountValue = fieldLocation?.value;

        if (!amountValue) {
            this.showErrorToast();
        } else {
            this.showSuccessToast();
        }
    }

    showSuccessToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success!',
                message: 'Your record has been saved.',
                variant: 'success'
            })
        );
    }

    showErrorToast() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Location is required.',
                variant: 'error',
                mode: 'sticky'
            })
        );
    }
}