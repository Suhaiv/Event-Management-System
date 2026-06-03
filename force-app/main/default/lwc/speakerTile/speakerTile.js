import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Speaker__c.Name',
    'Speaker__c.Email__c',
    'Speaker__c.Phone__c',
    'Speaker__c.Profile_URL__c',
    'Speaker__c.About_Me__c'
];

export default class SpeakerTile extends LightningElement {

    @api recordId;

    name;
    email;
    phone;
    profileUrl;
    aboutMe;

    defaultImage = 'https://www.w3schools.com/howto/img_avatar.png';

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredSpeaker({ data }) {
        if (data) {
            this.name = data.fields.Name.value;
            this.email = data.fields.Email__c?.value;
            this.phone = data.fields.Phone__c?.value;
            this.aboutMe = data.fields.About_Me__c?.value;

            // ⭐ IMPORTANT FIX
            this.profileUrl =
                data.fields.Profile_URL__c?.value
                ? data.fields.Profile_URL__c.value
                : this.defaultImage;
        }
    }
}