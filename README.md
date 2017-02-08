# Bootstrap Table Editor

## What?
Editable table with jQuery and Bootstrap

## Requirements
Bootstrap 4
jQuery 1.7.1+

## Usage
This is the minimum code to make an editable table
```javascript
$('table').tableEditor()
```

If you want to set options add an object which contains your options as parameters
```javascript
$('table').tableEditor({
	// Localization
	// Supported: English (en, default) and Spanish (es)
	lang: 'en',
	// onChange event
	onChange: function(value, cell, table, tableEditor) {
		// ..
	}
})
```

Convert table to JSON
```javascript
$('table').tableEditor('json')
```

Convert JSON to table
```javascript
$('table').tableEditor('json', '[["1","2","3","4","5"],["6","7","8","9","0"]]')
```

When you wish, you can restore the previous state of the table
```javascript
$('table').tableEditor('destroy')
```