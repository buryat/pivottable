/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 2:53 AM
 * @description
 */
define("pivottable/Pivot", ["underscore", "jquery", "pivottable/utilities", "pivottable/renderer"],
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

        return function Pivot(option) {
            option = $.extend(defaults, option)

            var containerEl = option.container,
                input = option.data

            if (typeof input == "function") {
                input = input()
            }

            var rows = [],
                rowAs = [],
                cols = [],
                colAs = [],
                tree = {},
                totals = {
                    rows: {},
                    cols: {},
                    all: option.aggregator()
                }

            utils.forEachRow(input, option.derivedAttributes, function(row) {
                var c, cA, r, rA
                if (option.filter(row)) {
                    cA = _.filter(row, function(val, col) {
                        return option.cols.indexOf(col) !== -1
                    })

                    c = cA.join("-")


                    rA = _.filter(row, function(val, col) {
                        return option.rows.indexOf(col) !== -1
                    })
                    r = rA.join("-")

                    totals.all.push(row)

                    if (r !== "") {
                        if (rows.indexOf(r) < 0) {
                            rowAs.push(rA)
                            rows.push(r)
                        }
                        if (!totals.rows[r]) {
                            totals.rows[r] = option.aggregator()
                        }
                        totals.rows[r].push(row)
                    }
                    if (c !== "") {
                        if (cols.indexOf(c) < 0) {
                            colAs.push(cA)
                            cols.push(c)
                        }
                        if (!totals.cols[c]) {
                            totals.cols[c] = option.aggregator()
                        }
                        totals.cols[c].push(row)
                    }
                    if (c !== "" && r !== "") {
                        if (!(r in tree)) {
                            tree[r] = {}
                        }
                        if (!(c in tree[r])) {
                            tree[r][c] = option.aggregator()
                        }

                        return tree[r][c].push(row)
                    }
                }
            })

            rowAs = rowAs.sort(arrSort)
            colAs = colAs.sort(arrSort)

            var html = Renderer(option, colAs, rowAs, tree, totals)

            containerEl.html(html)
            option.postProcessor(html)
        }

    })