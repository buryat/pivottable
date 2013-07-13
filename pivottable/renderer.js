/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 7:14 AM
 * @description
 */
define("pivottable/renderer", ["jquery", "underscore"], function($, _) {
    spanSize = function(arr, i, j) {
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

    return function Renderer(option, colAs, rowAs, tree, totals) {
        var result = $("<table class='table table-bordered pivottable'>")

        _.each(option.cols, function(c, j) {
            var ji = parseInt(j)

            var tr = $("<tr>")
            if (ji === 0 && option.rows.length !== 0) {
                tr.append($("<th>").attr("colspan", option.rows.length).attr("rowspan", option.cols.length))
            }
            tr.append($("<th class='pvtAxisLabel'>").text(c))
            _.each(colAs, function(cA, i) {
                var x = spanSize(colAs, parseInt(i), ji)
                if (x !== -1) {
                    var th = $("<th class='pvtColLabel'>").text(cA[j]).attr("colspan", x)
                    if (ji === option.cols.length - 1 && option.rows.length !== 0) {
                        th.attr("rowspan", 2)
                    }
                    tr.append(th)
                }
            })
            if (ji === 0) {
                tr.append($("<th class='pvtTotalLabel'>").text("Totals").attr("rowspan",
                    option.cols.length + (option.rows.length === 0 ? 0 : 1)))
            }
            result.append(tr)
        })

        if (option.rows.length !== 0) {
            var tr = $("<tr>")

            _.map(option.rows,function(el) {
                return $("<th class='pvtAxisLabel'>").text(el)
            }).forEach(function(e) {
                    tr.append(e)
                })

            var th = $("<th>")
            if (option.cols.length === 0) {
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

        _.each(rowAs, function(rA, i) {
            tr = $("<tr>")
            _.each(rA, function(txt, j) {
                var x = spanSize(rowAs, parseInt(i), parseInt(j))
                if (x !== -1) {
                    th = $("<th class='pvtRowLabel'>").text(txt).attr("rowspan", x)
                    if (parseInt(j) === option.rows.length - 1 && option.cols.length !== 0) {
                        th.attr("colspan", 2)
                    }
                    tr.append(th)
                }
            })
            _.each(colAs, function(cA, j) {
                var _ref3 = tree[rA.join("-")][cA.join("-")],
                    aggregator = _ref3 != null ? _ref3 : nullAggregator,
                    val = aggregator.value()
                tr.append(
                    $("<td class='pvtVal row" + i + " col" + j + "'>")
                        .text(aggregator.format(val))
                        .data("value", val)
                )
            })

            var _ref4 = totals.rows[rA.join("-")],
                totalAggregator = _ref4 != null ? _ref4 : nullAggregator,
                val = totalAggregator.value()
            tr.append(
                $("<td class='pvtTotal rowTotal'>")
                    .text(totalAggregator.format(val))
                    .data("value", val)
                    .data("for", "row" + i)
            )

            result.append(tr)
        })

        tr = $("<tr>")
        th = $("<th class='pvtTotalLabel'>").text("Totals")
        th.attr("colspan", option.rows.length + (option.cols.length === 0 ? 0 : 1))
        tr.append(th)
        _.each(colAs, function(ca, j) {
            var _ref5 = totals.cols[ca.join("-")],
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
        result.data("dimensions", [rowAs.length, colAs.length])

        return result
    }
})