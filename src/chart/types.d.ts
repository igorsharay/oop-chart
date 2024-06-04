export interface IChunkDataItem {
  Time: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  TickVolume: number;
}
export type ChunkDataItems = IChunkDataItem[];

export interface IChartDataChunk {
  startDate: number;
  data: ChunkDataItems;
}

export interface ILineStyles {
  color: string;
  thickness: number;
  dashSize?: [number, number];
}

export interface ILabelStyles {
  color: string;
  font: string;
}

interface IDataElementSize {
  width: number;
  spacing: number;
}

type AxiosOptions = { offset: number } & { label: ILabelStyles } & {
  line: ILineStyles;
};

export interface IChartOptions {
  zoomScale: number;
  minZoomLevel: number;
  maxZoomLevel: number;
  zoomLevel: number;
  canvasPaddingLeft: number;
  canvasPaddingTop: number;
  xAxios: AxiosOptions;
  yAxios: AxiosOptions;
  dataElementSize: IDataElementSize;
}
