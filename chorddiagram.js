(function () {
    var Chorddiagram;
    Chorddiagram = window.Chorddiagram = {};

    Chorddiagram.Chart = function (_config) {
        /*
            Mandatory attributes
            ====================
            data            contains all connections which should be displayed in the chord diagram. The structure of data is an array with several objects 
                            as the following:
                                {   source:   name of the node from which the connection comes
                                    target:   name of the node to which the connection goes
                                    value:    strength of the link
                                }
                            possible values: any in the above described format
            elem            is the id of a <div> in which the chord diagram should be drawn
                            possible values: any valid id of a <div>

            Optional attributes
            ===================
            tooltipElem             is the id of a <div> where the tooltip should appear. If the tooltip should be movable or no
                                    tooltip should be shown, the element can remain empty
                                    default: null
                                    possible values: any valid id of a <div> or null
            colors                  is an array of different colors. These colors are used for the filling of the nodes and the chords
                                    default: a number of colors in the attribute 'default_colorset'
                                    possible values: any array of colors
            numberOfTicks           defines how many ticks should be displayed. For example a 1 indicates that every tick should be shown, a 4 that every 4th tick is shown
                                    default: an appropriate number is calculated based on the data
                                    possible values: any integer
            numberOfTicksLabel      defines that each n th label of a tick is shown. For example a 1 indicates that every label is shown, a 4 that every 4th label is shown
                                    default: an appropriate number is calculated based on the data
                                    possible values: any integer
            segmentSize             In the default case the attribute 'segmentSize' is set to the value 'outgoing'. That means that the width of a chord on the side of a node
                                    indicates how much leaves the node from there. For example if we have a connection from A to B with the value 4, the chord has a width of 4
                                    where it is connected to node A, but a width of 0 at the other side.
                                    By setting the 'segmentSize' attribute to a different value, like 'incoming', the width of the chord on the side of a node indicates 
                                    how much comes into the node. For example if we have a connection from A to B with the value 4, the chord has a width of 4 
                                    where it is connected to node B, but a width of 0 at the other side.
                                    default: 'outgoing'
                                    possible values: ['outgoing', 'incoming']
            directed                defines if the chord diagram should be directed (true) or undirected (false)
                                    default: true
                                    possible values: [true, false]
            sorting                 defines how the nodes at the outer part of the circle should be ordered. The nodes can be ordered by alphabet, the number of incoming/ 
                                    outgoing or total connection values, by the number of links, or not sorted at all
                                    default: null
                                    possible values: ['label', 'color', 'outgoingTotal', 'incomingTotal', 'total', 'numberOfLinks']
            sortingOrder            defines if the nodes should be ordered ascending or descending
                                    default: true
                                    possible values [true, false] true means ascending, false means descending
            tooltipSetting          defines if tooltips should be shown in case of a mouseoverevent
                                    default: 'static'
                                    possible values: ['none', 'movable', 'static']
            sortingTooltip          defines by which criteria the connections in the tooltip should be sorted
                                    default: 'source'
                                    possible values: ['source', 'target', 'data']
            sortingOrderTooltip     defines if the nodes should be ordered ascending or descending
                                    default: true
                                    possible values [true, false] true means ascending, false means descending
            tooltipOrientation      defines if the text in the tooltip should be horizontal or vertical
                                    default: 'horizontal'
                                    possible values: ['horizontal', 'vertical']
            onClickNode             defines a function which should be executed on a click event on a node
                                    default: null
                                    possible values: any function
            onClickLink             defines a function which should be executed on a click event on a link
                                    default: null
                                    possible values: any function
        */
		/*
            Initializing default values
        */
        var default_colorset = [
            "#8E388E", "#7171C6", "#7D9EC0", "#388E8E", "#71C671", "#8E8E38", "#C5C1AA", "#C67171",
            "#B0171F", "#9400D3", "#0000FF", "#CAE1FF", "#36648B", "#00F5FF", "#00C78C", "#FF8247",
            "#BDFCC9", "#32CD32", "#7CFC00", "#C0FF3E", "#FFFF00", "#FFF68F", "#CDAD00", "#FFB90F",
            "#FFE7BA", "#FFC1C1"
        ];
        var default_tooltipElem = null,
            default_segmentSize = 'outgoing', //defines if the size of the chord on the side of a node represents the outgoing value or incoming value
            default_directed = true,
            default_sorting = null,
            default_sortingOrder = true,   //true means ascending, false means descending
            default_tooltipSetting = true,
            default_sortingTooltip = 'source',
            default_sortingOrderTooltip = true,         //true means ascending, false means descending
            default_tooltipOrientation = "horizontal";

        /*
            Initializing the attributes
        */
        var plotElem = _config.elem,
            tooltipElem = ((typeof _config.tooltipElem === 'undefined' || _config.tooltipElem === null) ? default_tooltipElem : _config.tooltipElem),
            plotWidth = $("#" + plotElem).width(),
            plotHeight = $("#" + plotElem).height(),
            colors = ((typeof _config.colors === 'undefined' || _config.colors === null) ? default_colorset : _config.colors.concat(default_colorset)),
            segmentSize = ((typeof _config.segmentSize === 'undefined' || _config.segmentSize === null) ? default_segmentSize : _config.segmentSize),
            directed = ((typeof _config.directed === 'undefined' || _config.directed === null) ? default_directed : _config.directed),
            sorting = ((typeof _config.sorting === 'undefined' || _config.sorting === null) ? default_sorting : _config.sorting),
            sortingOrder = ((typeof _config.sortingOrder === 'undefined' || _config.sortingOrder === null) ? default_sortingOrder : _config.sortingOrder),
            tooltipSetting = ((typeof _config.tooltipSetting === 'undefined' || _config.tooltipSetting === null) ? default_tooltipSetting : _config.tooltipSetting),
            tooltipOrientation = ((typeof _config.tooltipOrientation === 'undefined' || _config.tooltipOrientation === null) ? default_tooltipOrientation : _config.tooltipOrientation),
            sortingTooltip = ((typeof _config.sortingTooltip === 'undefined' || _config.sortingTooltip === null) ? default_sortingTooltip : _config.sortingTooltip),
            sortingOrderTooltip = ((typeof _config.sortingOrderTooltip === 'undefined' || _config.sortingOrderTooltip === null) ? default_sortingOrderTooltip : _config.sortingOrderTooltip),
            innerRadius = Math.min(plotWidth, plotHeight) * 0.4,
            outerRadius = innerRadius + (Math.max(20, innerRadius * 0.12)),
            data = prepareData(_config.data),
            nodes = data.nodes,
            chordMatrix = data.chordMatrix;

        /*
            In the next lines we calculate the number of ticks which schould be displayed. These values are used if no other values for 'numberOfTicks' and 'numberOfTicksLabel' were passed
        */
        var numberOfTicks = 0, numberOfTicksLabel = 0;


        for (var count = 0; count < chordMatrix.length; count++) {
            for (var count2 = 0; count2 < chordMatrix.length; count2++) {
                numberOfTicks = numberOfTicks + chordMatrix[count][count2];
            }
        }
        if (typeof _config.numberOfTicks === 'undefined' || _config.numberOfTicks === null || _config.numberOfTicks === "") {
            if (typeof _config.numberOfTicksLabel === 'undefined' || _config.numberOfTicksLabel === null || _config.numberOfTicksLabel === "") {
                //both are undefined
                numberOfTicks = Math.ceil(numberOfTicks / 48);
                numberOfTicksLabel = numberOfTicks * 2;
            }
            else {
                //numberOfTicks is undefined BUT numberOfTicksLabel is defined
                numberOfTicksLabel = _config.numberOfTicksLabel;
                numberOfTicks = _config.numberOfTicksLabel / 2;
            }
        }
        else {
            if (typeof _config.numberOfTicksLabel === 'undefined' || _config.numberOfTicksLabel === null || _config.numberOfTicksLabel === "") {
                //numberOfTicks is defined BUT numberOfTicksLabel is undefined
                numberOfTicks = _config.numberOfTicks;
                numberOfTicksLabel = _config.numberOfTicks * 2;
            }
            else {
                //both are defined
                numberOfTicks = _config.numberOfTicks;
                numberOfTicksLabel = _config.numberOfTicksLabel;
            }
        }

        //Define where the svg will be and how it will look like
        var svg = d3.select('#' + plotElem).append("svg")
            .attr("width", plotWidth)
            .attr("height", plotHeight)
            .append("g")
            .attr("transform", "translate(" + plotWidth / 2 + "," + plotHeight / 2 + ")");

        var chord = d3.layout.chord()
                        .matrix(chordMatrix)
                        .padding(0.05)
                        .sortSubgroups(d3.descending);

        var g = svg.selectAll("g.group")
                .data(chord.groups)
                .enter().append("svg:g")
                .attr("class", "group");

        var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

        g.append("path")    //outer circle segment
            .attr("d", arc)
            .style("fill", function (d) { return nodes[d.index].color; })
            .style("stroke", function (d) { return nodes[d.index].color; })
            .attr("id", function (d, i) { return 'group-' + plotElem + '' + d.index; });

        g.append("svg:text")    //name label of node in the outer circle segment
            .attr("dx", function (d) {
                if (d.endAngle - d.startAngle < 0.01) {
                    return 0;
                }
                return 10;
            }) //larger number puts the label farer away from the border
            .attr("dy", function (d) {
                if (d.endAngle - d.startAngle < 0.01) {
                    return 3;
                }
                return (outerRadius - innerRadius) - (outerRadius - innerRadius - 12) / 2;
            })
            .style("fill", "white")
            .style("font", "12px Arial")
            .append("svg:textPath")
            .attr("xlink:href", function (d) { return '#group-' + plotElem + '' + d.index; })
            .text(function (d) {
                var segmentlength = 2 * outerRadius * Math.PI * ((d.endAngle - d.startAngle) / 2 / Math.PI);
                if (d.endAngle - d.startAngle < 0.01 || segmentlength < nodes[d.index].label.length * 15) {
                    var countchar = (segmentlength - (segmentlength % 15)) / 15; //says how many characters can be shown theoretically (Assumption: a character needs 15px)
                    if (countchar <= 0) {
                        return null;
                    }
                    return (nodes[d.index].label.slice(0, Math.max(0, countchar - 1)) + '...');
                }
                return nodes[d.index].label;
            });

        var ticks = g.selectAll("g")
            .data(groupTicks)
            .enter().append("g")
            .attr("transform", function (d) {
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + outerRadius + ",0)";
            });

        ticks.append("line")    //small lines (scale) on the outside of the outer circle segment
            //every fifth tick is shown. If more ticks should be shown, the value of d.show can be changed in the fundtion groupTicks()
            .attr("x1", function (d) {
                return d.show ? 1 : 0;
            })
            .attr("y1", 0)
            .attr("x2", function (d) {
                return d.show ? 5 : 0;
            })
            .attr("y2", 0)
            .attr("class", "chorddiagram-ticks");

        ticks.append("text")    //small text (scale) on the outside of the outer circle segment
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("class", "chorddiagram-ticks")
            .style("font", "8px Arial")
            .attr("transform", function (d) {
                // Turn label if angle is > 180°
                return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
            })
            .style("text-anchor", function (d) {
                return d.angle > Math.PI ? "end" : null;
            })
            .text(function (d) { return d.label; });

        svg.append("g")     //chords (connections) between the circle segments
            .attr("class", "chorddiagram-chord")
            .selectAll("path")
            .data(chord.chords)
            .enter().append("path")
            .attr("d", d3.svg.chord().radius(innerRadius))
            .style("fill", chordColor)
            .attr("class", "chorddiagram-chord")
            .style("opacity", 1)
            .on("mouseover", function (d) {
                linkMouseover(d);
            })
            .on("mouseout", function (d) {
                linkMouseout(d);
            })
            .on("mousemove", function (d) {
                linkMouseover(d);
            })
            .on("click", function (d) {
                if (typeof _config.onClickLink === 'undefined' || _config.onClickLink === null) {
                    console.log("No function implemented");
                }
                else {
                    _config.onClickLink(d);
                }
            });

        g.on("mouseover", function (d) {
                nodeMouseover(d);
            })
            .on("mouseout", function (d) {
                nodeMouseout(d);
            })
            .on("mousemove", function (d) {
                nodeMouseover(d);
            })
            .on("click", function (d) {
                if (typeof _config.onClickNode === 'undefined' || _config.onClickNode === null) {
                    console.log("No function implemented");
                }
                else {
                    _config.onClickNode(nodes[d.index]);
                }
            });

        function chordColor(d) {
            return (d.source.value > d.target.value ? nodes[d.source.index].color : nodes[d.target.index].color);
        }
        function groupTicks(d) {
            var k = (d.endAngle - d.startAngle) / d.value;
            return d3.range(0, d.value, 1).map(function (v, i) {
                return {
                    angle: v * k + d.startAngle,
                    show: i % numberOfTicks !== 0 ? false : true,
                    label: i % numberOfTicksLabel !== 0 ? null : v
                };
            });
        }

        function prepareData(data) {
            /*
                Format of the passed variable:
                    'data' is an array of multiple objects. Each object represents a link between two nodes.
                    So, each object is required to have the following structure when it is passed to this function:
                    {   source:   name of the node from which the connection comes
                        target:   name of the node to which the connection goes
                        value:    strength of the link
                    }

                Task of the function:
                    The function has several tasks to do:
                    1. Identifying unique nodes
                    2. creating a matrix which stores the data which was passed as an array of objects

                Format of the return value:
                    The function returns an object with a list of the unique nodes and a matrix with the data about the links between the nodes
            */

            /*
                A list of all nodes without duplicates has to be created. The list consists of an object for each node with the attributes 'label', 'color', 'outgoingTotal',
                'incomingTotal', 'total', 'numberOfLinks'
                The nodes can remain unsorted, be sorted alphabetically, by the number of out-/in- going or total nodes, or by the number of links.
            */
            var listOfNodes = [];   //just an array with the names of the nodes
            var uniqueNodes = [];   //array of objects for each node, with the attributes: 'label', 'color', 'outgoingTotal', 'incomingTotal', 'total', 'numberOfLinks'
            data.forEach(function (d) {
                listOfNodes.push(d.source);     //reading all the node names and storing them in the array "listOfNodes"
                listOfNodes.push(d.target);     //reading all the node names and storing them in the array "listOfNodes"
            });

            listOfNodes = (listOfNodes.filter(function onlyUnique(value, index, self) { return self.indexOf(value) === index; }));  //filtering the listOfNodes, so no duplicates remain

            listOfNodes.forEach(function (node) {
                /*
                    This loop creates some statistics for the nodes. The loop sums up the values of links coming into and going out of the node, and both together.
                    It also counts the links to and from the node.
                */
                var outgoingTotal = 0,
                    incomingTotal = 0,
                    total = 0,
                    numberOfLinks = 0;
                data.forEach(function (d) {
                    if (d.source === node) {
                        outgoingTotal = outgoingTotal + d.value;    //summing up links going out of the node
                    }
                    if (d.target === node) {
                        incomingTotal = incomingTotal + d.value;    //summing up links going into the node
                    }
                    if (d.source === node || d.target === node) {
                        total = total + d.value;                    //summing up incoming and outgoing nodes from the node
                        numberOfLinks++;                            //Counting the number of links to and from the node
                    }
                });
                var object = {                                  //creating an object for the node with the attributes 'label' and 'color' and its statistics
                    'label': node,
                    'color': 'black',
                    'outgoingTotal': outgoingTotal,
                    'incomingTotal': incomingTotal,
                    'total': total,
                    'numberOfLinks': numberOfLinks
                };
                uniqueNodes.push(object);
            });
            if (sorting !== null) {
                uniqueNodes.sort(dynamicSort(sorting, !sortingOrder));      //The list of nodes is sorted by some criteria. This criteria can be the label, or one of the statistic (outgoingTotal, incomingTotal, total ...)
            }

            /*
                From the data a matrix should be created which stores the values of the connections in a matrix form
            */
            var chordMatrix = [];

            //fill Matrix with '0's
            for (var count = 0; count < uniqueNodes.length; count++) {
                var row = [];
                for (var count2 = 0; count2 < uniqueNodes.length; count2++) {
                    row[count2] = 0;
                }
                chordMatrix[count] = row;
            }
            data.forEach(function (d) {
                //fill the 'chordMatrix' with the values from the JSON. If there are no values. The value will remain 0.
                var rowNumber = $.map(uniqueNodes, function (obj, index) { if (obj.label === d.source) { return index; } })[0];
                var columnNumber = $.map(uniqueNodes, function (obj, index) { if (obj.label === d.target) { return index; } })[0];

                chordMatrix[rowNumber][columnNumber] = chordMatrix[rowNumber][columnNumber] + d.value;
            });

            if (segmentSize !== 'outgoing') {
                /*
                    In the default case the attribute 'segmentSize' is set to the value 'outgoing'. That means that the width of a chord on the side of a node
                    indicates how much leaves the node from there. For example if we have a connection from A to B with the value 4, the chord has a width of 4
                    where it is connected to node A, but a width of 0 at the other side.
                    By setting the 'segmentSize' attribute to a different value, like 'incoming', the width of the chord on the side of a node indicates how much comes into
                    the node. For example if we have a connection from A to B with the value 4, the chord has a width of 4 where it is connected to node B, 
                    but a width of 0 at the other side.

                    To achieve this new representation, we invert the matrix with the values by calling the function 'invertQuadraticMatrix()'.
                */
                chordMatrix = invertQuadraticMatrix(chordMatrix);
            }

            /*
                Each node gets a unique color now
            */
            if (colors.length < uniqueNodes.length) {
                /*
                    A number of colorcodes are given at the beginning. If more colors are needed, this loop creates additional ones.
                */
                for (var count = 0; count < uniqueNodes.length; count++) {
                    colors.push(randomColor());
                }
            }
            var count = 0;
            uniqueNodes.forEach(function (node) {
                node.color = colors[count++];
            });

            if (directed) {
                return { nodes: uniqueNodes, chordMatrix: chordMatrix };
            }
            else {
                //if the graph should be undirected, the vallues are aggregated
                var _chordMatrix = [];


                for (var count = 0; count < uniqueNodes.length; count++) {
                    var row = [];

                    for (var count2 = 0; count2 < uniqueNodes.length; count2++) {
                        if (count !== count2) {
                            row[count2] = chordMatrix[count][count2] + chordMatrix[count2][count];
                        }
                        else {
                            row[count2] = chordMatrix[count][count2];
                        }
                    }
                    _chordMatrix[count] = row;
                }
                return { nodes: uniqueNodes, chordMatrix: _chordMatrix };
            }
        }

        /*
            Functions for interacting with nodes
        */
        function nodeMouseover(d) {
            /*
                Format of the passed variable:
                    'd' is the information about a node

                Task of the function:
                    This function creates a tooltip if the mouse hovers over a node. The tooltip includes the Name of the node and the information about the links (connections).
                    The tooltip says the source node, the target node and the value of each connection.
                    All chords which are not connected with the node are hidden.

                Format of the return value:
                    The function doesn't return a value but it displays a tooltip and highlights links connected to the node.
            */

            var nodeID = d.index;
            if (tooltipSetting !== 'none') {
                var details = getDetailsOnNode(nodeID),     //'details' contains a list of objects. Each object is a connection between two nodes. Each object contains the attributes 'sourceColor', 'source', 'targetColor', 'target' and 'data'. The number of objects in the array is not limited.
                    detailstext = '<h4 class=chorddiagram-h4>' + nodes[nodeID].label + '</h4>'; 
                details.forEach(function (d) {
                    /*
                        In this loop the information which are passed in the array 'details' is joined to a readable html text. 
                        This text (variable 'detailstext') will be used to generate a tooltip.
                    */
                    detailstext = detailstext + (queryColorDot(d.sourceColor, 15) + ' ' + queryColorDot(d.targetColor, 15) + ' ' + d.source + '-' + d.target + ' (' + d.data + ')' + (tooltipOrientation === "horizontal" ? ', ' : '<br/>'));
                });
                try {
                    //before displaying the tooltip, potentially still existing tooltips are removed
                    document.getElementById("tooltip").remove();
                } catch (error) { }
                showTooltip(100, 0.9, detailstext, d3.event.pageX + 15, d3.event.pageY);
            }

            /*
                In the following all chords which are not connected to the selected node are hidden.
            */
            svg.selectAll(".chorddiagram-chord path")
                .filter(function (d) {
                    return d.source.index !== nodeID && d.target.index !== nodeID;      //looks which chords are connected to the node the mouse is on
                })
                .transition()
                .style("opacity", 0);       //chords which are not connected to the node the mouse is on are hidden
        }
        function nodeMouseout(node) {
            /*
                Format of the passed variable:
                    'node' is the information about a node

                Task of the function:
                    When the mouse leaves the node, the tooltip is removed and all hidden chords are shown again.

                Format of the return value:
                    The function doesn't return a value but removes the tooltip and shows chords again.
            */

            var nodeID = node.index;
            try {
                document.getElementById("tooltip").remove();    //removing the tooltip
            } catch (error) { }

            svg.selectAll(".chorddiagram-chord path")
                .filter(function (d) {
                    return d.source.index !== nodeID && d.target.index !== nodeID;      //looks which chords are connected to the node the mouse is on
                })
                .transition()
                .style("opacity", 1);       //chords which are not connected to the node the mouse is on are shown again
        }
        function getDetailsOnNode(nodeID) {
            /*
                Format of the passed variable:
                    'nodeID' is the ID of a node for which information have to be passed.

                Task of the function:
                    This function returns an array with objects. Each object represents a connection to or from the selected node ('nodeID').
                    Each object has the following attributes: 'sourceColor', 'source' (name of the source node), 'targetColor', 'target' (name of the target node),
                    'data' (value of the connection).
                    At the end of the function the list of connections is ordered.
                    Required data are the '_config.data' (which is the data how it was passed to the library), 'nodes' (which is an array of objects, with each object
                    representing one node with the name and the color)
                    
                Format of the return value:
                    The function returns a list of objects. Each object represents a link as describe above.
            */

            var nodeName = nodes[nodeID].label,
                links = [];

            _config.data.forEach(function (link) {
                if (link.source === nodeName || link.target === nodeName) {
                    var object = {
                        "sourceColor": nodes.filter(function (node) { return node.label === link.source; })[0].color,
                        "source": link.source,
                        "targetColor": nodes.filter(function (node) { return node.label === link.target; })[0].color,
                        "target": link.target,
                        "data": link.value
                    };
                    links.push(object);
                }
            });

            links.sort(dynamicSort(sortingTooltip, !sortingOrderTooltip));      //Here the links are sorted. The links can be sorted by any attribute of the object. It can also be reversed.
            return links;
        }

        /*
            Functions for interacting with chords
        */
        function linkMouseover(chord) {
            /*
                Format of the passed variable:
                    'chord' is the information about a link

                Task of the function:
                    This function creates a tooltip if the mouse hovers over a chord. The tooltip includes the information about the links (connections).
                    The tooltip says the source node, the target node and the value of the connection. If the chord is 'undirected' the tooltip also 
                    aggregates the values to a total 'sum'.
                    Moreover, all other chords are hidden. The chords are hidden, so the user can concentrate on the chord where the mouse is.

                Format of the return value:
                    The function doesn't return a value but it displays a tooltip and highlights the link.
            */

            var sourceID = chord.source.index,
                targetID = chord.target.index;

            if (tooltipSetting !== 'none') {
                var details = getDetailsOnChord(sourceID, targetID),   //'details' contains a list of objects. Each object is a connection between two nodes. Each object contains the attributes 'sourceColor', 'source', 'targetColor', 'target' and 'data'. The length of the array is maximum 2, because a connection between two nodes can just go from A to B or B two A.
                    detailstext = "",
                    sum = 0;

                details.forEach(function (link) {
                    /*
                        In this loop the information which are passed in the array 'details' is joined to a readable html text. 
                        This text (variable 'detailstext') will be used to generate a tooltip.
                    */
                    sum = sum + link.data;  //'sum' is the aggregation of all data (determines the value of a connection)
                    detailstext = detailstext + (queryColorDot(link.sourceColor, 15) + ' ' + queryColorDot(link.targetColor, 15) + ' ' + link.source + '-' + link.target + ' (' + link.data + ')<br/>');
                });

                if (!directed) {
                    // the 'sum' is just shown if the chord diagram is undirected
                    detailstext = detailstext + 'Sum: ' + sum;
                }

                try {
                    //before displaying the tooltip, potentially still existing tooltips are removed
                    document.getElementById("tooltip").remove();
                } catch (error) { }
                showTooltip(100, 0.9, detailstext, d3.event.pageX + 15, d3.event.pageY);
            }

            /*
                In the following all other chords are hidden.
            */
            svg.selectAll(".chorddiagram-chord path")
                .filter(function (d) {
                    return !(d.source.index === sourceID && d.target.index === targetID);       //looks up and filters all chords the mouse is not on
                })
                .transition()
                .style("opacity", 0);       //hides the chords the mouse is not on

        }
        function linkMouseout(chord) {
            /*
                Format of the passed variable:
                    'chord' is the information about a link

                Task of the function:
                    When the mouse leaves the chord, the tooltip is removed and all hidden chords are shown again.

                Format of the return value:
                    The function doesn't return a value but removes the tooltip and shows chords again.
            */

            try {
                document.getElementById("tooltip").remove();    //removing the tooltip
            } catch (error) { }
            svg.selectAll(".chorddiagram-chord path")
                .filter(function (d) {
                    return !(d.source.index === chord.source.index && d.target.index === chord.target.index);   //looks up and filters all chords the mouse is not on
                })
                .transition()
                .style("opacity", 1);   //shows all chords again which were hidden before
        }
        function getDetailsOnChord(sourceID, targetID) {
            /*
                Format of the passed variable:
                    'sourceID' is the ID of a node where a link starts and 'targetID' is the ID of a node where a link ends

                Task of the function:
                    This function returns an array with objects. Each object represents a connection of this chord. As the chord is between exactly two nodes, there
                    can be a maximum of two connections (A to B, or B to A)
                    Each object has the following attributes: 'sourceColor', 'source' (name of the source node), 'targetColor', 'target' (name of the target node),
                    'data' (value of the connection).
                    At the end of the function the list of connections is ordered.
                    Required data are the '_config.data' (which is the data how it was passed to the library), 'nodes' (which is an array of objects, with each object
                    representing one node with the name and the color)
                    
                Format of the return value:
                    The function returns a list of objects. Each object represents a link as describe above.
            */

            var sourceName = nodes[sourceID].label,
                targetName = nodes[targetID].label,
                links = [];

            _config.data.forEach(function (link) {
                if ((link.source === sourceName && link.target === targetName) || (link.source === targetName && link.target === sourceName)) {
                    var object = {
                        "sourceColor": nodes.filter(function (node) { return node.label === link.source; })[0].color,
                        "source": link.source,
                        "targetColor": nodes.filter(function (node) { return node.label === link.target; })[0].color,
                        "target": link.target,
                        "data": link.value
                    };
                    links.push(object);
                }
            });

            links.sort(dynamicSort(sortingTooltip, !sortingOrderTooltip));      //Here the links are sorted. The links can be sorted by any attribute of the object. It can also be reversed.
            return links;
        }


        function queryColorDot(color, diameter) {
            /*
                Format of the passed variable:
                    color: the color of the dot
                    diameter: the size of the dot

                Task of the function:
                    This function creates a colored dot in html with a specific color and diameter

                Format of the return value:
                    The function returns html code for a colored dot
            */

            return '<div style="' + [
                'display:inline-block',
                'color:' + color,
                'font-size:' + diameter + 'px',
                'border-radius: 50%',
                'width:' + diameter + 'px',
                'height:' + diameter + 'px',
                'background:' + color
            ].join(';') + '"></div>';
        }
        function invertQuadraticMatrix(matrix) {
            /*
                Format of the passed variable:
                    'matrix' is a quadratic matrix

                Task of the function:
                    This function inverst a matrix and passes the inverted matrix back

                Format of the return value:
                    The function returns an inverted matrix of the passed matrix
            */
            var newMatrix = [];
            //fill Matrix with '0's
            for (var count = 0; count < matrix.length; count++) {
                var row = [];

                for (var count2 = 0; count2 < matrix.length; count2++) {
                    row[count2] = 0;
                }
                newMatrix[count] = row;
            }

            for (var count = 0; count < matrix.length; count++) {
                for (var count2 = 0; count2 < matrix.length; count2++) {
                    newMatrix[count][count2] = matrix[count2][count];
                }
            }
            return newMatrix;
        }
        function dynamicSort(property, reverse) {
            /*
                This function can sort an array with objects by one of its properties. It can also reverse the sorting
            */
            var sortOrder = 1;
            if (property[0] === '-') {
                sortOrder = -1;
                property = property.substr(1);
            }
            if (!reverse) {
                return function (a, b) {
                    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                    return result * sortOrder;
                };
            }
            else {
                return function (a, b) {
                    var result = (a[property] > b[property]) ? -1 : (a[property] < b[property]) ? 1 : 0;
                    return result * sortOrder;
                };
            }
        }
        function showTooltip(duration, opacity, text, posLeft, posTop) {
            /*
                Format of the passed variable:
                    The variables give some information about the style and content of the tooltip
                    duration: says how long it takes until the tooltip appears
                    opacity: defines the opacity of the background of the tooltip
                    text: is the text shown in the tooltip
                    posLeft, posTop: indicates where the tooltip in relation to the mouse should be shown

                Task of the function:
                    This function makes the tooltip visible. The tooltip either appears as a movable box next to the mouse or fixed to a specific position.

                Format of the return value:
                    The function doesn't return a value but it displays a tooltip
            */
            var tooltip;
            if (tooltipSetting === 'movable') {
                //if the tooltip should be movable the <div> for the tooltip is created dynamically
                tooltip = d3.select("body").append("div")
                    .attr("id", "tooltip")
                    .attr("class", "chorddiagram-tooltip");
                tooltip.transition()
                    .duration(duration)
                    .style("opacity", opacity);
                tooltip.html(text)
                    .style("left", posLeft + "px")
                    .style("top", posTop + "px");
            }
            else {
                //if the tooltip should appear at a fixed position the div is created in a specific position which is defined in 'tooltipElem'
                tooltip = d3.select("#" + tooltipElem).append("div")
                    .attr("id", "tooltip")
                    .attr("class", "chorddiagram-tooltip-fix");
                tooltip.transition()
                    .duration(duration)
                    .style("opacity", opacity);
                tooltip.html(text);
            }
        }
    }
}).call(this)