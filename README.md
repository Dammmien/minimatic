## Builder configuration in `project.json`

```
...
{
  "data" : { ... },
  "src": "example",
  "output": "www",
  "paths": {
    "content/recipes": "content/collections/recipes.json",
  }
}
...
```

## Build
`yarn run build` to build your project.
