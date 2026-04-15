import type { Config } from 'jest';

const config: Config = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: 'src',
	testRegex: '.*\\.spec\\.ts$',
	transform: {
		'^.+\\.(t|j)s$': [
			'ts-jest',
			{
				isolatedModules: true,
			},
		],
	},
	moduleNameMapper: {
		'^src/(.*)$': '<rootDir>/$1',
	},
	collectCoverageFrom: ['**/*.(t|j)s'],
	coverageDirectory: '../coverage',
	testEnvironment: 'node',
	maxWorkers: '50%',
	workerIdleMemoryLimit: '512MB',
};

export default config;
