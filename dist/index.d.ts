import { Chart } from "chart.js";
declare type _Options<Data> = {
    onDragStart: (e: any, datasetIndex: number) => boolean | void;
    onDrag: (e: any, datasetIndex: number, index: number, data: Data) => boolean | void;
    onDragEnd: (e: any, datasetIndex: number, index: number, data: Data) => boolean | void;
};
export declare type Options<Data, Booleanish = true> = Booleanish extends true ? false | _Options<Data> : _Options<Data>;
declare module "chart.js" {
    interface ChartDatasetProperties<TType extends ChartType, TData> {
        dragData?: Options<TData>;
    }
    interface PluginOptionsByType<TType extends ChartType> {
        dragData?: Options<any>;
    }
}
declare const ChartJSdragDataPlugin: {
    id: string;
    afterInit: (chartInstance: Chart) => void;
    beforeEvent: (chart: Chart) => boolean;
};
export default ChartJSdragDataPlugin;
//# sourceMappingURL=index.d.ts.map