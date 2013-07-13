/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 2:36 AM
 * @description
 */
define(function() {
    /**
     * @param {string} nStr
     * @returns {string}
     */
    function addCommas(nStr) {
        var rgx, x, x1, x2
        nStr += ''
        x = nStr.split('.')
        x1 = x[0]
        x2 = x.length > 1 ? '.' + x[1] : ''
        rgx = /(\d+)(\d{3})/
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1,$2')
        }
        return x1 + x2
    }

    /**
     *
     * @param sigfig
     * @param [scaler]
     * @returns {Function}
     */
    function numberFormat(sigfig, scaler) {
        if (sigfig == null) {
            sigfig = 3
        }
        if (scaler == null) {
            scaler = 1
        }
        return function(x) {
            if (x === 0 || isNaN(x) || !isFinite(x)) {
                return ""
            } else {
                return addCommas((scaler * x).toFixed(sigfig))
            }
        }
    }

    var aggregatorTemplates = {
        sum: function(sigfig, scaler) {
            if (sigfig == null) {
                sigfig = 3
            }
            if (scaler == null) {
                scaler = 1
            }
            return function(_arg) {
                var field
                field = _arg[0]
                return function() {
                    return {
                        sum: 0,
                        push: function(row) {
                            if (!isNaN(parseFloat(row[field]))) {
                                return this.sum += parseFloat(row[field])
                            }
                        },
                        value: function() {
                            return this.sum
                        },
                        format: numberFormat(sigfig, scaler)
                    }
                }
            }
        },
        average: function(sigfig, scaler) {
            if (sigfig == null) {
                sigfig = 3
            }
            if (scaler == null) {
                scaler = 1
            }
            return function(_arg) {
                var field
                field = _arg[0]
                return function() {
                    return {
                        sum: 0,
                        len: 0,
                        push: function(row) {
                            if (!isNaN(parseFloat(row[field]))) {
                                this.sum += parseFloat(row[field])
                                return this.len++
                            }
                        },
                        value: function() {
                            return this.sum / this.len
                        },
                        format: numberFormat(sigfig, scaler)
                    }
                }
            }
        },
        sumOverSum: function(sigfig, scaler) {
            if (sigfig == null) {
                sigfig = 3
            }
            if (scaler == null) {
                scaler = 1
            }
            return function(_arg) {
                var num = _arg[0],
                    denom = _arg[1]
                return function() {
                    return {
                        sumNum: 0,
                        sumDenom: 0,
                        push: function(row) {
                            if (!isNaN(parseFloat(row[num]))) {
                                this.sumNum += parseFloat(row[num])
                            }
                            if (!isNaN(parseFloat(row[denom]))) {
                                return this.sumDenom += parseFloat(row[denom])
                            }
                        },
                        value: function() {
                            return this.sumNum / this.sumDenom
                        },
                        format: numberFormat(sigfig, scaler)
                    }
                }
            }
        },
        sumOverSumBound80: function(sigfig, scaler, upper) {
            if (sigfig == null) {
                sigfig = 3
            }
            if (scaler == null) {
                scaler = 1
            }
            if (upper == null) {
                upper = true
            }
            return function(_arg) {
                var num = _arg[0],
                    denom = _arg[1]
                return function() {
                    return {
                        sumNum: 0,
                        sumDenom: 0,
                        push: function(row) {
                            if (!isNaN(parseFloat(row[num]))) {
                                this.sumNum += parseFloat(row[num])
                            }
                            if (!isNaN(parseFloat(row[denom]))) {
                                return this.sumDenom += parseFloat(row[denom])
                            }
                        },
                        value: function() {
                            var sign
                            sign = upper ? 1 : -1
                            return (0.821187207574908 / this.sumDenom + this.sumNum / this.sumDenom +
                                    1.2815515655446004 * sign *
                                    Math.sqrt(0.410593603787454 / (this.sumDenom * this.sumDenom) +
                                              (this.sumNum * (1 - this.sumNum / this.sumDenom)) /
                                              (this.sumDenom * this.sumDenom))) /
                                   (1 + 1.642374415149816 / this.sumDenom)
                        },
                        format: numberFormat(sigfig, scaler)
                    }
                }
            }
        }
    }

    function deriveAttributes(row, derivedAttributes, f) {
        var k, v, _ref, _ref2
        for (k in derivedAttributes) {
            if (!derivedAttributes.hasOwnProperty(k)) continue
            v = derivedAttributes[k]
            row[k] = (_ref = v(row)) != null ? _ref : row[k]
        }
        for (k in row) {
            if (!row.hasOwnProperty(k)) continue

            if ((_ref2 = row[k]) == null) {
                row[k] = "null"
            }
        }
        return f(row)
    }

    return {
        aggregators: {
            count: function() {
                return function() {
                    return {
                        count: 0,
                        push: function() {
                            return this.count++
                        },
                        value: function() {
                            return this.count
                        },
                        format: numberFormat(0)
                    }
                }
            },
            countUnique: function(_arg) {
                var field
                field = _arg[0]
                return function() {
                    return {
                        uniq: [],
                        push: function(row) {
                            var _ref = row[field]
                            if (this.uniq.indexOf(_ref) === -1) {
                                return this.uniq.push(row[field])
                            }
                        },
                        value: function() {
                            return this.uniq.length
                        },
                        format: numberFormat(0)
                    }
                }
            },
            listUnique: function(_arg) {
                var field
                field = _arg[0]
                return function() {
                    return {
                        uniq: [],
                        push: function(row) {
                            var _ref = row[field]
                            if (this.uniq.indexOf(_ref) === -1) {
                                return this.uniq.push(row[field])
                            }
                        },
                        value: function() {
                            return this.uniq.join(", ")
                        },
                        format: function(x) {
                            return x
                        }
                    }
                }
            },
            intSum: aggregatorTemplates.sum(0),
            sum: aggregatorTemplates.sum(3),
            average: aggregatorTemplates.average(3),
            sumOverSum: aggregatorTemplates.sumOverSum(3),
            ub80: aggregatorTemplates.sumOverSumBound80(3, 1, true),
            lb80: aggregatorTemplates.sumOverSumBound80(3, 1, false)
        },

        effects: {
            "Row Barchart": function(x) {
                return x.barchart()
            },
            "Heatmap": function(x) {
                return x.heatmap()
            },
            "Row Heatmap": function(x) {
                return x.heatmap("rowheatmap")
            },
            "Col Heatmap": function(x) {
                return x.heatmap("colheatmap")
            }
        },

        derivers: {
            bin: function(selector, binWidth) {
                var select
                if ("string" === typeof selector) {
                    select = function(x) {
                        return x[selector]
                    }
                } else {
                    select = selector
                }
                return function(row) {
                    return (select(row) - select(row) % binWidth)
                }
            }
        },

        /**
         *
         * @param {array|function} input
         * @param derivedAttributes
         * @param {function} f
         * @returns {*}
         */
        forEachRow: function(input, derivedAttributes, f) {
            var addRow, compactRow, i, j, k, row, tblCols, _i, _len, _ref, _results, _results2
            addRow = function(row) {
                return deriveAttributes(row, derivedAttributes, f)
            }
            if (Object.prototype.toString.call(input) === '[object Function]') {
                return input(addRow)
            } else if (Array.isArray(input)) {
                if (Array.isArray(input[0])) {
                    _results = []
                    for (i in input) {
                        if (!input.hasOwnProperty(i)) continue
                        compactRow = input[i]
                        if (i > 0) {
                            row = {}
                            _ref = input[0]
                            for (j in _ref) {
                                if (!_ref.hasOwnProperty(j)) continue
                                k = _ref[j]
                                row[k] = compactRow[j]
                            }
                            _results.push(addRow(row))
                        }
                    }
                    return _results
                } else {
                    _results2 = []
                    for (_i = 0, _len = input.length; _i < _len; _i++) {
                        row = input[_i]
                        _results2.push(addRow(row))
                    }
                    return _results2
                }
            } else {
                tblCols = []
                $("thead > tr > th", input).each(function() {
                    return tblCols.push($(this).text())
                })
                return $("tbody > tr", input).each(function() {
                    row = {}
                    $("td", this).each(function(j) {
                        return row[tblCols[j]] = $(this).text()
                    })
                    return addRow(row)
                })
            }
        },

        convertToArray: function(input) {
            var result
            result = []
            this.forEachRow(input, {}, function(row) {
                return result.push(row)
            })
            return result
        }
    }
})
