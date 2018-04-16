export class IndexArray {

    protected index: number = -1;
    protected size: number;

    constructor(public elements?) {
        this.size = elements !== undefined ? elements.length : 0;
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

    get(index: number) {
        return this.elements[index];
    }
}

export class IndexFloatArray  extends IndexArray {

    constructor(public elements?: Float32Array) {
        super(elements);
    }
}

export class IndexIntArray extends IndexArray {

    constructor(size:number) {
        super(size);
        this.elements = new Uint16Array(size);
    }
}