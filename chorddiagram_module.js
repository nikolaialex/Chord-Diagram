var data = [
    { source: "Augsburg", target: "Bremen", value: 5 },
    { source: "Bremen", target: "Augsburg", value: 2 },
    { source: "Bremen", target: "Hamburg", value: 8 },
    { source: "Augsburg", target: "Chemnitz", value: 6 },
    { source: "Chemnitz", target: "Bremen", value: 2 },
    { source: "Hamburg", target: "Augsburg", value: 2 },
    { source: "München", target: "Augsburg", value: 4 }
];
var elem = "c1",
    tooltipElem = "tooltipDIV",
    colors = null,
    numberOfTicks = 1,
    ticksLabel = 1,
    segmentSize = 'outgoing',
    directed = true,
    sorting = null,
    sortingOrder = true,
    sortingTooltip = 'source',
    sortingOrderTooltip = true,
    tooltipSetting = 'movable',
    tooltipOrientation = 'horizontal';

function draw() {
    "use strict";

    document.getElementById(elem).innerHTML = '';

    new Chorddiagram.Chart({
        //Mandatory
        "elem": elem,
        "data": data,
        //Optional
        "tooltipElem": tooltipElem,
        "colors": null,
        "numberOfTicks": numberOfTicks,
        "numberOfTicksLabel": ticksLabel,
        "segmentSize": segmentSize,
        "directed": directed,
        "sorting": sorting,
        "sortingOrder": sortingOrder,
        "tooltipSetting": tooltipSetting,
        "sortingTooltip": sortingTooltip,
        "sortingOrderTooltip": sortingOrderTooltip,
        "tooltipOrientation": tooltipOrientation,
        "onClickNode": null,
        "onClickLink": null
    });
}

function getValues() {
    "use strict";

    sorting = document.getElementById('sorting').options[document.getElementById('sorting').selectedIndex].value;
    sortingOrder = JSON.parse(document.getElementById('sortingOrder').options[document.getElementById('sortingOrder').selectedIndex].value);
    segmentSize = document.getElementById('segmentSize').options[document.getElementById('segmentSize').selectedIndex].value;
    directed = JSON.parse(document.getElementById('directed').options[document.getElementById('directed').selectedIndex].value);
    numberOfTicks = JSON.parse(document.getElementById('numberOfTicks').options[document.getElementById('numberOfTicks').selectedIndex].value);
    ticksLabel = JSON.parse(document.getElementById('ticksLabel').options[document.getElementById('ticksLabel').selectedIndex].value);
    tooltipSetting = document.getElementById('tooltipSetting').options[document.getElementById('tooltipSetting').selectedIndex].value;
    sortingTooltip = document.getElementById('sortingTooltip').options[document.getElementById('sortingTooltip').selectedIndex].value;
    sortingOrderTooltip = JSON.parse(document.getElementById('sortingOrderTooltip').options[document.getElementById('sortingOrderTooltip').selectedIndex].value);
    tooltipOrientation = document.getElementById('tooltipOrientation').options[document.getElementById('tooltipOrientation').selectedIndex].value;
    draw();
}


draw();