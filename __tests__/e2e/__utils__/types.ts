import Point2D from "../../__utils__/Point2D";
import { DatasetPointSpec } from "../../__utils__/testTypes";

export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

export type ArrayItemType<T> = T extends (infer U)[] ? U : T;
