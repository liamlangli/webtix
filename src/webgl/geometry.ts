import { BufferArray, ObjectMap } from "../types";

export interface Attribute {
    name: string;
    itemSize: number;
    array: BufferArray;
    slot?: number; // gpu vertex attribute location, if it's empty use set order.
}

export class Geometry {
    private attributeMap: ObjectMap<Attribute> = {};
    private attributes: Attribute[] = [];

    index?: Attribute;

    setAttribute(attribute: Attribute): void {
        this.attributeMap[attribute.name] = attribute;
        this.attributes.push(attribute);
    }

    getAttribute(name: string): Attribute | undefined {
        return this.attributeMap[name];
    }
}
