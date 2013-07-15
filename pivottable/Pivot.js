/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 2:53 AM
 * @description
 */
define(
"pivottable/Pivot",
[
    "underscore",
    "jquery",
    "pivottable/utilities",
    "pivottable/renderer"
],
function(_, $, utils, Renderer) {
    var defaults = {
        container: null,
        data: null,
        filter: function() {
            return true
        },
        aggregator: utils.aggregators.count(),
        derivedAttributes: {},
        postProcessor: function() {
        }
    }

    function strSort(a, b) {
        if (a > b) {
            return 1
        }
        if (a < b) {
            return -1
        }
        return 0
    }

    function arrSort(a, b) {
        return strSort(a.join(), b.join())
    }

    return function Pivot(options) {
        options = $.extend(defaults, options)

        var input = options.data

        if (typeof input == "function") {
            input = input()
        }

        var rowsHashes = [],
            rowsNames = [],
            colsHashes = [],
            colsNames = [],
            table = {},
            totals = {
                rows: {},
                cols: {},
                all: options.aggregator()
            }

        utils.forEachRow(input, options.derivedAttributes, function(row) {
            var col_hash, row_hash, current_cols_names, current_row_names
            if (options.filter(row)) {
                current_cols_names = options.cols.map(function(x) {
                    return row[x]
                })
                col_hash = current_cols_names.join(utils.joinString)

                current_row_names = options.rows.map(function(x) {
                    return row[x]
                })
                row_hash = current_row_names.join(utils.joinString)

                totals.all.push(row)

                if (row_hash !== "") {
                    if (rowsHashes.indexOf(row_hash) === -1) {
                        rowsNames.push(current_row_names)
                        rowsHashes.push(row_hash)
                    }
                    if (!totals.rows[row_hash]) {
                        totals.rows[row_hash] = options.aggregator()
                    }
                    totals.rows[row_hash].push(row)
                }
                if (col_hash !== "") {
                    if (colsHashes.indexOf(col_hash) === -1) {
                        colsNames.push(current_cols_names)
                        colsHashes.push(col_hash)
                    }
                    if (!totals.cols[col_hash]) {
                        totals.cols[col_hash] = options.aggregator()
                    }
                    totals.cols[col_hash].push(row)
                }
                if (col_hash !== "" && row_hash !== "") {
                    if (!(row_hash in table)) {
                        table[row_hash] = {}
                    }
                    if (!(col_hash in table[row_hash])) {
                        table[row_hash][col_hash] = options.aggregator()
                    }

                    return table[row_hash][col_hash].push(row)
                }
            }
        })

        console.log(colsNames)
        console.log(table)
        console.log(totals)

        rowsNames = rowsNames.sort(arrSort)
        colsNames = colsNames.sort(arrSort)

        var html = Renderer(options, colsNames, rowsNames, table, totals)

        options.container.html(html)
        options.postProcessor(html)
    }

})