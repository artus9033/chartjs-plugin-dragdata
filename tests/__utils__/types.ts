export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

export type ArrayItemType<T> = T extends (infer U)[] ? U : T;

export type DeepFinalPropertiesOf<Obj extends object> = {
	[Key in keyof Obj]: `${Exclude<Key, symbol>}${DeepFinalPropertiesOf<Obj[Key] extends object ? Obj[Key] : never> extends never ? "" : `.${DeepFinalPropertiesOf<Obj[Key] extends object ? Obj[Key] : never>}`}`;
}[keyof Obj];
