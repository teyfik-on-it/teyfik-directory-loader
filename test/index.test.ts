import directoryLoader from '../src';

describe('json directory loader', () => {
  const json = {
    a: {
      b: {
        c: 'foo',
        d: 'bar',
      },
    },
  };

  const jsonAndYaml = {
    a: {
      b: {
        c: 'foo',
        d: 'bar',
      },
    },
  };

  const onlyJson = {
    a: {
      b: {
        c: 'foo',
      },
    },
  };

  const onlyYaml = {
    a: {
      b: {
        d: 'bar',
      },
    },
  };

  it('should load json from ./test/json', async () => {
    const data = await directoryLoader('test', 'json').load();

    expect(data).toStrictEqual(json);
  });

  it('should load json and yaml from ./test/json-yaml', async () => {
    const data = await directoryLoader('test', 'json-yaml').load();

    expect(data).toStrictEqual(jsonAndYaml);
  });

  // it('should load only json from ./test/json-yaml', async () => {
  //   const data = await directoryLoader('test', 'json-yaml')
  //     .remove('yml')
  //     .load();

  //   expect(data).toStrictEqual(onlyJson);
  // });

  it('should load only yaml from ./test/json-yaml', async () => {
    const data = await directoryLoader('test', 'json-yaml')
      .remove('json')
      .load();

    expect(data).toStrictEqual(onlyYaml);
  });

  it('should load an empty object from ./test/empty', async () => {
    const data = await directoryLoader('test', 'empty').load();

    expect(data).toStrictEqual({});
  });

  it('should remove and add JSON loader', async () => {
    const data = await directoryLoader('test', 'json')
      .remove('json')
      .add('json', JSON.parse)
      .load();

    expect(data).toStrictEqual(json);
  });

  // Files are being loaded in alphabetical order
  const firstThreeFiles = {
    eight: { foo: 'bar' },
    five: { foo: 'bar' },
    four: { foo: 'bar' },
  };

  it('should only load first 3 files', async () => {
    const data = await directoryLoader('test', 'too-many-files')
      .maxFiles(3)
      .load();

    expect(data).toStrictEqual(firstThreeFiles);
  });

  const numberIndex = {
    first: {
      lorem: {
        ipsum: {
          '0': { foo: 'bar' },
          '10': {
            bar: 'baz',
          },
        },
      },
    },
    second: {
      10: {
        foo: {
          bar: 'baz',
        },
      },
    },
    third: {
      foo: ['x', 'y'],
    },
  };

  it('should load file with number index properly', async () => {
    const data = await directoryLoader('test', 'number-index').load();

    expect(data).toStrictEqual(numberIndex);
  });
});
