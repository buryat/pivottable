/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 2:54 AM
 * @description
 */
define(
    "pivottable/PivotUI",
    [
        "underscore",
        "jquery",
        "pivottable/utilities",
        "pivottable/Pivot",
        "jqueryui",
        "pivottable/jquery.barchart",
        "pivottable/jquery.heatmap"
    ],
    function(_, $, utils, Pivot) {
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

        return function PivotUI(options) {
            var aggregator, axisValues, colList, controls, effectNames, form, pivotTable, radio, refresh, tblCols, tr1, tr2, uiTable

            this.options = _.clone(defaults)
            _.extend(this.options, options)
            options = this.options

            var containerEl = options.container,
                input = options.data

            if (typeof input == "function") {
                input = input()
            }

            input = utils.convertToArray(input)

            tblCols = _.union(_.keys(input[0]), _.keys(options.derivedAttributes))
            axisValues = _.object(tblCols, tblCols.map(function() {
                return {}
            }))

            utils.forEachRow(input, options.derivedAttributes, function(row) {
                _.map(row, function(v, k) {
                    if (v == null) {
                        v = "null"
                    }
                    if (axisValues[k][v] == null) {
                        axisValues[k][v] = 0
                    }
                    return axisValues[k][v]++
                })
            })

            effectNames = _.keys(options.effects)

            var pivotObj

            refresh = function() {
                var effect,
                    exclusions = [],
                    vals = [],
                    subopts = {
                        derivedAttributes: options.derivedAttributes,
                        cols: [],
                        rows: []
                    }

                $(".pivottable-rows li > span").each(function() {
                    return subopts.rows.push($(this).text())
                })
                $(".pivottable-cols li > span").each(function() {
                    return subopts.cols.push($(this).text())
                })
                $(".pivottable-vals li > span").each(function() {
                    return vals.push($(this).text())
                })
                subopts.aggregator = options.aggregators[aggregator.val()](vals)
                $('input.pivottable-filter').not(':checked').each(function() {
                    return exclusions.push($(this).data("filter"))
                })
                subopts.filter = function(row) {
                    for (var i = 0, l = exclusions.length; i < l; i++) {
                        var exclusion = exclusions[i],
                            k = exclusion[0],
                            v = exclusion[1]

                        if (row[k] == v) {
                            return false
                        }
                    }

                    return true
                }
                if (effectNames.length) {
                    effect = $("input[name='pivottable-effects']:checked").val()
                    subopts.postProcessor = options.effects[effect]
                }

                subopts.container = pivotTable
                subopts.data = input

                if (!pivotObj) {
                    pivotObj = new Pivot(subopts)
                } else {
                    pivotObj.updateOptions(subopts)
                }
            }

            uiTable = $("<table class='pivottable table-bordered'>")

            if (effectNames.length) {
                controls = $("<td colspan='2'>")
                form = $("<form class='form-inline pivottable-effects'>")
                controls.append(form)
                form.append($("<strong>").text("Effects:"))

                effectNames.forEach(function(x) {
                    radio = $("<input type='radio' name='pivottable-effects' id='pivottable-effects_" + (x.replace(/\s/g, "")) + "'>").val(x)
                    if (x === "None") {
                        radio.attr("checked", "checked")
                    }
                    form.append(radio) .append(
                            $("<label class='checkbox inline' for='pivottable-effects_" + (x.replace(/\s/g, "")) + "'>").text(x)
                        )
                })
                uiTable.append($("<tr>").append(controls))
            }

            colList = $("<td colspan='2' class='pivottable-axis-container pivottable-horizontal-list'>")

            tblCols.forEach(function(c) {
                if (options.hiddenAxes.indexOf(c) < 0) {
                    (function(c) {
                        var btns, colLabel, filterItem, numKeys, valueList
                        numKeys = Object.keys(axisValues[c]).length
                        colLabel = $("<span>").text(c)
                        valueList = $("<div class='pivottable-values-list'>")
                        valueList.append($("<strong>").text("" + numKeys + " values for " + c))
                        if (numKeys > 20) {
                            valueList.append($("<p>").text("(too many to list)"))
                        } else {
                            btns = $("<p>")
                            btns.append($("<button>").text("Select All").bind("click", function() {
                                return valueList.find("input").prop("checked", true)
                            }))
                            btns.append($("<button>").text("Select None").bind("click", function() {
                                return valueList.find("input").prop("checked", false)
                            }))
                            valueList.append(btns)
                            Object.keys(axisValues[c]).sort().forEach(function(k) {
                                var v = axisValues[c][k]
                                filterItem = $("<label>")
                                filterItem.append($("<input type='checkbox' class='pivottable-filter'>").attr("checked", true).data("filter", [c, k]))
                                filterItem.append($("<span>").text("" + k + " (" + v + ")"))
                                valueList.append($("<p>").append(filterItem))
                            })
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
                        return colList.append(
                            $("<li class='label label-info' id='axis_" + (c.replace(/\s/g, "")) + "'>")
                                .append(colLabel)
                                .append(valueList)
                        )
                    })(c)
                }
            })
            uiTable.append($("<tr>").append(colList))
            tr1 = $("<tr>")
            aggregator = $("<select class='pivottable-aggregator-select'>").css("margin-bottom", "5px").bind("change", refresh)
            _.each(options.aggregators, function(_, x) {
                aggregator.append($("<option>").val(x).text(x))
            })
            tr1.append($("<td class='pivottable-vals pivottable-axis-container pivottable-horizontal-list'>").append(aggregator))
            tr1.append($("<td class='pivottable-cols pivottable-axis-container pivottable-horizontal-list'>"))
            uiTable.append(tr1)
            tr2 = $("<tr>")
            tr2.append($("<td class='pivottable-rows pivottable-axis-container'>"))
            pivotTable = $("<td>")
            tr2.append(pivotTable)
            uiTable.append(tr2)
            containerEl.html(uiTable)

            options.cols.forEach(function(x) {
                $(".pivottable-cols").append($("#axis_" + (x.replace(/\s/g, ""))))
            })
            options.rows.forEach(function(x) {
                $(".pivottable-rows").append($("#axis_" + (x.replace(/\s/g, ""))))
            })
            options.vals.forEach(function(x) {
                $(".pivottable-vals").append($("#axis_" + (x.replace(/\s/g, ""))))
            })
            if (options.aggregatorName != null) {
                $(".pivottable-aggregator-select").val(options.aggregatorName)
            }
            if (options.effectsName != null) {
                $("#pivottable-effects_" + (options.effectsName.replace(/\s/g, ""))).attr('checked', true)
            }

            refresh()
            $("input[name='pivottable-effects']").bind("change", refresh)
            $(".pivottable-axis-container")
                .sortable({
                    connectWith: ".pivottable-axis-container",
                    items: 'li'
                })
                .bind("sortstop", refresh)
        }
    })