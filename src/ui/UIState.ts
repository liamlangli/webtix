import { Vector2 } from '../math/Vector2';
import { MouseButton } from './Mouse';

export class UIState {
    private static instance;

    public static Instance(): UIState {
        if (UIState.instance === undefined) {
            UIState.instance = new UIState();
        }
        return UIState.instance;
    }

    origin: Vector2 = new Vector2();
    mousePosition: Vector2 = new Vector2();
    mouseButton: MouseButton = MouseButton.None;

    hotId: number = -1;
    activeId: number = -1;

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor() {}

    setCanvas(canvas: HTMLCanvasElement): UIState {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        return this;
    }
}