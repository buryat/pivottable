/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 2:54 AM
 * @description
 */
define(
    "pivottable/PivotUIAjax",
    [
        "underscore",
        "jquery",
        "pivottable/utilities",
        "pivottable/Pivot",
        "jqueryui"
    ],
    function(_, $, utils, Pivot) {
        var defaults = {
            container: null,
            data: null,
            aggregators: utils.aggregators,
            effects: utils.effects,
            hiddenAxes: [],
            cols: [],
            rows: [],
            vals: []
        }

        return function PivotUIAjax(options) {
            var aggregator, axisValues, colList, effectsSelect, effects, effectNames, pivotTable, refresh, fields, tr1, tr2, uiTable

            this.options = _.clone(defaults)
            _.extend(this.options, options)
            options = this.options

            var containerEl = options.container,
                input = options.data

            fields = options.fields
            axisValues = _.object(fields, fields.map(function() {
                return {}
            }))

            effectNames = _.keys(options.effects)

            var pivotObj

            this.refresh = refresh = function() {
                var effect,
                    exclusions = [],
                    vals = [],
                    subopts = {
                        derivedAttributes: options.derivedAttributes,
                        cols: [],
                        rows: []
                    }

                $(".pivottable-rows li > span", containerEl).each(function() {
                    return subopts.rows.push($(this).text())
                })
                $(".pivottable-cols li > span", containerEl).each(function() {
                    return subopts.cols.push($(this).text())
                })
                $(".pivottable-vals li > span", containerEl).each(function() {
                    return vals.push($(this).text())
                })
                subopts.aggregator = options.aggregators[aggregator.val()](vals)
                $('input.pivottable-filter', containerEl).not(':checked').each(function() {
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
                    effect = $(effectsSelect).val()
                    subopts.postProcessor = options.effects[effect]
                }

                subopts.container = pivotTable

                if (!pivotObj) {
                    pivotObj = new Pivot(subopts)
                } else {
                    pivotObj.updateOptions(subopts)
                }

                input(subopts.rows, subopts.cols, function(input) {
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

                    pivotObj.updateOptions({data: input}).refresh()
                })
            }

            uiTable = $("<table class='pivottable table-bordered'>")

            effects = $("<td>")
            if (effectNames.length) {
                effectsSelect = $("<select class='pivottable-effects'>");
                effectNames.forEach(function(x) {
                    $(effectsSelect).append("<option value='" + x + "'>" + x + "</option>");
                })
                effects.append(effectsSelect);
            }

            colList = $("<td colspan='2' class='pivottable-axis-container pivottable-horizontal-list'>")

            fields.forEach(function(c) {
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

            uiTable.append($("<tr>").append(effects).append(colList))

            tr1 = $("<tr>")
            aggregator = $("<select class='pivottable-aggregator-select'>").bind("change", refresh)
            _.each(options.aggregators, function(_, x) {
                aggregator.append("<option value='" + x + "'>" + x + "</option>")
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
                $(".pivottable-cols", containerEl).append($("#axis_" + (x.replace(/\s/g, "")), containerEl))
            })
            options.rows.forEach(function(x) {
                $(".pivottable-rows", containerEl).append($("#axis_" + (x.replace(/\s/g, "")), containerEl))
            })
            options.vals.forEach(function(x) {
                $(".pivottable-vals", containerEl).append($("#axis_" + (x.replace(/\s/g, "")), containerEl))
            })
            if (options.aggregatorName != null) {
                $(".pivottable-aggregator-select", containerEl).val(options.aggregatorName)
            }
            if (options.effectName != null) {
                $("option[value='" + options.effectName + "']", effectsSelect).attr("selected", true);
            }

            $(effectsSelect).bind("change", function refreshEffects() {
                var effect = $(this).val()

                options.effects[effect](pivotTable)
            })
            $(".pivottable-axis-container", containerEl)
                .sortable({
                    connectWith: ".pivottable-axis-container",
                    items: 'li'
                })
                .bind("sortstop", refresh)
        }
    })