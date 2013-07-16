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
    function Pivot(options) {
        var defaults = {
            container: null,
            data: null,
            filter: function() {
                return true
            },
            aggregator: utils.aggregators.count(),
            derivedAttributes: {},
            postProcessor: function() {}
        }

        options = $.extend(defaults, options)

        var input = options.data

        if (typeof input == "function") {
            input = input()
        }

        var rowsNames = [],
            colsNames = [],
            table = {},
            totals = {
                rows: {},
                cols: {},
                all: options.aggregator()
            };

        (function() {
            var rowsHashes = [], colsHashes = []

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
                            totals.rows[row_hash] = options.aggregator()
                        }
                        totals.rows[row_hash].push(row)
                    }
                    if (col_hash !== "") {
                        if (colsHashes.indexOf(col_hash) === -1) {
                            colsNames.push(current_cols_names)
                            colsHashes.push(col_hash)
                            totals.cols[col_hash] = options.aggregator()
                        }
                        totals.cols[col_hash].push(row)
                    }
                    if (col_hash !== "" && row_hash !== "") {
                        if (!(row_hash in table)) {
                            table[row_hash] = []
                        }
                        if (!(col_hash in table[row_hash])) {
                            table[row_hash][col_hash] = options.aggregator()
                        }

                        table[row_hash][col_hash].push(row)
                    }
                }
            })
        })()

        new Renderer(options, colsNames, rowsNames, table, totals)
    }

    return Pivot
})