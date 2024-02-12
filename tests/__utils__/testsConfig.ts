import path from "path";

import config from "config";

import { DeepFinalPropertiesOf } from "./types";
import { TestChartTypes } from "../unit/__utils__/constants";
import Whitelist from "./structures/Whitelist";
import { ALL_AXES_SPECS, AxisSpec } from "./structures/axisSpec";
import { MagnetVariant } from "./magnet";

export function isSimpleWhitelistItemAllowed<T>(
	whitelist: Whitelist<T> | undefined,
	which: T,
) {
	return !whitelist ? true : whitelist.isAllowed(which);
}

export function isTestsConfigWhitelistItemAllowed<
	TestsGroupKey extends keyof TestsConfig,
	TestsCategoryWhitelistKey extends keyof TestsConfig[TestsGroupKey],
	TestsCategoryWhitelist extends
		TestsConfig[TestsGroupKey][TestsCategoryWhitelistKey],
	TestsCategoryWhitelistItem extends TestsCategoryWhitelist extends Whitelist<
		infer R
	>
		? R
		: never,
>(
	testsGroup: TestsGroupKey,
	category: TestsCategoryWhitelistKey,
	which: TestsCategoryWhitelistItem,
): boolean {
	let whitelist = testsConfig[testsGroup][category];

	return isSimpleWhitelistItemAllowed(whitelist as any, which);
}

function maybeLoadEntryFromConfig<RawConfigValueType>(
	key: DeepFinalPropertiesOf<TestsConfig>,
): RawConfigValueType | undefined;
function maybeLoadEntryFromConfig<
	RawConfigValueType,
	FinalValueType,
	ValueMapper = FinalValueType extends undefined
		? undefined
		: (value: RawConfigValueType) => FinalValueType,
>(
	key: DeepFinalPropertiesOf<TestsConfig>,
	valueMapperIfValuePresent: ValueMapper,
): FinalValueType | undefined;
function maybeLoadEntryFromConfig(...args: any[]) {
	if (args.length === 1) {
		const [key] = args;

		return maybeLoadEntryFromConfig(key, (x) => x);
	} else {
		const [key, mapper] = args;

		if (config.has(key)) {
			return mapper(config.get(key));
		} else {
			return undefined;
		}
	}
}

function loadCustomizableListingFromConfig<
	RawConfigValueType extends string | number,
	DefaultValue extends Array<RawConfigValueType> | undefined,
>(
	key: DeepFinalPropertiesOf<TestsConfig>,
	defaultValue: DefaultValue,
): Array<RawConfigValueType> | DefaultValue {
	return (
		maybeLoadEntryFromConfig<RawConfigValueType[], Array<RawConfigValueType>>(
			key,
			(value) =>
				Object.entries(value)
					.filter(([_, isEnabled]) => isEnabled)
					.map(([value, _]) => value as RawConfigValueType),
		) ?? defaultValue
	);
}

function loadWhitelistFromConfig<
	RawConfigValueType,
	DefaultValue extends Whitelist<RawConfigValueType> | undefined,
>(
	key: DeepFinalPropertiesOf<TestsConfig>,
	defaultValue: DefaultValue,
): Whitelist<RawConfigValueType> | DefaultValue {
	return (
		maybeLoadEntryFromConfig<
			RawConfigValueType[],
			Whitelist<RawConfigValueType>
		>(key, (value) => new Whitelist(value)) ?? defaultValue
	);
}

/** Unit config - start */

export type UnitTestCategory =
	| "roundValue"
	| "pluginRegistration"
	| "dragListenersRegistration";

export type UnitConfig = {
	whitelistedTestCategories: Whitelist<UnitTestCategory> | undefined;
	whitelistedTestedChartTypes: Whitelist<TestChartTypes> | undefined;
};

let unit: UnitConfig = {
	whitelistedTestCategories: undefined,
	whitelistedTestedChartTypes: undefined,
};

unit.whitelistedTestCategories = loadWhitelistFromConfig(
	"unit.whitelistedTestCategories",
	unit.whitelistedTestCategories,
);

unit.whitelistedTestedChartTypes = loadWhitelistFromConfig(
	"unit.whitelistedTestedChartTypes",
	unit.whitelistedTestedChartTypes,
);

/** Unit config - end */

/** Integration config - start */

export type Integration = "react" | "vue";

export type IntegrationConfig = {
	testedAxes: AxisSpec[];
	whitelistedIntegrations: Whitelist<Integration> | undefined;
};

let integration: IntegrationConfig = {
	testedAxes: ALL_AXES_SPECS,
	whitelistedIntegrations: undefined,
};

integration.testedAxes = loadCustomizableListingFromConfig(
	"integration.testedAxes",
	integration.testedAxes,
);

integration.whitelistedIntegrations = loadWhitelistFromConfig(
	"integration.whitelistedIntegrations",
	integration.whitelistedIntegrations,
);

/** Integration config - start */

/** E2E config - start */

export type E2EInteraction =
	| "standardDragging"
	| "draggingToCanvasBoundsX"
	| "draggingToCanvasBoundsY";

export type E2EConfig = {
	testedAxes: AxisSpec[];
	whitelistedHTMLFiles: Whitelist<string> | undefined;
	whitelistedInteractions: Whitelist<E2EInteraction> | undefined;
	whitelistedBrowsers: Whitelist<string> | undefined;
	whitelistedMagnetVariants: Whitelist<MagnetVariant> | undefined;
};

let e2e: E2EConfig = {
	testedAxes: ALL_AXES_SPECS,
	whitelistedHTMLFiles: undefined,
	whitelistedInteractions: undefined,
	whitelistedBrowsers: undefined,
	whitelistedMagnetVariants: undefined,
};

e2e.testedAxes = loadCustomizableListingFromConfig(
	"e2e.testedAxes",
	e2e.testedAxes,
);

e2e.whitelistedHTMLFiles = loadWhitelistFromConfig(
	"e2e.whitelistedHTMLFiles",
	e2e.whitelistedHTMLFiles,
);

e2e.whitelistedInteractions = loadWhitelistFromConfig(
	"e2e.whitelistedInteractions",
	e2e.whitelistedInteractions,
);

e2e.whitelistedBrowsers = loadWhitelistFromConfig(
	"e2e.whitelistedBrowsers",
	e2e.whitelistedBrowsers,
);

e2e.whitelistedMagnetVariants = loadWhitelistFromConfig(
	"e2e.whitelistedMagnetVariants",
	e2e.whitelistedMagnetVariants,
);

/** E2E config - end */

type ConfigSpec = {
	displayName: string;
	category: keyof TestsConfig;
	configuration: TestsConfig[keyof TestsConfig];
};

/** Prints the loaded configuration */
export function showConfig(which?: Array<keyof TestsConfig>) {
	console.log(
		`Merged tests configuration from files ${config.util
			.getConfigSources()
			.map(({ name }) => path.basename(name))
			.join(", ")}`,
	);

	for (const { displayName, configuration } of (
		[
			{
				displayName: "unit",
				category: "unit",
				configuration: unit,
			},
			{
				displayName: "integration",
				category: "integration",
				configuration: integration,
			},
			{
				displayName: "end-to-end",
				category: "e2e",
				configuration: e2e,
			},
		] satisfies ConfigSpec[]
	).filter(({ category }) => !which || which.includes(category))) {
		console.log(`Config for ${displayName} tests`);

		console.table(
			Object.entries(configuration).map(([key, value]) => ({
				key,
				value:
					value instanceof Whitelist
						? value.toString()
						: (typeof value) in ["number", "string", "boolean"] ||
							  value === undefined ||
							  value === null ||
							  Array.isArray(value)
							? value
							: JSON.stringify(value),
			})),
		);
	}
}

export type TestsConfig = {
	unit: UnitConfig;
	integration: IntegrationConfig;
	e2e: E2EConfig;
};

export const testsConfig: TestsConfig = {
	unit,
	integration,
	e2e,
};

export default testsConfig;
