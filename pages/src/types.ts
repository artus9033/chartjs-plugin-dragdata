export type BundledPage = {
	html: string;
	outputFileName: string;
};

export type TestPageBundleFactoryOptions = {
	isE2ETest: boolean;
};

export type TestPageBundleFactory = ({
	isE2ETest,
}: TestPageBundleFactoryOptions) => BundledPage | BundledPage[];
