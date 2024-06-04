import Chart from "./chart";
import {
  ChunkDataItems,
  IChartDataChunk,
  IChartOptions,
  IChunkDataItem,
} from "./types.d";

class BarsChart extends Chart {
  constructor(
    chartId: string,
    dataset: IChartDataChunk[],
    options?: Partial<IChartOptions>
  ) {
    super(chartId, dataset, options);
  }

  drawDataElement(
    x: number,
    dataItem: IChunkDataItem,
    minValue: number,
    scale: number
  ) {
    const { canvasPaddingLeft, canvasPaddingTop } = this.options;
    const { width: elementWidth } = this.currentDataElementSize;
    const { height: visibleChartHeight } = this.chartView;

    const dataElementX = x + canvasPaddingLeft;
    const height = visibleChartHeight - canvasPaddingTop;

    const openY = height - (dataItem.Open - minValue) * scale;
    const closeY = height - (dataItem.Close - minValue) * scale;
    const highY = height - (dataItem.High - minValue) * scale;
    const lowY = height - (dataItem.Low - minValue) * scale;

    const elementColor = dataItem.Open > dataItem.Close ? "red" : "green";

    // Draw the high-low line
    this.chartCanvas.drawLine(
      {
        x: dataElementX + elementWidth / 2,
        y: highY,
      },
      {
        x: dataElementX + elementWidth / 2,
        y: lowY,
      },
      {
        color: elementColor,
        thickness: 1,
      }
    );

    //Draw the open-close rectangle
    this.chartCanvas.drawRect(
      { x: dataElementX, y: Math.min(openY, closeY) },
      {
        width: elementWidth,
        height: Math.abs(openY - closeY),
      },
      elementColor
    );
  }

  drawVisibleDataElements = (
    visibleDataItems: ChunkDataItems,
    minValue: number,
    scale: number
  ) => {
    visibleDataItems.forEach((item, index) => {
      const x =
        index *
        (this.currentDataElementSize.width +
          this.currentDataElementSize.spacing);
      this.drawDataElement(x, item, minValue, scale);
    });
  };

  render() {
    this.clearView();

    const visibleBars = this.getVisibleDataItems();
    const maxValue = Math.max(...visibleBars.map(b => b.High));
    const minValue = Math.min(...visibleBars.map(b => b.Low));
    const scale = this.calcScale(maxValue - minValue);

    this.drawXAxisLabels(visibleBars);
    this.drawYAxisLabels(minValue, maxValue);
    this.drawVisibleDataElements(visibleBars, minValue, scale);
  }

  initialize() {
    this.bindChartEvents();
    this.zoomRender();
  }

  reInitialize() {
    this.zoomRender();
  }

  zoomRender = () => {
    const percentTo = 15;
    const {
      minZoomLevel,
      maxZoomLevel,
      dataElementSize: { width: elementWidth, spacing: elementSpacing },
    } = this.options;

    const zoomPercent =
      this.currentZoomLevel > minZoomLevel
        ? (this.currentZoomLevel / maxZoomLevel) * percentTo
        : 0;

    this.currentDataElementSize.width =
      elementWidth + elementWidth * zoomPercent;

    this.currentDataElementSize.spacing =
      elementSpacing + elementSpacing * zoomPercent;

    this.visibleDataElementsCount = this.calcVisibleDataElementsCount();

    this.render();
  };

  moveChart(dx: number) {
    this.isRequestAnimationFrame = true;

    const newItemsOffset = Math.max(
      0,
      this.dataItemsOffset -
        Math.round(
          dx /
            (this.currentDataElementSize.width +
              this.currentDataElementSize.spacing)
        )
    );

    if (
      newItemsOffset + this.visibleDataElementsCount <=
      this.datasetDataItemsLength
    ) {
      this.dataItemsOffset = newItemsOffset;
    }

    this.render();
  }

  onMouseMove = (e: MouseEvent) => {
    if (this.isDragging && this.isRequestAnimationFrame) {
      this.isRequestAnimationFrame = false;

      const dx = e.clientX - this.startDragPositionX;
      this.startDragPositionX = e.clientX;

      requestAnimationFrame(this.moveChart.bind(this, dx));
    }
  };

  onWheel = (e: WheelEvent) => {
    this.changeZoomLevel(e.deltaY < 0, this.zoomRender);
  };
}

export default BarsChart;
