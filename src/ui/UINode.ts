let UINODE_ID = 0;
export class UINode {
    id: number;
    constructor() {
        this.id = ++UINODE_ID;
    }
}