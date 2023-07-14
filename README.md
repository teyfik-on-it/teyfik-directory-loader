# teyfik-directory-loader

## Usage

### Installation

```sh
npm i teyfik-directory-loader
```

### TL; DR

For the directory structure, file contents and the usage below;

#### Directory structure

```
.
└── path
  └── to
    └── files
      ├── foo
      | └── first.json
      └── bar
        └── second.yml
```

#### File contents

`path/to/files/foo/first.json`

```json
{
  "a": 1,
  "b": {
    "c": 2
  }
}
```

`path/to/files/bar/second.yml`

```json
{
  "x": "string",
  "y": false
}
```

#### Usage

```ts
import directoryLoader from 'teyfik-directory-loader';

directoryLoader('path', 'to', 'files').remove('yml').load();
```

#### Output

```json
{
  "foo": {
    "first": {
      "a": 1,
      "b": {
        "c": 2
      }
    }
  },
  "bar": {
    "second": {
      "x": "string",
      "y": false
    }
  }
}
```

### Loading directories

By default, `directoryLoader` comes with JSON and YAML loader. You can change
these loaders with `.add()` and `.remove()` methods.

Because of there is two loaders as default, in the example below, YAML loader
will be removed. You can remove loaders by using their extensions.

```ts
import directoryLoader from 'teyfik-directory-loader';

directoryLoader('path', 'to', 'files').remove('yml').load();
```

### Adding loader

Also you can add your custom loaders following this example:

```ts
directoryLoader('path', 'to', 'files')
  .add('xml', (input) => parseXML(input))
  .load();
```

### Removing loader

While removing a loader, any matching extension will remove the loader.
Therefore both of the following approaches will work properly.

_**i** By default, YAML loader matches both `*.yml` and `*.yaml` extensions._

Removing by `yml` extension:

```ts
directoryLoader('json-and-yaml-files').remove('yml').load();
```

Removing by `yaml` extension:

```ts
directoryLoader('json-and-yaml-files').remove('yaml').load();
```

### Clearing all loaders

```ts
directoryLoader().clear().load();
```

### Updating open files limit

You can set maximum number of open files at a time. This is useful when you are
working with too many files. The default value is `Infinity`

```ts
directoryLoader('too-many-files').openFiles(5000).load();
```

### Updating max files limit

You can set a limit for total number files to be loaded. This is useful when you
are working with too many files. The default value is `Infinity`

```ts
directoryLoader('too-many-files').maxFiles(10000).load();
```
