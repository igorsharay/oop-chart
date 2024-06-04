import { ChunkDataItems } from "./types";
import jsonData from "../data.json";

interface Bar {
  Time: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  TickVolume: number;
}

interface ChartData {
  ChunkStart: number;
  Bars: ChunkDataItems;
}

const canvas = document.getElementById("tradingChart") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Canvas context not available");
}

const chartsData: ChartData[] = jsonData;

// Chart settings
const zoomScale = 0.1;
const maxZoomLevel = 5;
let zoomLevel = 1;
let isDragging = false;
let startX = 0;

const canvasPaddingLeft = 10;
const canvasPaddingTop = 10;
const yAxisOffset = 50;
const xAxisOffset = 30;

const visibleChartHeight = canvas.height - xAxisOffset;
const visibleChartWidth = canvas.width - yAxisOffset;

let barWidth = 20;
let barSpacing = 2;
let barsOffset = 0;

const getVisibleBarsCount = () =>
  Math.floor((visibleChartWidth - canvasPaddingLeft) / (barWidth + barSpacing));

let visibleBarsCount = getVisibleBarsCount();

const getVisibleBars = (): Bar[] =>
  chartsData[0].Bars.slice(barsOffset, barsOffset + visibleBarsCount);

const drawYAxisLabels = (minValue: number, maxValue: number) => {
  ctx.fillStyle = "#727272";
  ctx.font = "12px Arial";
  ctx.strokeStyle = "#e1e1e1";
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 3]);

  const range = maxValue - minValue;

  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const value = minValue + range * (i / steps);
    const y =
      visibleChartHeight -
      canvasPaddingTop * 2 -
      ((value - minValue) / range) *
        (visibleChartHeight - canvasPaddingTop * 2);

    ctx.fillText(value.toFixed(5), visibleChartWidth + 3, y + 4);

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(visibleChartWidth, y);
    ctx.stroke();
  }

  ctx.setLineDash([]);
};

const drawXAxisLabels = (visibleBars: Bar[]) => {
  ctx.fillStyle = "#727272";
  ctx.font = "12px Arial";
  ctx.strokeStyle = "#e1e1e1";
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 3]);

  const showXLabels = 6;

  for (let i = 1; i < showXLabels; i++) {
    const index = Math.floor((i * (visibleBars.length - 1)) / showXLabels);
    const date = new Date(
      (chartsData[0].ChunkStart + visibleBars[index].Time) * 1000
    );

    const dateString = `${date.getDate()}.${date.getMonth()} ${date.getHours()}:${date.getMinutes()}`; //date.toISOString().split("T")[0];

    const x =
      ((visibleChartWidth + barSpacing + barWidth / 2) / showXLabels) * i;

    ctx.fillText(dateString, x - 20, visibleChartHeight + 20);

    ctx.beginPath();
    ctx.moveTo(x, canvasPaddingTop);
    ctx.lineTo(x, visibleChartHeight);
    ctx.stroke();
  }

  ctx.setLineDash([]);
};

// [TO DO] Fix top/bottom bar position
const drawBar = (x: number, bar: Bar, minValue: number, scale: number) => {
  const barX = x + canvasPaddingLeft;
  const height = visibleChartHeight - canvasPaddingTop * 2;

  const openY = height - (bar.Open - minValue) * scale;
  const closeY = height - (bar.Close - minValue) * scale;
  const highY = height - (bar.High - minValue) * scale;
  const lowY = height - (bar.Low - minValue) * scale;

  // Draw the high-low line
  ctx.strokeStyle = bar.Open > bar.Close ? "red" : "green";
  ctx.beginPath();
  ctx.moveTo(barX + barWidth / 2, highY);
  ctx.lineTo(barX + barWidth / 2, lowY);
  ctx.stroke();

  // Draw the open-close rectangle
  ctx.fillStyle = bar.Open > bar.Close ? "red" : "green";
  ctx.fillRect(
    barX,
    Math.min(openY, closeY),
    barWidth,
    Math.abs(openY - closeY)
  );
};

const drawBars = (visibleBars: Bar[], minValue: number, scale: number) => {
  visibleBars.forEach((bar, index) => {
    const x = index * (barWidth + barSpacing);
    drawBar(x, bar, minValue, scale);
  });
};

// Function to draw the chart
const drawChart = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  const visibleBars = getVisibleBars();

  const maxValue = Math.max(...visibleBars.map(d => d.High));
  const minValue = Math.min(...visibleBars.map(d => d.Low));
  const scale =
    (visibleChartHeight - canvasPaddingTop * 2) / (maxValue - minValue);

  drawXAxisLabels(visibleBars);
  drawYAxisLabels(minValue, maxValue);

  drawBars(visibleBars, minValue, scale);
};

// Initial draw
drawChart();

// Mouse events for dragging
const onMouseDown = (e: MouseEvent) => {
  isDragging = true;
  startX = e.clientX;
  canvas.style.cursor = "grabbing";
};

const onMouseMove = (e: MouseEvent) => {
  if (isDragging) {
    const dx = e.clientX - startX;

    barsOffset = Math.max(
      0,
      barsOffset - Math.round(dx / (barWidth + barSpacing))
    );
    startX = e.clientX;

    drawChart();
  }
};
const onMouseUp = () => {
  isDragging = false;
  canvas.style.cursor = "default";
};

// Mouse events for zooming
const onWheel = (e: WheelEvent) => {
  if (e.deltaY < 0) {
    zoomLevel = Math.min(maxZoomLevel, zoomLevel + zoomScale); // Zoom in
  } else {
    zoomLevel = Math.max(1, zoomLevel - zoomScale); // Zoom out
  }

  if (visibleBarsCount > 3) {
    barWidth = barWidth * zoomLevel;
    barSpacing = barSpacing * zoomLevel;
    visibleBarsCount = getVisibleBarsCount();
  }

  drawChart();
};

canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("mouseleave", onMouseUp);
canvas.addEventListener("wheel", onWheel);
