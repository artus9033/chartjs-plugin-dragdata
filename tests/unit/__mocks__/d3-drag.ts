module.exports = {
	drag: jest.fn(() => ({
		container: jest.fn().mockReturnThis(),
		on: jest.fn().mockReturnThis(),
		apply: jest.fn().mockReturnThis(),
	})),
};
