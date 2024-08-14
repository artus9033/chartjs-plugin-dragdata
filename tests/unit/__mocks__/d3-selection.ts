const callMock = jest
	.fn(function (...args: any[]) {
		var callback = args[0];
		args[0] = this;
		(callback as any).apply(null, args);
		return this;
	})
	.mockReturnThis();

module.exports = {
	select: jest.fn(() => ({
		call: callMock,
	})),
	call: callMock,
};
