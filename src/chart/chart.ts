import Canvas from "./canvas";
import { getFormatedDate } from "./datetime.helper";
import {
  IChartDataChunk,
  ChunkDataItems,
  IChartOptions,
  IChunkDataItem,
  IDataElementSize,
} from "./types.d";

const chartDefaultOptions: IChartOptions = {
  zoomScale: 1,
  minZoomLevel: 1,
  maxZoomLevel: 8,
  zoomLevel: 1,
  canvasPaddingLeft: 10,
  canvasPaddingTop: 10,

  xAxios: {
    offset: 30,
    label: {
      color: "#727272",
      font: "12px Arial",
    },
    line: {
      color: "#e1e1e1",
      thickness: 1,
      dashSize: [8, 3],
    },
  },
  yAxios: {
    offset: 50,
    label: {
      color: "#727272",
      font: "12px Arial",
    },
    line: {
      color: "#e1e1e1",
      thickness: 1,
      dashSize: [8, 3],
    },
  },
  dataElementSize: { width: 4, spacing: 1 },
};

export default abstract class Chart {
  readonly chartCanvas: Canvas;
  options: IChartOptions;

  dataset: IChartDataChunk[];
  protected viewedData: ChunkDataItems = [];
  protected chunkIndex = 0;
  protected chunkDataItemsOffset = 0;
  protected dataItemsOffset = 0;
  protected visibleDataElementsCount = 0;
  protected datasetDataItemsLength = 0;

  protected isDragging = false;
  protected startDragPositionX = 0;
  protected isRequestAnimationFrame = true;

  protected currentZoomLevel: number;
  protected currentDataElementSize: IDataElementSize;

  protected chartView: {
    width: number;
    height: number;
  };

  constructor(
    chartId: string,
    dataset: IChartDataChunk[],
    options?: Partial<IChartOptions>
  ) {
    this.chartCanvas = new Canvas(chartId);
    this.dataset = dataset;
    this.options = { ...chartDefaultOptions, ...options };
    this.currentZoomLevel = this.options.zoomLevel;
    this.currentDataElementSize = { ...this.options.dataElementSize };

    this.chartView = this.updatedChartView();
    this.visibleDataElementsCount = this.calcVisibleDataElementsCount();
    this.datasetDataItemsLength = this.getDatasetItemsLength();
  }

  abstract initialize(): void;
  abstract reInitialize(): void;
  abstract render(): void;
  abstract zoomRender(): void;
  abstract drawDataElement(
    x: number,
    dataItem: IChunkDataItem,
    minValue: number,
    scale: number
  ): void;
  abstract drawVisibleDataElements(
    visibleDataItems: ChunkDataItems,
    minValue: number,
    scale: number
  ): void;
  abstract onMouseMove(e: MouseEvent): void;
  abstract onWheel(e: WheelEvent): void;

  setDataset(data: IChartDataChunk[]) {
    this.dataset = data;
  }

  clearView() {
    this.chartCanvas.clearCanvas();
  }

  updatedChartView() {
    return {
      width: this.chartCanvas.getWidth() - this.options.yAxios.offset,
      height: this.chartCanvas.getHeight() - this.options.xAxios.offset,
    };
  }

  drawXAxisLabels(visibleDataItems: ChunkDataItems) {
    const xLabelPaddingLeft = 28;
    const xLabelPaddingTop = 20;
    const steps = 6;

    const { xAxios } = this.options;

    for (let i = 1; i < steps; i++) {
      const index = Math.floor((i * (visibleDataItems.length - 1)) / steps);
      const date = new Date(visibleDataItems[index]?.Time * 1000);

      const dateString = getFormatedDate(date);

      const x =
        ((this.chartView.width +
          this.currentDataElementSize.spacing +
          this.currentDataElementSize.width / 2) /
          steps) *
        i;

      this.chartCanvas.drawText(
        dateString,
        {
          x: x - xLabelPaddingLeft,
          y: this.chartView.height + xLabelPaddingTop,
        },
        xAxios.label
      );

      this.chartCanvas.drawDashedLine(
        { x, y: 0 },
        { x, y: this.chartView.height },
        xAxios.line
      );
    }
  }

  drawYAxisLabels(minValue: number, maxValue: number) {
    const yLabelPaddingLeft = 3;
    const yLabelPaddingTop = 4;
    const steps = 10;
    const range = maxValue - minValue;

    const { yAxios, canvasPaddingTop } = this.options;

    for (let i = 0; i <= steps; i++) {
      const value = minValue + range * (i / steps);
      const y =
        this.chartView.height -
        canvasPaddingTop * 2 -
        ((value - minValue) / range) *
          (this.chartView.height - canvasPaddingTop * 2);

      this.chartCanvas.drawText(
        value.toFixed(5),
        {
          x: this.chartView.width + yLabelPaddingLeft,
          y: y + yLabelPaddingTop + canvasPaddingTop,
        },
        yAxios.label
      );

      this.chartCanvas.drawDashedLine(
        { x: 0, y: y + canvasPaddingTop },
        { x: this.chartView.width, y: y + canvasPaddingTop },
        yAxios.line
      );
    }
  }

  calcScale(range: number) {
    return (this.chartView.height - this.options.canvasPaddingTop * 2) / range;
  }

  changeZoomLevel(isZooming: boolean, zoomCallback: () => void) {
    const { minZoomLevel, maxZoomLevel, zoomScale } = this.options;

    if (isZooming) {
      const nextZoomLevel = this.currentZoomLevel + zoomScale;

      // Zoom in
      if (nextZoomLevel <= maxZoomLevel) {
        this.currentZoomLevel = Math.min(maxZoomLevel, nextZoomLevel);
        zoomCallback();
      }
    } else {
      const prevZoomLevel = this.currentZoomLevel - zoomScale;

      // Zoom out
      if (prevZoomLevel >= minZoomLevel) {
        this.currentZoomLevel = Math.max(minZoomLevel, prevZoomLevel);
        zoomCallback();
      }
    }
  }

  calcVisibleDataElementsCount() {
    return Math.floor(
      (this.chartView.width - this.options.canvasPaddingLeft) /
        (this.currentDataElementSize.width +
          this.currentDataElementSize.spacing)
    );
  }

  getSlicedChunkData(start: number, end: number): ChunkDataItems {
    return this.dataset[this.chunkIndex].data.slice(start, end).map(item => ({
      ...item,
      Time: this.dataset[this.chunkIndex].startDate + item.Time,
    }));
  }

  addElementsOnCountUpdate() {
    const slicedChunk = this.getSlicedChunkData(
      this.viewedData.length,
      this.visibleDataElementsCount
    );

    this.viewedData.push(...slicedChunk);

    return this.viewedData;
  }

  getDatasetItemsLength() {
    return this.dataset.reduce((acc, item) => acc + item.data.length, 0);
  }

  getVisibleDataItems(): ChunkDataItems {
    const currentChunkLength = this.dataset[this.chunkIndex].data.length;
    const nextDataItemsOffset =
      this.dataItemsOffset + this.visibleDataElementsCount;

    let slicedChunk: ChunkDataItems = [];

    if (this.visibleDataElementsCount > this.viewedData.length) {
      return this.addElementsOnCountUpdate();
    }

    if (nextDataItemsOffset > this.datasetDataItemsLength) {
      this.dataItemsOffset =
        this.datasetDataItemsLength - this.visibleDataElementsCount;

      return this.viewedData.slice(
        this.dataItemsOffset,
        this.datasetDataItemsLength
      );
    }

    if (nextDataItemsOffset > this.viewedData.length) {
      if (
        this.chunkDataItemsOffset + this.visibleDataElementsCount >
        currentChunkLength
      ) {
        const restDataOffset = currentChunkLength - 1 - this.dataItemsOffset;

        slicedChunk = this.getSlicedChunkData(
          this.dataItemsOffset,
          restDataOffset
        );

        this.chunkDataItemsOffset = 0;
        this.chunkIndex += 1;

        slicedChunk = [
          ...slicedChunk,
          ...this.getSlicedChunkData(
            this.chunkDataItemsOffset,
            this.visibleDataElementsCount - restDataOffset
          ),
        ];

        this.dataItemsOffset += restDataOffset;

        this.chunkDataItemsOffset =
          this.visibleDataElementsCount - restDataOffset;
      } else {
        this.chunkDataItemsOffset =
          this.chunkDataItemsOffset + this.visibleDataElementsCount;
      }

      slicedChunk = [
        ...slicedChunk,
        ...this.getSlicedChunkData(
          this.chunkDataItemsOffset,
          this.chunkDataItemsOffset + this.visibleDataElementsCount
        ),
      ];

      this.viewedData.push(...slicedChunk);
    }

    return this.viewedData.slice(this.dataItemsOffset, nextDataItemsOffset);
  }

  onMouseDown = (e: MouseEvent) => {
    this.isDragging = true;
    this.startDragPositionX = e.clientX;
    this.chartCanvas.changeCanvasCursor("grabbing");
  };

  onMouseUp = () => {
    this.isDragging = false;
    this.chartCanvas.changeCanvasCursor("default");
  };

  onResize = () => {
    this.chartView = this.updatedChartView();
    this.visibleDataElementsCount = this.calcVisibleDataElementsCount();

    this.render();
  };

  bindChartEvents = () => {
    const canvas = this.chartCanvas.getHTMLCanvasElement();

    canvas.addEventListener("mousedown", this.onMouseDown);
    canvas.addEventListener("mousemove", this.onMouseMove);
    canvas.addEventListener("mouseup", this.onMouseUp);
    canvas.addEventListener("mouseleave", this.onMouseUp);
    canvas.addEventListener("wheel", this.onWheel);

    new ResizeObserver(this.onResize).observe(canvas);
  };
}
