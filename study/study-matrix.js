function Matrix(id, matrix, nodeOrder, svg) {

    this.matrix = matrix;
    this.labelText = id

    this.x = 0;
    this.y = 0;

    this.svg = svg;
    this.id = id;

    this.state = -1;

    this.links = [];
    this.columnTotals = new Array(matrix.length);

    this.color = "#aaa" // annotation color of matrix

    var strId = "matrix_" + id;
    this.g = svg
        .append("g")
        .attr("id", strId)
        .attr("class", "matrix")
        .style("opacity", 1)

    this.gPlot = this.g.append("g");

    this.visible = true;

    // Matrix background rectangle
    this.frame = this.gPlot.append("rect")
        .attr("x", 0)   
        .attr("y", 0)
        .attr("class", "matrixbackground")
        .attr("width", MATRIX_WIDTH)
        .attr("height", MATRIX_WIDTH);


    // var gridlines = this.gPlot.selectAll('.gridLine')
    // 	.data(d3.range(nodes.length+1))
    // 	.enter();

    // var appendGridLines = function (h,v) {
    // 	gridlines
    // 		.append('line')
    // 		.attr('class', 'gridLine '+h)
    // 		.attr(h+1,function(d) { return d * CELL_SIZE})
    // 		.attr(h+2,function(d) { return d * CELL_SIZE})
    // 		.attr(v+1,function(d) { return 0 })
    // 		.attr(v+2,function(d) { return MATRIX_WIDTH});
    // 	}
    // appendGridLines('x','y');
    // appendGridLines('y','x');

    var l = 0, n = nodeOrder.length;
    this.maxColumnTotal = 0;
    for (var i = 0; i < n; i++) {
        var colTot = 0;  
        for (var j = 0; j < n; j++) {
            var v = matrix[i][j];
                v = v>0?v:0;
            this.links[l++] = {
                row: i,
                col: j,
                val: v
            };
            colTot += v;
        }
        this.columnTotals[i] = colTot;
        this.maxColumnTotal = n;
 
    }

    this.cells = this.gPlot.selectAll(".cell")
        .data(this.links.filter(function(d,i){return d.val >= CELL_THRESHOLD}))
        .enter()
         .append("rect")
         .attr("class", "cell mat_" + id)
         .attr("x", function (d) { 
            return d.col * CELL_SIZE; })
         .attr("y", function (d) { 
            return d.row * CELL_SIZE; })
         .style("opacity", function (d, i) { 
            return d.val })
         .style("fill", function(d,i) {
            return "#000"
         })
        .attr("width", CELL_SIZE)
        .attr("height", CELL_SIZE)


    // DRAW MATRIX LABEL
    this.label = this.g.append("text")
        .attr("x", 0)
        .attr("y", MATRIX_WIDTH + 15)
        .text(id)
        .attr("class", "matrixLabel")
        .attr("id", "matrixLabel_" + id);



    Matrix.prototype.setVisibility = function (visibility) {
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


    Matrix.prototype.moveTo = function (x, y, animate) {
        var g = animate ? this.g.transition() : this.g;
        g.attr("transform", function (d, i) {
            return "translate(" + x + "," + y + ")";
        });
        this.x = x;
        this.y = y;
    }


    Matrix.prototype.move = function (dx, dy) {
        var g = this.g;
        var x_new = this.x + dx;
        var y_new = this.y + dy;
        g.attr("transform", function (d, i) {
            return "translate(" + x_new + "," + y_new + ")";
        });
        this.x = x_new;
        this.y = y_new;
    }

    Matrix.prototype.setState = function(state){
        this.state = state;
    }
        

    Matrix.prototype.setColor = function(color){
        this.color = color;
        this.frame.style("stroke", color);
        this.frame.style("stroke-width", 4); 
    }


    // Matrix.prototype.resetColor = function(){
    //     this.color = "#aaa";
    //     this.frame.style("stroke", this.color);
    //     this.frame.style("stroke-width", 1); 
    // }

    var getX = function (d) { 
        return d * CELL_SIZE;
    };




    // Matrix.prototype.showBackground = function(b){
    //     if(b)
    //         this.frame.style("opacity", 1);
    //     else
    //         this.frame.style("opacity", 0);
    // }
    // Matrix.prototype.showFrame = function(b){
        // if(b)
        //     this.frame.attr("class", "matrixbackground-highlighted");
            
        // else
        //     this.frame.attr("class", "matrixbackground");
    // }
}

    

