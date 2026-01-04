# Tools

This provides an environment for the pdf service to work with in development.  
Its meant to provide instant visual feedback while working on PDF Templates.

## Concept

For a faster feedback loop  
this relies on the "runonsave" vs-code plugin  
and triggers the creation of a debug.pdf  
whenever any file inside projects/pdf-generator/tools/pdf-environment changes.

## Requirements:

- WSL
- Docker-Desktop
- Node 20
- VS-Code
- VS-Code-Plugin: https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave

### setup the Plugin:

in .vscoce/settings.json add (at root level):

```JSON
"emeraldwalk.runonsave": {
    "commands": [
      {
        // start convert.sh whenever html, css, hbs or json file inside .../html changes
        "match": "projects/pdf-generator/tools/pdf-environment/html/(.+)\\.(html|css|hbs|json)$",
        "cmd": "./projects/pdf-generator/tools/pdf-environment/convert.sh"
      }
    ]
  }
```

open a Ubuntu console inside WSL, then:  
open vscode:

```bash
$ code .
```

## start

```
$ nx run api-service:build:development
```

## Documentation for Template developers:

### data sources:

available handlebars variables are listed here:  
https://airtable.com/app1bs0cpGCuVoNcA/tbl8OVsJnuCqZsDW8/viw4INiJryWk1AXfW

### handlebars documentation:

https://handlebarsjs.com/guide/

### handlebars playground:

https://handlebarsjs.com/playground.html

## Tools for developers

### JS -> JSON:

convert javascript to valid JSON  
https://www.convertsimple.com/convert-javascript-to-json/

### HTML Minify:

https://codebeautify.org/minify-html
