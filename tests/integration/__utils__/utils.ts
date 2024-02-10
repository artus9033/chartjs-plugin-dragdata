import {
	Integration,
	isTestsConfigWhitelistItemAllowed,
} from "../../__utils__/testsConfig";

export function integrationAllowed(integration: Integration): boolean {
	return isTestsConfigWhitelistItemAllowed(
		"integration",
		"whitelistedIntegrations",
		integration,
	);
}
