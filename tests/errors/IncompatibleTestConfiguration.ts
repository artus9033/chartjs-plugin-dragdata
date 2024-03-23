/**
 * Error that represents an invalid state when the current chart configuration is incompatible with the current test scenario.
 */
export class IncompatibleTestConfiguration extends Error {
	constructor(message: string) {
		super(message);
		this.name = "IncompatibleTestConfiguration";
	}
}

export default IncompatibleTestConfiguration;
