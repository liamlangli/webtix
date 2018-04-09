import { Accelerator } from "../accelerator/Accelerator";
import { OBJData } from "../../utils/OBJLoader";

export class Scene {

    constructor(public data:OBJData, public accelerator: Accelerator) {
        accelerator.feed(data.data);
    }

}