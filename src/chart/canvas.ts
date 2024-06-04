import { ILabelStyles, ILineStyles } from "./types.d";

export default class Canvas {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvasId: string) {
    const canvasElement = document.getElementById(canvasId);

    if (!canvasElement) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    if (!this.ctx) {
      throw new Error("Canvas context not available");
    }
  }

  getContext() {
    return this.ctx;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getWidth() {
    return this.canvas.width;
  }

  getHeight() {
    return this.canvas.height;
  }

  changeCanvasCursor(cursor: string) {
    this.canvas.style.cursor = cursor;
  }

  getHTMLCanvasElement() {
    return this.canvas;
  }

  drawLine(
    moveTo: { x: number; y: number },
    lineTo: { x: number; y: number },
    styles: ILineStyles
  ) {
    this.ctx.strokeStyle = styles.color;
    this.ctx.lineWidth = styles.thickness;

    this.ctx.beginPath();
    this.ctx.moveTo(moveTo.x, moveTo.y);
    this.ctx.lineTo(lineTo.x, lineTo.y);
    this.ctx.stroke();
  }

  drawDashedLine(
    moveTo: { x: number; y: number },
    lineTo: { x: number; y: number },
    styles: ILineStyles
  ) {
    this.ctx.setLineDash(styles?.dashSize || []);

    this.drawLine(moveTo, lineTo, styles);

    this.ctx.setLineDash([]);
  }

  drawText(
    text: string,
    moveTo: { x: number; y: number },
    styles: ILabelStyles
  ) {
    this.ctx.fillStyle = styles.color;
    this.ctx.font = styles.font;

    this.ctx.fillText(text, moveTo.x, moveTo.y);
  }

  drawRect(
    moveTo: { x: number; y: number },
    size: { width: number; height: number },
    color: string
  ) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(moveTo.x, moveTo.y, size.width, size.height);
  }
}
