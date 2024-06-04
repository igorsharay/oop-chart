import BarsChart from "./chart/barsChart";
import { ChunkDataItems, IChartDataChunk, IChartOptions } from "./chart/types";
import jsonData from "./data.json";

interface JsonDataItem {
  ChunkStart: number;
  Bars: ChunkDataItems;
}

const convertDataForChart = (data: JsonDataItem[]) => {
  return data.map(item => ({
    startDate: item.ChunkStart,
    data: item.Bars,
  }));
};

const data: IChartDataChunk[] = convertDataForChart(jsonData);

const chartOptions = { zoomLevel: 2 };

const tradingChart = new BarsChart(
  "tradingChart",
  data,
  chartOptions as IChartOptions
);

tradingChart.initialize();
