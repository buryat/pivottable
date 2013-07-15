/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 7:14 AM
 * @description
 */
define("pivottable/renderer", ["jquery", "underscore", "pivottable/utilities"], function($, _, utils) {
    function spanSize(arr, i, j) {
        var len, noDraw, stop, x
        if (i !== 0) {
            noDraw = true
            for (x = 0; 0 <= j ? x <= j : x >= j; 0 <= j ? x++ : x--) {
                if (arr[i - 1][x] !== arr[i][x]) {
                    noDraw = false
                }
            }
            if (noDraw) {
                return -1
            }
        }
        len = 0
        while (i + len < arr.length) {
            stop = false
            for (x = 0; 0 <= j ? x <= j : x >= j; 0 <= j ? x++ : x--) {
                if (arr[i][x] !== arr[i + len][x]) {
                    stop = true
                }
            }
            if (stop) {
                break
            }
            len++
        }
        return len
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

    return function Renderer(options, colsNames, rowsNames, table, totals) {
        rowsNames = rowsNames.sort(arrSort)
        colsNames = colsNames.sort(arrSort)

        var html = "<table class='table table-bordered pivottable'><tbody>"

        _.each(options.cols, function(col, j) {
            html += "<tr>"
            if (j == 0 && options.rows.length) {
                html += "<th colspan='" + options.rows.length + "' rowspan='" + options.cols.length + "'></th>"
            }
            html += "<th class='pivottable-axis-label'>" + col + "</th>"
            _.each(colsNames, function(col_names, i) {
                var x = spanSize(colsNames, i, j)
                if (x !== -1) {
                    html += "<th class='pivottable-col-label' colspan='" + x + "'"
                    if (j === options.cols.length - 1 && options.rows.length) {
                        html += " rowspan='2'"
                    }
                    html += ">" + col_names[j] + "</th>"
                }
            })
            if (j == 0) {
                html += "<th class='pivottable-total-label' rowspan='" + (options.cols.length + (options.rows.length ? 1 : 0)) + "'>Totals</th>"
            }
            html += "</tr>"
        })

        if (options.rows.length) {
            html += "<tr>"

            _.map(options.rows,function(el) {
                return "<th class='pivottable-axis-label'>" + el + "</th>"
            }).forEach(function(e) {
                html += e
            })

            if (!options.cols.length) {
                html += "<th class='pivottable-total-label'>Totals</th>"
            } else {
                html += "<th></th>"
            }
            html += "</tr>"
        }

        var nullAggregator = {
            value: function() {
                return null
            },
            format: function() {
                return ""
            }
        }

        _.each(rowsNames, function(current_row_names, row_index) {
            html += "<tr>"
            _.each(current_row_names, function(row, current_row_index) {
                var x = spanSize(rowsNames, row_index, current_row_index)
                if (x !== -1) {
                    html += "<th class='pivottable-row-label' rowspan='" + x + "'"
                    if (current_row_index === options.rows.length - 1 && options.cols.length !== 0) {
                        html += " colspan='2'"
                    }
                    html += ">" + row + "</th>"
                }
            })

            var _ref2 = table[current_row_names.join(utils.joinString)]

            // Fix: Really bad loop
            _.each(colsNames, function(current_col_names, col_index) {
                var _ref3 = _ref2 != null ? _ref2[current_col_names.join(utils.joinString)] : null,
                    aggregator = _ref3 != null ? _ref3 : nullAggregator,
                    val = aggregator.value()
                html += "<td class='pivottable-value' data-row='" + row_index + "' data-col='" + col_index + "' data-value='" + val + "'>" + aggregator.format(val) + "</td>"
            })

            var _ref4 = totals.rows[current_row_names.join(utils.joinString)],
                totalAggregator = _ref4 != null ? _ref4 : nullAggregator,
                val = totalAggregator.value()
            html += "<td class='pivottable-total-row' data-value='" + val + "' data-for-row='" + row_index + "'>" + totalAggregator.format(val) + "</td>"

            html += "</tr>"
        })

        html += "<tr><th class='pivottable-total-label' colspan='" + (options.rows.length + (options.cols.length === 0 ? 0 : 1)) + "'>Totals</th>"
        _.each(colsNames, function(ca, j) {
            var _ref5 = totals.cols[ca.join(utils.joinString)],
                totalAggregator = _ref5 != null ? _ref5 : nullAggregator,
                val = totalAggregator.value()

            html += "<td class='pivottable-total-col' data-value='" + val + "' data-for='for" + j + "'>" + totalAggregator.format(val) + "</td>"
        })
        var val = totals.all.value()

        html += "<td class='pivottable-grand-total' data-value='" + val + "'>" + totals.all.format(val) + "</td></tr>"
        html += "</tbody></table>"

        options.container.html(html).data("dimensions", [rowsNames.length, colsNames.length])
        options.postProcessor(options.container)
    }
})