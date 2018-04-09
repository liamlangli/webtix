export class IndexArray {

    elements;
    protected index: number = -1;
    protected size: number;

    constructor(size:number) {
        this.size = size;
    }

    push(element) {
        if(this.index + 1 >= this.size) {
            throw 'out of bounds';
        }

        ++this.index;
    }

    capacity():number {
        return this.size; 
    }

    payload():number {
        return this.index;
    }

    clear() {
        this.index = -1;
    }
}

export class IndexFloatArray  extends IndexArray {

    constructor(size:number) {
        super(size);
        this.elements = new Float32Array(size);
    }
}

export class IndexIntArray extends IndexArray {

    constructor(size:number) {
        super(size);
        this.elements = new Uint16Array(size);
    }
}