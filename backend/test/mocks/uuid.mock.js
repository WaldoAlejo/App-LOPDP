module.exports = {
  v4: jest.fn(() => 'mock-uuid-v4'),
  v1: jest.fn(() => 'mock-uuid-v1'),
  v3: jest.fn(() => 'mock-uuid-v3'),
  v5: jest.fn(() => 'mock-uuid-v5'),
  v6: jest.fn(() => 'mock-uuid-v6'),
  v7: jest.fn(() => 'mock-uuid-v7'),
  validate: jest.fn(() => true),
  parse: jest.fn((id) => id),
  stringify: jest.fn((buf) => buf),
  MAX: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  NIL: '00000000-0000-0000-0000-000000000000',
  version: jest.fn(() => 4),
};
