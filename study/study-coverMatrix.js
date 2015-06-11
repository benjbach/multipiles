// Matrix class
// benjamin
// nodes - list of indices for the matrix. Order doesn't matter
function CoverMatrix(id, pile, svg) {

    this.pile = pile;

    this.id = id;
    this.svg = svg;

    var strId = "matrix_" + id;
    this.g = svg.selectAll('#'+strId).data([this]).enter().append("g")
        .attr("id", strId)
        .attr("class", "matrix")
        .style("opacity", 1)
        .style("stroke", "#000")
        .attr("width", this.width)
        .attr("height", this.width)
        .on("mouseover", function(){ showTools(pile)})
        .on("mouseout", function(){ hideTools(svg)})

    this.summaryPlot = this.g.append("g");
    
    this.visible = true;

    var getX = function (d) { 
        return d * CELL_SIZE
    };

    this.label = this.g.append("text")
        .attr("x", 0)
        .attr("y", MATRIX_WIDTH + 15)
        .text("")
        .attr("class", "matrixLabel")


    // CoverMatrix.prototype.appendGridLines = function(h,v,n) {
    //     this.gridlines
    //         .append('line')
    //         .attr('class', 'gridLine '+h)
    //         .attr(h+1,function(d) { return d * CELL_SIZE})
    //         .attr(h+2,function(d) { return d * CELL_SIZE})
    //         .attr(v+1,function(d) { return 0 })
    //         .attr(v+2,function(d) { return MATRIX_WIDTH});
    // }

    CoverMatrix.prototype.updateCells = function(){

        var newLabel = matrices.indexOf(this.pile.pileMatrices[0]) + "-" + matrices.indexOf(this.pile.pileMatrices[this.pile.pileMatrices.length-1]);
        this.label.text(newLabel)
    
        this.summaryPlot.selectAll(".cell").remove();
        
        // SUMMARY MATRIX
        var m = this.pile.pileMatrices[0];
        var l = this.pile.pileMatrices.length;
        var n = nodes.length;
    
        var x,y;
        var s, v, t, b
        var sValue, vValue, tValue;
        var a,b;
        for(var i=0 ; i<_fileNodeOrder.length ; i++){
            for(var j=0 ; j<_fileNodeOrder.length ; j++){
        
                sValue = 0;
              
                x = i * CELL_SIZE;  
                y = j * CELL_SIZE;  

                for(var k=0 ; k<l ; k++){
              
                    if(this.pile.pileMatrices[k].matrix[i][j] == 0)
                        continue;

                    if(this.pile.pileMatrices[k].matrix[i][j] >= CELL_THRESHOLD){
                        sValue += this.pile.pileMatrices[k].matrix[i][j];
                    }
                }
              
                if(sValue > 0){
                    s = this.summaryPlot.append("rect")
                        .attr("x", x)
                        .attr("y", y)                                                        
                        .attr("class", "cell")
                        .attr("width", CELL_SIZE)
                        .attr("height", CELL_SIZE)
                        .style("opacity", sValue / l)
                        .style("fill", "#00a")
                }
            }
        }
        // var _this = this;
        // var scaleGridLines = function (h,v) {
        //     _this.g.selectAll('.gridLine.'+h)
        //         .attr(h+1,getX)
        //         .attr(h+2,getX)
        //         .attr(v+1,function(d) { return 0 })
        //         .attr(v+2,function(d) { return MATRIX_WIDTH})
        //         .style('opacity', 1)
        //     }
        // scaleGridLines('x','y');
        // scaleGridLines('y','x');
    }

    CoverMatrix.prototype.setVisibility = function (visibility) {
        if (visibility) {
            if (!this.visible) {
                var _this = this;
                this.svg.append(function () { return _this.g[0][0] });
            }
        } else {
            if (this.visible) {
                this.g.remove();
            }
        }
        this.visible = visibility;
    }

    CoverMatrix.prototype.setDrag = function (drag) {
        this.g.call(drag);
    }

    CoverMatrix.prototype.getG = function () {
        return this.g;
    }

    CoverMatrix.prototype.setColor = function(color){
        this.color = color;
        this.frame.style("stroke", color);
        this.frame.style("stroke-width", 1); 
        this.pile.setColor(color)
    }

    CoverMatrix.prototype.resetColor = function(){
        this.color = "#aaa";
        this.frame.style("stroke", this.color);
        this.frame.style("stroke-width", "1"); 
        this.pile.resetColor()
    }

    CoverMatrix.prototype.showMode = function(){
       
        if(this.pile.UPDATE_AGGREGATION_MATRIX)
            this.updateCells();
        
        // Put on top
        var _this = this;
        this.summaryPlot.remove();
        this.g.append(function () { return _this.summaryPlot[0][0] });

    }

    CoverMatrix.prototype.destroy = function(b){
        this.g.remove();
    }

}


    

