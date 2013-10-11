#PivotTable.js

PivotTable.js is a Javascript Pivot Table library with drag'n'drop functionality built on top of jQuery/jQueryUI and originally written in CoffeeScript by [Nicolas Kruchten](http://nicolas.kruchten.com) at [Datacratic](http://datacratic.com), rewritten by [Vadim Semenov](http://twitter.com/databuryat).

##What does it do?

PivotTable.js' basic function is to turn a data set into a summary table and then optionally add a true 2-d drag'n'drop UI to allow a user to manipulate this summary table, turning it into a pivot table, very similar to the one found in older versions of Microsoft Excel with a bunch of extra developer-oriented features and some visualization effects. 

##Differences between this and original version
* Replaced CoffeeScript sources with JavaScript.
* Renamed variables and methods to be self-comprehensible, splitted components to modules.
* RequireJS compatible.
* Twitter Bootstrap v2 compatible.
* Dynamic data reloading.
* Fixed few rendering issues.
* Enhanced performance (tables are reloaded more efficient on effects switching, optimized data loading and rendering).
* Supports multiple pivot tables on the same page.
* Standardized css classes and added additional classes.

##Demos

A demo of PivotTable.js loaded up with a sample dataset of Canadian Members of Parliament as of 2012 can be found here: [PivotTable.js demo](http://nicolaskruchten.github.io/pivottable/examples/mps_prepop.html). 

A version of this demo which include Google Chart renderers can be found here: [Google Charts demo](http://nicolaskruchten.github.io/pivottable/examples/gchart.html).

Finally, here is a demo where you can view your own data from a local CSV file, all in-browser with no server support: [Local CSV demo](http://nicolaskruchten.github.io/pivottable/examples/local.html).

##How do I use the UI?

PivotTable.js implements a pivot table drag'n'drop UI similar to that found in popular spreadsheet programs. You can drag attributes into/out of the row/column areas, and choose a summary function. If you choose a summary function that takes an argument, like 'average', you'll have to drag a attribute onto the dropdown. 
There is a [step-by-step tutorial](https://github.com/nicolaskruchten/pivottable/wiki/UI-Tutorial) in the wiki but the following animation gives you a taste of the interaction. It's based on the Canadian Parliament 2012 dataset.

![image](http://nicolaskruchten.github.io/pivottable/images/animation.gif)

##Copyright & Licence

See [License file](http://github.com/buryat/pivottable/LICENSE.md)