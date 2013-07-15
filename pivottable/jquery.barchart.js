/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 2:56 AM
 * @description
 */
define(["jquery"], function($) {
    $.fn.barchart = function() {
        var _ref = this.data("dimensions"), numRows = _ref[0], numCols = _ref[1],
            barcharter = function(scope) {
                var forEachCell, max, scaler, values
                forEachCell = function(f) {
                    return this.find(scope).each(function() {
                        var x
                        x = $(this).data("value")
                        if ((x != null) && isFinite(x)) {
                            return f(x, $(this))
                        }
                    })
                }.bind(this)
                values = []
                forEachCell(function(x) {
                    return values.push(x)
                })
                max = Math.max.apply(Math, values)
                scaler = function(x) {
                    return 100 * x / (1.4 * max)
                }
                return forEachCell(function(x, elem) {
                    var text, wrapper
                    text = elem.text()
                    wrapper = $("<div>").css({
                        "position": "relative",
                        "height": "55px"
                    })
                    wrapper.append($("<div>").css({
                        "position": "absolute",
                        "bottom": 0,
                        "left": 0,
                        "right": 0,
                        "height": scaler(x) + "%",
                        "background-color": "gray"
                    }))
                    wrapper.append($("<div>").text(text).css({
                        "position": "relative",
                        "padding-left": "5px",
                        "padding-right": "5px"
                    }))
                    return elem.css({
                        "padding": 0,
                        "padding-top": "5px",
                        "text-align": "center"
                    }).html(wrapper)
                })
            }.bind(this)

        for (var i = 0; 0 <= numRows ? i < numRows : i > numRows; 0 <= numRows ? i++ : i--) {
            barcharter(".pivottable-value[data-row='" + i + "']")
        }
        barcharter(".pivottable-total-col")
        return this
    }

})