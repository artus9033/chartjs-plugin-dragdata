import {
	Integration,
	isWhitelistItemAllowed,
} from "../../__utils__/testsConfig";

export function integrationAllowed(integration: Integration): boolean {
	return isWhitelistItemAllowed(
		"integration",
		"whitelistedIntegrations",
		integration,
	);
}
