/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 2:54 AM
 * @description
 */
define([
    "underscore",
    "jquery",
    "pivottable/utilities",
    "pivottable/Pivot",
    "jqueryui",
    "pivottable/jquery.barchart",
    "pivottable/jquery.heatmap"
], function(_, $, utils, Pivot) {
    var defaults = {
        container: null,
        data: null,
        derivedAttributes: {},
        aggregators: utils.aggregators,
        effects: utils.effects,
        hiddenAxes: [],
        cols: [],
        rows: [],
        vals: []
    }

    return function PivotUI(opts) {
        var aggregator, axisValues, c, colList, controls, effectNames, form, k, pivotTable, radio, refresh, tblCols, tr1, tr2, uiTable, x, y, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _len6, _m, _n, _ref, _ref2, _ref3, _ref4, _ref5

        opts = $.extend(defaults, opts)

        var containerEl = opts.container,
            input = opts.data

        if (typeof input == "function") {
            input = input()
        }

        input = utils.convertToArray(input)

        console.log(input)

        tblCols = (function() {
            var _ref, _results
            _ref = input[0]
            _results = []
            for (k in _ref) {
                if (!_ref.hasOwnProperty(k)) continue
                _results.push(k)
            }
            return _results
        })()
        _ref = opts.derivedAttributes
        for (c in _ref) {
            if (!_ref.hasOwnProperty(c)) continue
            if ((tblCols.indexOf(c) < 0)) {
                tblCols.push(c)
            }
        }
        axisValues = {}
        for (_i = 0, _len = tblCols.length; _i < _len; _i++) {
            x = tblCols[_i]
            axisValues[x] = {}
        }
        utils.forEachRow(input, opts.derivedAttributes, function(row) {
            var k, v, _base, _ref2, _results
            _results = []
            for (k in row) {
                if (!row.hasOwnProperty(k)) continue
                v = row[k]
                if (v == null) {
                    v = "null"
                }
                if ((_ref2 = (_base = axisValues[k])[v]) == null) {
                    _base[v] = 0
                }
                _results.push(axisValues[k][v]++)
            }
            return _results
        })
        uiTable = $("<table class='table table-bordered' cellpadding='5'>")
        effectNames = (function() {
            var _ref2, _results
            _ref2 = opts.effects
            _results = []
            for (x in _ref2) {
                if (!_ref2.hasOwnProperty(x)) continue
                y = _ref2[x]
                _results.push(x)
            }
            return _results
        })()
        if (effectNames.length !== 0) {
            effectNames.unshift("None")
            controls = $("<td colspan='2' align='center'>")
            form = $("<form>").addClass("form-inline")
            controls.append(form)
            form.append($("<strong>").text("Effects:"))
            for (_j = 0, _len2 = effectNames.length; _j < _len2; _j++) {
                x = effectNames[_j]
                radio = $("<input type='radio' name='effects' id='effects_" + (x.replace(/\s/g, "")) + "'>").css({
                    "margin-left": "15px",
                    "margin-right": "5px"
                }).val(x)
                if (x === "None") {
                    radio.attr("checked", "checked")
                }
                form.append(radio).append($("<label class='checkbox inline' for='effects_" + (x.replace(/\s/g, "")) +
                                            "'>").text(x))
            }
            uiTable.append($("<tr>").append(controls))
        }
        colList = $("<td colspan='2' id='unused' class='pvtAxisContainer pvtHorizList'>")
        for (_k = 0, _len3 = tblCols.length; _k < _len3; _k++) {
            c = tblCols[_k]
            if (opts.hiddenAxes.indexOf(c) < 0) {
                (function(c) {
                    var btns, colLabel, filterItem, k, numKeys, v, valueList, _l, _len4, _ref2
                    numKeys = Object.keys(axisValues[c]).length
                    colLabel = $("<nobr>").text(c)
                    valueList = $("<div>").css({
                        "z-index": 100,
                        "width": "280px",
                        "height": "350px",
                        "overflow": "scroll",
                        "border": "1px solid gray",
                        "background": "white",
                        "display": "none",
                        "position": "absolute",
                        "padding": "20px"
                    })
                    valueList.append($("<strong>").text("" + numKeys + " values for " + c))
                    if (numKeys > 20) {
                        valueList.append($("<p>").text("(too many to list)"))
                    } else {
                        btns = $("<p>")
                        btns.append($("<button>").text("Select All").bind("click", function() {
                            return valueList.find("input").attr("checked", true)
                        }))
                        btns.append($("<button>").text("Select None").bind("click", function() {
                            return valueList.find("input").attr("checked", false)
                        }))
                        valueList.append(btns)
                        _ref2 = Object.keys(axisValues[c]).sort()
                        for (_l = 0, _len4 = _ref2.length; _l < _len4; _l++) {
                            k = _ref2[_l]
                            v = axisValues[c][k]
                            filterItem = $("<label>")
                            filterItem.append($("<input type='checkbox' class='pvtFilter'>").attr("checked",
                                true).data("filter", [c, k]))
                            filterItem.append($("<span>").text("" + k + " (" + v + ")"))
                            valueList.append($("<p>").append(filterItem))
                        }
                    }
                    colLabel.bind("dblclick", function(e) {
                        valueList.css({
                            left: e.pageX,
                            top: e.pageY
                        }).toggle()
                        valueList.bind("click", function(e) {
                            return e.stopPropagation()
                        })
                        return $(document).one("click", function() {
                            refresh()
                            return valueList.toggle()
                        })
                    })
                    return colList.append($("<li class='label label-info' id='axis_" + (c.replace(/\s/g, "")) +
                                            "'>").append(colLabel).append(valueList))
                })(c)
            }
        }
        uiTable.append($("<tr>").append(colList))
        tr1 = $("<tr>")
        aggregator = $("<select id='aggregator'>").css("margin-bottom", "5px").bind("change", function() {
            return refresh()
        })
        _ref2 = opts.aggregators
        for (x in _ref2) {
            if (!_ref2.hasOwnProperty(x)) continue
            aggregator.append($("<option>").val(x).text(x))
        }
        tr1.append($("<td id='vals' class='pvtAxisContainer pvtHorizList'>").css("text-align",
            "center").append(aggregator).append($("<br>")))
        tr1.append($("<td id='cols' class='pvtAxisContainer pvtHorizList'>"))
        uiTable.append(tr1)
        tr2 = $("<tr>")
        tr2.append($("<td valign='top' id='rows' class='pvtAxisContainer'>"))
        pivotTable = $("<td valign='top'>")
        tr2.append(pivotTable)
        uiTable.append(tr2)
        containerEl.html(uiTable)
        _ref3 = opts.cols
        for (_l = 0, _len4 = _ref3.length; _l < _len4; _l++) {
            x = _ref3[_l]
            $("#cols").append($("#axis_" + (x.replace(/\s/g, ""))))
        }
        _ref4 = opts.rows
        for (_m = 0, _len5 = _ref4.length; _m < _len5; _m++) {
            x = _ref4[_m]
            $("#rows").append($("#axis_" + (x.replace(/\s/g, ""))))
        }
        _ref5 = opts.vals
        for (_n = 0, _len6 = _ref5.length; _n < _len6; _n++) {
            x = _ref5[_n]
            $("#vals").append($("#axis_" + (x.replace(/\s/g, ""))))
        }
        if (opts.aggregatorName != null) {
            $("#aggregator").val(opts.aggregatorName)
        }
        if (opts.effectsName != null) {
            $("#effects_" + (opts.effectsName.replace(/\s/g, ""))).attr('checked', true)
        }
        refresh = function() {
            var effect, exclusions, subopts, vals
            subopts = {
                derivedAttributes: opts.derivedAttributes
            }
            subopts.cols = []
            subopts.rows = []
            vals = []
            $("#rows li nobr").each(function() {
                return subopts.rows.push($(this).text())
            })
            $("#cols li nobr").each(function() {
                return subopts.cols.push($(this).text())
            })
            $("#vals li nobr").each(function() {
                return vals.push($(this).text())
            })
            subopts.aggregator = opts.aggregators[aggregator.val()](vals)
            exclusions = []
            $('input.pvtFilter').not(':checked').each(function() {
                return exclusions.push($(this).data("filter"))
            })
            subopts.filter = function(row) {
                var v, _len7, _o, _ref6
                for (_o = 0, _len7 = exclusions.length; _o < _len7; _o++) {
                    _ref6 = exclusions[_o], k = _ref6[0], v = _ref6[1]
                    if (row[k] === v) {
                        return false
                    }
                }
                return true
            }
            if (effectNames.length !== 0) {
                effect = $('input[name=effects]:checked').val()
                if (effect !== "None") {
                    subopts.postProcessor = opts.effects[effect]
                }
            }

            subopts.container = pivotTable
            subopts.data = input

            return new Pivot(subopts)
        }
        refresh()
        $('input[name=effects]').bind("change", refresh)
        $(".pvtAxisContainer").sortable({
            connectWith: ".pvtAxisContainer",
            items: 'li'
        }).bind("sortstop", refresh)
    }

})