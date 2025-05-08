import '@testing-library/jest-dom';
import 'jest-canvas-mock';

const MAX_TIMEOUT_FOR_TESTS = 10 * 1000;

jest.setTimeout(MAX_TIMEOUT_FOR_TESTS);
