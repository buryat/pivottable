/**
 * @author i@sedictor.ru
 * @date 7/13/13
 * @time 2:55 AM
 * @description
 */
define(["jquery"], function($) {
    $.fn.heatmap = function(scope) {
        var colorGen, heatmapper, i, j, numCols, numRows, _ref
        if (scope == null) {
            scope = "heatmap"
        }
        _ref = this.data("dimensions"), numRows = _ref[0], numCols = _ref[1]
        colorGen = function(color, min, max) {
            var hexGen
            hexGen = (function() {
                switch (color) {
                    case "red":
                        return function(hex) {
                            return "ff" + hex + hex
                        }
                    case "green":
                        return function(hex) {
                            return "" + hex + "ff" + hex
                        }
                    case "blue":
                        return function(hex) {
                            return "" + hex + hex + "ff"
                        }
                }
            })()
            return function(x) {
                var hex, intensity
                intensity = 255 - Math.round(255 * (x - min) / (max - min))
                hex = intensity.toString(16).split(".")[0]
                if (hex.length === 1) {
                    hex = 0 + hex
                }
                return hexGen(hex)
            }
        }
        heatmapper = function(scope, color) {
            var colorFor, forEachCell, values
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
            colorFor = colorGen(color, Math.min.apply(Math, values), Math.max.apply(Math, values))
            return forEachCell(function(x, elem) {
                return elem.css("background-color", "#" + colorFor(x))
            })
        }.bind(this)
        switch (scope) {
            case "heatmap":
                heatmapper(".pvtVal", "red")
                break
            case "rowheatmap":
                for (i = 0; 0 <= numRows ? i < numRows : i > numRows; 0 <= numRows ? i++ : i--) {
                    heatmapper(".pvtVal.row" + i, "red")
                }
                break
            case "colheatmap":
                for (j = 0; 0 <= numCols ? j < numCols : j > numCols; 0 <= numCols ? j++ : j--) {
                    heatmapper(".pvtVal.col" + j, "red")
                }
        }
        heatmapper(".pvtTotal.rowTotal", "red")
        heatmapper(".pvtTotal.colTotal", "red")
        return this
    }

})