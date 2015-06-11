function Matrix(id, matrix, nodeOrder, svg) {

    var LABEL_DIST = 5;
    var DIAGONAL_VALUE = 0;

    this.matrix = matrix;
    this.pile;

    // states
    this.cellWidth = 1;
    this.barchartIndex = 0;
    this.barChart = false;

    this.x = 0;
    this.y = 0;

    this.opacityFactor = 1;

    this.IS_HIDDEN = false;

    this.svg = svg;
    this.id = id;
    // GLOBAL VARS
    this.width = nodeOrder.length * CELL_SIZE;
    this.links = [];
    this.columnTotals = new Array(matrix.length);
    var i = 0;

    this.matricesInPile = 1;
    this.currentNodeOrder = nodeOrder;
    // main 

    this.color = "#aaa" // annotation color of matrix

    var l = 0, n = nodeOrder.length;
    this.maxColumnTotal = 0;
    for (var i = 0; i < n; i++) {
    	var colTot = 0;
    	matrix[i][i] = DIAGONAL_VALUE;
        for (var j = 0; j < n; j++) {
        	var oi = this.currentNodeOrder[i],
        		oj = this.currentNodeOrder[j],
            	v = matrix[oi][oj];
                if(!SHOW_ANTICORRELATION)
                    v = v>0?v:0;
            this.links[l++] = {
	            row: i,
	            col: j,
	            source: oi,
	            target: oj,
	            val: v
	        };
	        colTot += v;
        }
        this.columnTotals[i] = colTot;
        // this.maxColumnTotal = Math.max(this.maxColumnTotal, colTot);
        this.maxColumnTotal = n;
    }

    var strId = "matrix_" + id;
    this.g = svg
        // .selectAll('#'+strId).data(this).enter()
        .append("g")
        .attr("id", strId)
        .attr("class", "matrix")
        .style("opacity", 1)
        // .data(this)

    this.gPlot = this.g.append("g");

    this.visible = true;

    // Matrix background rectangle
    this.frame = this.gPlot.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "matrixbackground")
        .attr("width", this.width)
        .attr("height", this.width);


    var gridlines = this.gPlot.selectAll('.gridLine')
    	.data(d3.range(n+1))
    	.enter();

    var appendGridLines = function (h,v) {
    	gridlines
    		.append('line')
    		.attr('class', 'gridLine '+h)
    		.attr(h+1,function(d) { return d * CELL_SIZE})
    		.attr(h+2,function(d) { return d * CELL_SIZE})
    		.attr(v+1,function(d) { return 0 })
    		.attr(v+2,function(d) { return matrixWidth });
    	}
    appendGridLines('x','y');
    appendGridLines('y','x');


    this.cells = this.gPlot.selectAll(".cell")
        .data(this.links.filter(function (d, i) {
            return d.val >= CELL_THRESHOLD;
            // return true;
        }))
        .enter()
         .append("rect")
         .attr("class", "cell mat_" + id)
         .attr("x", function (d) { 
            return d.col * CELL_SIZE; })
         .attr("y", function (d) { return d.row * CELL_SIZE; })
         .style("opacity", function (d, i) { 
            return cellValue(d.val) })
         .style("fill", function(d,i) {
            return "#000"
         })
        .attr("width", CELL_SIZE)
        .attr("height", CELL_SIZE)
        .on("mouseover", mouseOverCell)
        .on("mouseout", mouseOutCell)


   

    // DRAW MATRIX LABEL
    this.label = this.g.append("text")
        .attr("x", 0)
        .attr("y", this.width + 15)
        .text(id)
        .attr("class", "matrixLabel")
        .attr("id", "matrixLabel_" + id);


    // Clusters only intra-cluster cells  
    Matrix.prototype.colorClusters = function (clusterNodes, color) {
        this.g.selectAll(".cell")
           .filter(function (d, i) {
               return clusterNodes.index(nodes[d.row]) > -1 && clusterNodes.index(nodes[d.col]) > -1;
           })
           .style("fill", color)
        // .style("stroke-width", 2)

    }

    // Clusters all cells of a node according to its cluster
    Matrix.prototype.colorNodes = function (clusterNodes, color) {
        this.g.selectAll(".cell")
          .filter(function (d, i) {
              return clusterNodes.index(nodes[d.row]) > -1 || clusterNodes.index(nodes[d.col]) > -1;
          })
          .style("fill", color)

    }

    Matrix.prototype.setVisibility = function (visibility) {
        if(this.IS_HIDDEN && visibility) return; 
        if (visibility) {
            this.label.attr("class", "matrixLabel highlight");
            if (!this.visible) {
                var _this = this;
                this.g.append(function () { return _this.gPlot[0][0] });
            }
            this.label.style("opacity", 1);
        } else {
            this.label.attr("class", "matrixLabel");
            if (this.visible) {
                this.gPlot.remove();
            }
            this.label.style("opacity", 0);
        }
        this.visible = visibility;
    }

    Matrix.prototype.highlightRow = function (node) {
        this.currentNodeOrder = this.currentNodeOrder;
        this.g.append("line")
          .attr("x1", 0)
          .attr("y1", (this.currentNodeOrder.index(parseInt(node)) + 1) * CELL_SIZE)
          .attr("x2", this.width)
          .attr("y2", (this.currentNodeOrder.index(parseInt(node)) + 1) * CELL_SIZE)
          .attr("class", "rowhighlightline")
    }

    Matrix.prototype.dehighlightRows = function () {
        this.g.selectAll(".rowhighlightline").remove();
    }

    Matrix.prototype.highlightCell = function (source, target) {
        this.g.selectAll(".cell")
          .filter(function (d, i) {
              return d.source == source && d.target == target;
          })
          .attr("class", "cell-highlight");
    }
    Matrix.prototype.dehighlightCell = function (source, target) {
        this.g.selectAll(".cell-highlight")
          .filter(function (d, i) {
              return d.source == source && d.target == target;
          })
          .attr("class", "cell mat_" + this.id);
    }

    // Matrix.prototype.setCellHoverCallback = function (callback) {
    //       .on("mouseover", callback);
    // }
    // Matrix.prototype.setCellClickCallback = function (callback) {
    //     this.g.selectAll(".cell")
    //       .on("click", callback);
    // }
    // Matrix.prototype.setCellOutCallback = function (callback) {
    //     this.g.selectAll(".cell")
    //       .on("mouseout", callback);
    // }

    Matrix.prototype.getConnectionValue = function (source, target) {
        var value = this.matrix[this.currentNodeOrder.index(source)][this.currentNodeOrder.index(target)];
        return value;
    }

    Matrix.prototype.setDrag = function (drag) {
        this.g.call(drag);
    }

    Matrix.prototype.moveTo = function (x, y, animate) {
        var g = animate ? this.g.transition() : this.g;
        g.attr("transform", function (d, i) {
            return "translate(" + x + "," + y + ")";
        });
        this.x = x;
        this.y = y;
        // console.log("Move matrix ", x, y);
    }

     Matrix.prototype.move = function (dx, dy) {
        var g = this.g;
        var x_new = this.x + d3.event.dx;
        var y_new = this.y + d3.event.dy;
        g.attr("transform", function (d, i) {
            return "translate(" + x_new + "," + y_new + ")";
        });
        this.x = x_new;
        this.y = y_new;
    }

    Matrix.prototype.getLabelPosition = function () {
        return this.width + 15;
    }

    Matrix.prototype.getG = function () {
        return this.g;
    }

    Matrix.prototype.showUpperTriangle = function (b) {
        console.log("showUpperTriangle");
        this.gPlot.selectAll(".cell")
          .filter(function (d, i) { return d.row < d.col })
          .style("opacity", function (d, i) {
              if (b) return d.val
              return 0;
          });
        this.frame.style("fill", "none"); 
    }

    Matrix.prototype.showLowerTriangle = function (b) {
        console.log("showLowerTriangle ", b);
        this.gPlot.selectAll(".cell")
          .filter(function (d, i) { return d.row > d.col })
          .style("opacity", function (d, i) {
              if (b) return d.val
              return 0;
          });
        this.frame.style("fill", "none"); 
    }

    Matrix.prototype.setColor = function(color){
        this.color = color;
        this.frame.style("stroke", color);
        this.frame.style("stroke-width", 3); 
    }

    Matrix.prototype.resetColor = function(){
        this.color = "#aaa";
        this.frame.style("stroke", this.color);
        this.frame.style("stroke-width", "1"); 
    }

    Matrix.prototype.focus = function()
    {
        this.gPlot.selectAll(".cell").remove();
        this.updateCells();
    }

    Matrix.prototype.showBarChart = function(index, matricesInPile)
    {
        // this.CELL_SIZE = this.width / (this.endRow - this.startRow+1);
        // this.cellWidth = this.CELL_SIZE / matricesInPile;
        this.barchartIndex = index;
        this.barChart = true;
        this.matricesInPile = matricesInPile;
        this.setGridVisibilty(false);
        // if (index === 0) 
        //     this.pile.makeOnlyTopMatrixFilled();
        this.frame.style("fill", "none");
        this.label.style("opacity", "0");
        this.updateCells();
    }

    Matrix.prototype.unshowBarChart = function()
    {
        // this.cellWidth = this.CELL_SIZE;
        // this.barchartIndex = 0;
        // this.barChart = false;
        this.matricesInPile = 1;
        this.setGridVisibilty(true);
        this.frame.style("fill", "#fff");
        this.label.style("opacity", "1");

        this.updateCells();  
    }

    var getX = function (d) { 
        // return (d-START_COL) * CELL_SIZE;
        return d * CELL_SIZE;
    };
 
    Matrix.prototype.updateCells = function()
    {
        var _this = this
        var nodeCount = 0;
        this.gPlot.selectAll(".cell").remove();
        this.cells = this.gPlot.selectAll(".cell")
            .data(this.links.filter(function (d, i) {
                return d.val > CELL_THRESHOLD 
                        && focusNodes.indexOf(d.source) > -1
                        && focusNodes.indexOf(d.target) > -1
            }))
            .enter()
            .append("rect").attr("class", "cell")
            .attr("class", "cell mat_" + id)
            .style("color", "#000")
            .attr("x", function (d,i) {
                if (focusNodes.length < nodes.length) 
                    return (focusNodes.indexOf(d.source)) * CELL_SIZE;
        		else
                    return _this.currentNodeOrder.indexOf(d.source)* CELL_SIZE;
                // return (d.col-START_COL) * CELL_SIZE;
        	})
            .attr("y", function (d,i) { 
                if (focusNodes.length < nodes.length) 
                    return (focusNodes.indexOf(d.target)) * CELL_SIZE;
                else
                    return _this.currentNodeOrder.indexOf(d.target)* CELL_SIZE;
            })
            .style("opacity", function (d, i) { 
                return cellValue(d.val);})
            .attr("width", CELL_SIZE)
            .attr("height", CELL_SIZE)
            .on("mouseover", mouseOverCell)
            .on("mouseout", mouseOutCell)


        var _this = this;
        var scaleGridLines = function (h,v) {
            _this.g.selectAll('.gridLine.'+h)
                .attr(h+1,getX)
                .attr(h+2,getX)
                .attr(v+1,function(d) { return 0 })
                .attr(v+2,function(d) { return matrixWidth})
                .style('opacity', function(d) {
                    return focusNodes.indexOf(d.source) > -1 
                        && focusNodes.indexOf(d.target) > -1 ? 1 : 0;
                })
            }
        scaleGridLines('x','y');
        scaleGridLines('y','x');
    }




    Matrix.prototype.setNodeOrder = function(newOrder){
        if(isSameOrdering(this.currentNodeOrder, newOrder))
            return;

        this.currentNodeOrder = newOrder;
        this.updateLinks();
        this.updateCells();
    }

    Matrix.prototype.updateLinks = function(){
        var l = 0;
        this.links = [];
        var n = this.currentNodeOrder.length;
        for (var i = 0; i < n; i++) {
            var colTot = 0;
            for (var j = 0; j < n; j++) {
                var oi = this.currentNodeOrder[i],
                    oj = this.currentNodeOrder[j],
                    v = this.matrix[oi][oj];
                    v>0?v:0;
                    }
                this.links[l++] = {
                    row: i,
                    col: j,
                    source: oi,
                    target: oj,
                    val: v
                };
                colTot += v;
            }
            this.columnTotals[i] = colTot;
            this.maxColumnTotal = n;
        }
    }

    Matrix.prototype.setOpacityFactor = function(opacityFactor){
        this.opacityFactor = opacityFactor;
        this.gPlot.style("opacity", this.gPlot.style("opacity") * opacityFactor);
    }

    Matrix.prototype.setGridVisibilty = function(b){
        if(b)
            d3.selectAll('.gridLine')
                .style("opacity", 1)
        else
            d3.selectAll('.gridLine')
                .style("opacity", 0)

    }


    Matrix.prototype.showBackground = function(b){
        if(b)
            this.frame.style("opacity", 1);
        else
            this.frame.style("opacity", 0);
    }
    Matrix.prototype.showFrame = function(b){
        if(b)
            this.frame.attr("class", "matrixbackground-highlighted");
        else
            this.frame.attr("class", "matrixbackground");
    }


    Matrix.prototype.setHide = function(b){
        if(this.IS_HIDDEN == b) 
            return;

        this.IS_HIDDEN = b;
        this.setVisibility(!b);
    }
}

    

