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

    return function Renderer(option, colsNames, rowsNames, table, totals) {
        rowsNames = rowsNames.sort(arrSort)
        colsNames = colsNames.sort(arrSort)


        var result = $("<table class='table table-bordered pivottable'>")

        _.each(option.cols, function(col, j) {
            var tr = $("<tr>")
            if (j == 0 && option.rows.length) {
                tr.append($("<th>").attr("colspan", option.rows.length).attr("rowspan", option.cols.length))
            }
            tr.append($("<th class='pvtAxisLabel'>").text(col))
            _.each(colsNames, function(col_names, i) {
                var x = spanSize(colsNames, i, j)
                if (x !== -1) {
                    var th = $("<th class='pvtColLabel'>").text(col_names[j]).attr("colspan", x)
                    if (j === option.cols.length - 1 && option.rows.length) {
                        th.attr("rowspan", 2)
                    }
                    tr.append(th)
                }
            })
            if (j == 0) {
                tr.append($("<th class='pvtTotalLabel'>").text("Totals").attr("rowspan",
                    option.cols.length + (option.rows.length ? 0 : 1)))
            }
            result.append(tr)
        })

        if (option.rows.length) {
            var tr = $("<tr>")

            _.map(option.rows,function(el) {
                return $("<th class='pvtAxisLabel'>").text(el)
            }).forEach(function(e) {
                    tr.append(e)
                })

            var th = $("<th>")
            if (!option.cols.length) {
                th.addClass("pvtTotalLabel").text("Totals")
            }
            tr.append(th)
            result.append(tr)
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
            tr = $("<tr>")
            _.each(current_row_names, function(row, current_row_index) {
                var x = spanSize(rowsNames, row_index, current_row_index)
                if (x !== -1) {
                    th = $("<th class='pvtRowLabel'>").text(row).attr("rowspan", x)
                    if (current_row_index === option.rows.length - 1 && option.cols.length !== 0) {
                        th.attr("colspan", 2)
                    }
                    tr.append(th)
                }
            })

            var _ref2 = table[current_row_names.join(utils.joinString)]

            // Fix: Really bad loop
            _.each(colsNames, function(current_col_names, col_index) {
                var _ref3 = _ref2 != null ? _ref2[current_col_names.join(utils.joinString)] : null,
                    aggregator = _ref3 != null ? _ref3 : nullAggregator,
                    val = aggregator.value()
                tr.append(
                    $("<td class='pvtVal row" + row_index + " col" + col_index + "'>")
                        .text(aggregator.format(val))
                        .data("value", val)
                )
            })

            var _ref4 = totals.rows[current_row_names.join(utils.joinString)],
                totalAggregator = _ref4 != null ? _ref4 : nullAggregator,
                val = totalAggregator.value()
            tr.append(
                $("<td class='pvtTotal rowTotal'>")
                    .text(totalAggregator.format(val))
                    .data("value", val)
                    .data("for", "row" + row_index)
            )

            result.append(tr)
        })

        tr = $("<tr>")
        th = $("<th class='pvtTotalLabel'>").text("Totals")
        th.attr("colspan", option.rows.length + (option.cols.length === 0 ? 0 : 1))
        tr.append(th)
        _.each(colsNames, function(ca, j) {
            var _ref5 = totals.cols[ca.join(utils.joinString)],
                totalAggregator = _ref5 != null ? _ref5 : nullAggregator,
                val = totalAggregator.value()

            tr.append(
                $("<td class='pvtTotal colTotal'>")
                    .text(totalAggregator.format(val))
                    .data("value", val).
                    data("for", "col" + j)
            )
        })
        var val = totals.all.value()
        tr.append($("<td class='pvtGrandTotal'>").text(totals.all.format(val)).data("value", val))
        result.append(tr)
        result.data("dimensions", [rowsNames.length, colsNames.length])

        return result
    }
})