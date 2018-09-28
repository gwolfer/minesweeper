G. Wolfer's Minesweeper
===========

## Demo

Live demo at http://dagama.org/minesweeper/

## Installation

This minesweeper has the following dependencies : AngularJS, Angular Translate, Bootstrap, Lazy.js

```javascript
{
  "name": "minesweeper",
  "version": "0.1.0",
  "main": "./app/minesweeper.js",
  "dependencies": {
    "bootstrap": "2.3",
    "angular": "1.2.4",
    "angular-bootstrap": "~0.7.0",    
    "angular-translate": "1.1.1",
    "lazy.js": "latest"
  },
  "resolutions": {
    "angular": "1.2.4"
  }
}
```

In addtion to these dependencies, you need to include the following files to your page :

```html
<link rel="stylesheet" href="yourComponentsDirectory/minesweeper/app/minesweeper.css">
```

```html
<script type="text/javascript" src="yourComponentsDirectory/minesweeper/app/minesweeper.js"></script>
```

You also need to add the module to the dependencies of your application.

```javascript
angular.module('myModule', ['wolfer.minesweeper']);
```

Project files are available through the package manager:
* **Bower**: `bower install minesweeper`

## Minesweeper directive for AngularJS

You can then use the following directive to insert a minesweeper in your page.

```html
<div data-ng-minesweeper data-default-level="'medium'"></div>
```
