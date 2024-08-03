export type EJSData = {
	[key: string]: string | boolean | number | null | undefined | EJSData;
};

export type BundledPage = {
	html: string;
	outputFileName: string;
};

export type TestPageBundle = BundledPage | BundledPage[];
