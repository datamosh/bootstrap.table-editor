jQuery.tableEditor = {
	langs: {
		en: {
			insert_row_above: 'Insert row above',
			insert_row_below: 'Insert row below',
			insert_column_on_the_left: 'Insert column on the left',
			insert_column_on_the_right: 'Insert column on the right',
			remove_row: 'Remove row',
			remove_column: 'Remove column'
		},
		nl: {
			insert_row_above: 'Rij invoegen boven',
			insert_row_below: 'Rij invoegen beneden',
			insert_column_on_the_left: 'Kolom invoegen links',
			insert_column_on_the_right: 'Kolom invoegen rechts',
			remove_row: 'Rij verwijderen',
			remove_column: 'Kolom verwijderen'
        },
		es: {
			insert_row_above: 'Añadir fila arriba',
			insert_row_below: 'Añadir fila debajo',
			insert_column_on_the_left: 'Añadir columna a la izquierda',
			insert_column_on_the_right: 'Añador columna a la derecha',
			remove_row: 'Eliminar fila',
			remove_column: 'Eliminar columna'
		}
	}
}

;(function (navigator, window, document, $) {
	'use strict'

	// Helpers
	$.fn.tableEditor = function (options, params) {
		var tableEditorDataName = 'tableEditor'
		if (options === Object(options) || !options) {
			return this.each(function () {
				if (!$(this).data(tableEditorDataName))
					$(this).data(tableEditorDataName, new tableEditor(this, options))
			})
		}

		if (this.length === 1) {
			var editor = $(this).data(tableEditorDataName)
			if (editor[options])
				return editor[options](params)
		}
	}

	// @param: table is the DOM element
	var tableEditor = function (table, options) {
		var editor = this

		// Get the document of the element. It use to makes the plugin compatible on iframes.
		editor.document = table.ownerDocument || document

		// jQuery object of the editor
		editor.table = $(table) // $ta : Textarea

		options = options || {}

		// Language/localization
		if (options.lang != null || $.tableEditor.langs[options.lang] != null)
			editor.lang = $.extend(true, {}, $.tableEditor.langs.en, $.tableEditor.langs[options.lang])
		else
			editor.lang = $.tableEditor.langs.en

		// Defaults Options
		editor.options = {
			lang: options.lang || 'en',
			onChange: options.onChange || function() {}
		}

		editor.init()
	}

	tableEditor.prototype = {
		// Initialize the editor
		init: function() {
			$(this.table).addClass('table-editable')

			// Binds
			this.binds()
		},

		// Binds
		binds: function() {
			var editor = this

			// Debug: Row and cell
			$(this.table).on('click.tableEditor', 'td', function() {
				var col = $(this).index(),
					$tr = $(this).closest('tr'),
					row = $tr.index()

				editor.edit($(this))
			})

			// Right click (context menu)
			$(this.table).on('contextmenu.tableEditor', 'td', function(e) {
				var td = this,
					col = $(this).index(),
					$tr = $(this).closest('tr'),
					row = $tr.index(),
					width = $tr.find('> td').length

				$('.editor-contextmenu').remove()
				var popover = $(this).popover({
					trigger: 'manual',
					placement: 'bottom',
					container: 'body',
					html: true,
					template: '<div class="popover editor-contextmenu" role="tooltip">' + '<div class="arrow" style="top: 50%;"></div>' + '<h3 class="popover-title"></h3>' + '<div class="popover-content"></div></div>',
					content: '<ul><li>' + ([
						'<a href="#" data-action="insert_row_above">' + jQuery.tableEditor.langs[editor.options.lang].insert_row_above + '</a>',
						'<a href="#" data-action="insert_row_below">' + jQuery.tableEditor.langs[editor.options.lang].insert_row_below + '</a>',
						'<hr/>',
						'<a href="#" data-action="insert_column_on_the_left">' + jQuery.tableEditor.langs[editor.options.lang].insert_column_on_the_left + '</a>',
						'<a href="#" data-action="insert_column_on_the_right">' + jQuery.tableEditor.langs[editor.options.lang].insert_column_on_the_right + '</a>',
						'<hr/>',
						'<a href="#" data-action="remove_row">' + jQuery.tableEditor.langs[editor.options.lang].remove_row + '</a>',
						'<a href="#" data-action="remove_column">' + jQuery.tableEditor.langs[editor.options.lang].remove_column + '</a>'
					]).join('</li><li>') + '</li></ul>'
				}).popover('show')
				$('.editor-contextmenu a').off('click').on('click', function(e) {
					editor.action($(this).data('action'), td)
					e.preventDefault()
				})
				e.preventDefault()
			})

			$('body').off('click.tableEditor').on('click.tableEditor', function (e) {
				if ($('.popover').is(':visible'))
					$('.table-editable').find('td').each(function(index, element) {
						if ($(element).popover)
							$(element).popover('hide')
					})
			})
		},

		// Destroy the editor
		destroy: function () {
			$(this.table)
				.off('click.tableEditor')
				.off('contextmenu.tableEditor')
				.removeClass('table-editable')
				.removeData('tableEditor')
		},

		// Set/Get JSON
		json: function(json) {
			// Get
			if (!json) {
				var result = []
				$.each($(this.table).find('tr'), function(row_number, row) {
					var tr = []
					$.each($(row).find('td'), function(cell_number, cell) {
						tr.push($(cell).html())
					})
					result.push(tr)
				})
				return JSON.stringify(result)
			// Set
			} else {
				if (typeof json != 'object')
					json = JSON.parse(json)
				var html = ''
				$.each(json, function(row_number, row) {
					html += '<tr data-row="' + row_number + '">'
					$.each(row, function(cell_number, cell) {
						html += '<td data-row="' + row_number + '" data-cell="' + cell_number + '">' + cell + '</td>'
					})
					html += '</tr>'
				})
				html = '<table class="table table-bordered table-editable"><tbody>' + html + '</tbody></table>'
				$(this.table).html(html)
				return html
			}
		},

		// Edit
		edit: function(cell) {
			if ($(cell).hasClass('editing'))
				return
			// Edit cell
			var editor = this,
				value = $(cell).html(),
				input = $('<textarea class="editor"></textarea>')
			$(cell)
				.append(input)
				.addClass('editing')
			$(input)
				.focus()
				.val(value.replace(/<br>/g, '\r'))
				.on('blur', function() {
					$(cell).html($(input).val().replace(/(\r\n|\n\r|\r|\n)/g, '<br>'))
					$(cell).removeClass('editing')
					editor.options.onChange($(input).val(), cell, editor.table, editor)
					$(input).remove()
				})
		},

		// Action
		action: function(name, td) {
			var editor = this,
				col = $(td).index(),
				$tr = $(td).closest('tr'),
				row = $tr.index(),
				width = $tr.find('> td').length,
				tbody = $(editor.table).find('tbody')

			if (name == 'insert_row_above')
				$(td).parent().before('<tr>' + ('<td></td>').repeat(width) + '</tr>')
			if (name == 'insert_row_below')
				$(td).parent().after('<tr>' + ('<td></td>').repeat(width) + '</tr>')
			if (name == 'insert_column_on_the_left')
				$(editor.table).find('td:nth-child(' + (col + 1) + ')').before('<td></td>')
			if (name == 'insert_column_on_the_right')
				$(editor.table).find('td:nth-child(' + (col + 1) + ')').after('<td></td>')
			if (name == 'remove_row')
				$(td).parent().remove()
			if (name == 'remove_column')
				$(editor.table).find('td:nth-child(' + (col + 1) + ')').remove()

			// Prevent empty table
			$(tbody).find('tr').each(function(index, element) {
				if ($(element).html().trim() == '')
					$(element).remove()
			})
			if ($(tbody).children().length == 0)
				$(tbody).html('<tr><td></td></tr>')

			// Close context menu
			$('.editor-contextmenu').remove()
		}
	}
})(navigator, window, document, jQuery);
