/**
 * @group unit/core
 */

import { Mocker } from "@/Mocker";

interface TestMock {
  a(param1: string, param2: boolean): boolean;
  b(param1: string, param2: boolean): boolean;
}

describe('Mocker', () => {
  test('checkExpections() when called with expected arguments', async () => {
    const mock = Mocker.of<TestMock>();

    mock.expects('a', 'test', true).andReturn(true);
    mock.i.a('test', true);
    mock.checkExpections();
  });

  test('checkExpections() when called with not expected arguments', async () => {
    const mock = Mocker.of<TestMock>();

    mock.expects('a', 'test', true).andReturn(true);
    mock.i.a('not test', false);

    expect(() => mock.checkExpections()).toThrow();
  });

  test('checkExpections() when not called', async () => {
    const mock = Mocker.of<TestMock>();

    mock.expects('a', 'test', true).andReturn(true);

    expect(() => mock.checkExpections()).toThrow();
  });

  test('call method when no expection', async () => {
    const mock = Mocker.of<TestMock>();
    expect(() =>  mock.i.a("test", false)).toThrow();
  });
});