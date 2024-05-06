export function snapshot_save_canvas(
    canvas: HTMLCanvasElement,
    title: string = "sample.png",
): void {
    const a = document.createElement("a") as HTMLAnchorElement;
    a.href = canvas.toDataURL("image/png");
    a.download = title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
