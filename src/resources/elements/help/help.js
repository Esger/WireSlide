import { bindable } from 'aurelia-framework';

export class Help {
    showHelp() {
        document.querySelector('help dialog').showModal();
    }
}
