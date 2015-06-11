function hideTools(svg) {
    d3.timer(function () {
        if (pileTools.mouseover || hoveredMatrix) 
            return true;
        var tools = svg.selectAll(".pileTools").remove();
        return true;
    }, 400);
}



function pilePreviewMouseOut(d) {
    isMouseOverPilePreview = false;
    // hoveredMatrix.showBackground(true);
    // hoveredMatrix.showFrame(false);
    
    var c;
    var v = d3.select("#pilePreview_" + d.id);
    if(v[0][0] != null){
        c = v.attr('class').split('-')[0];
        v.attr('class', c);
      }
    
    if (d.colPreviewMode) {
        v.selectAll(".colPreview")
            .style('opacity',function (v) { return 2*v/d.maxColumnTotal; });
        d.colPreviewMode = false;
    }

    hoveredMatrix.pile.showAggregation();
    hoveredMatrix = null;
}

function Pile(id, MATRIX_WIDTH, svg) {


    var PILE_LABEL_GAP = 13;
    var LINE_GAP_TOP = 2;
   
    this.id = id;
    var colors = ["#f00", "#0f0", "#00f", "#f0f", "#ff0", "#0ff"]
    var colorIndex = 0;
    var colorUsage = [0, 0, 0, 0, 0, 0];

    this.MATRIX_WIDTH = MATRIX_WIDTH;
    this.pileMatrices = [];
    this.x = 0;
    this.y = 0;
 
	this.colored = false;
	this.svg = svg;
    this.g = svg
    	.append("g")
        .attr("id", "pile_" + id)
		.attr("transform", "translate(" + this.x + "," + this.y + ")");

    this.REQUIRE_ORDER_UPDATE = true;
    this.UPDATE_AGGREGATION_MATRIX = true;

    this.coverMatrix = new CoverMatrix(id, this, this.g)
    this.coverMatrix.setVisibility(false);

    Pile.prototype.add = function (matrices) {
        var m;
        for (var i = 0 ; i < matrices.length ; i++) {
            m = matrices[i];
            this.pileMatrices.push(m);
            m.moveTo(this.x, this.y, false);
            m.pile = this;
        }

        this.positionLabels()
        this.REQUIRE_ORDER_UPDATE = true;
        this.UPDATE_AGGREGATION_MATRIX = true;
    }

    // remove the specified matrices from the pile.  
    // If any were the visible matrix,
    // then make the remaining last element of the pile visible.
    // redraw the remaining labels at the correct positions.
    Pile.prototype.remove = function (matrices) {
        var wasvisible = false;
        for (var i = 0; i < matrices.length; i++) {
            var m = matrices[i];
            for (var j = 0; j < this.pileMatrices.length; j++) {
                if (m === this.pileMatrices[j]) {
                    if (m.visible) wasvisible = true;
                    this.pileMatrices.splice(j, 1);
                    break;
                }
            }
        }
        if (wasvisible && this.pileMatrices.length > 0) {
        	this.pileMatrices[this.pileMatrices.length - 1].setVisibility(true);
        }

        this.positionLabels();
        this.REQUIRE_ORDER_UPDATE = true;
        this.UPDATE_AGGREGATION_MATRIX = true;
    }

    Pile.prototype.getMatrixPosition = function (matrix) {
        return this.pileMatrices.indexOf(matrix);
    }

    Pile.prototype.get = function (index) {
    	return this.pileMatrices[index];
    }
    

    Pile.prototype.contains = function (matrix) {
        return this.pileMatrices.indexOf(matrix) > -1;
    }

    Pile.prototype.size = function () {
        return this.pileMatrices.length;
    }

    Pile.prototype.getLast = function () {
        return this.pileMatrices[this.pileMatrices.length-1];
    }



    Pile.prototype.showAggregation = function  ()
    {
        if(this.pileMatrices.length == 1){
            this.coverMatrix.setVisibility(false);
            this.pileMatrices[0].setVisibility(true);
            return;
        }
        this.coverMatrix.setVisibility(true);
        this.coverMatrix.showMode(this.mode)

        this.UPDATE_AGGREGATION_MATRIX = false;

        for (var m = 0; m < this.pileMatrices.length; m++) {
            this.pileMatrices[m].setVisibility(false);
        }
    } 


    Pile.prototype.showSingle = function  (matrix) 
    {
        // cover matrices are just hidden by this matrix, 
        // no need to explicitly remove them. 

        var a = 0;

        for (var m = 0; m < this.pileMatrices.length; m++) {
            this.pileMatrices[m].setVisibility(false);
            this.pileMatrices[m].label.style("opacity", 0);  
        }
        matrix.setVisibility(true);
        matrix.label.style("opacity", 1) 
        matrix.frame.attr("class", "matrixbackground-highlighted")

        if(this.fixedMatrix != null) 
      		this.fixedMatrix.setVisibility(true);
    }

    

    Pile.prototype.makeOnlyTopMatrixFilled = function () {
        var first = null;
        var _this = this;
        this.svg.selectAll('.matrix').each(function (d) {
            if (d.pile === _this && !first) first = d;
        });
        this.pileMatrices.forEach(function (m) {
            m.frame.style('fill', m === first ? '#fff' : 'none');
        });
    }

    Pile.prototype.positionLabels = function () {

        if (this.pileMatrices.length == 0) return;

        var mat;
        if(!this.pileMatrices.length === 1){
            for (var m = 0; m < this.pileMatrices.length; m++) {
                mat = this.pileMatrices[m];
                mat.label.attr("x", MATRIX_WIDTH - 10)
                mat.label.attr("y", MATRIX_WIDTH + 10)
                mat.label.style("opacity", 0)
            }
         }

        var _this = this;
        // update lines
        this.g.selectAll(".pilePreview").remove();
        
        if(this.pileMatrices.length > 1)
        {
            var previewLines = this.g.selectAll(".pilePreview")
                .data(this.pileMatrices)
                .enter()
                .append('g')
                .attr("class", "pilePreview")
                .attr('transform',function (d,i) {
                    return 'translate('+(MATRIX_WIDTH + LINE_GAP_TOP*i)+',0)'
                })
                .on("mouseover", pilePreviewMouseOver)
                .on("mouseout", pilePreviewMouseOut)
                .attr("id", function(d,i){return "pilePreview_" + d.id;})
                .each(makeColumnPreviews(MATRIX_WIDTH))
                .on('click', function (d) {
                    _this.splitPile(d)
                });
        }
    }

    Pile.prototype.splitPile = function(m){
        splitPile(m)
    }

    //////// GRAPHICS STUFF
    Pile.prototype.moveTo = function (x, y, animate) 
    {
    	this.x = x;
    	this.y = y;
    	var g = animate ? this.g.transition() : this.g;
    	g.attr("transform", "translate(" + this.x + "," + this.y + ")");

    	for(var i=0 ; i<this.pileMatrices.length ; i++){
    		this.pileMatrices[i].moveTo(x, y, animate);
    	}
    }

    Pile.prototype.getG = function () {
        return this.g;
    }

    Pile.prototype.setColor = function(color){
    	if(!this.colored){
    		for(var i=0 ; i< this.pileMatrices.length ; i++){
	    		this.pileMatrices[i].setColor(colors[colorIndex])
	    	}
	    	colorUsage[colorIndex] =1;
	    	colorIndex = colorUsage.indexOf(0);
    	}else{
    		for(var i=0 ; i< this.pileMatrices.length ; i++){
    			this.pileMatrices[i].resetColor()
    		}
	    	colorUsage[colorIndex] = colorUsage.indexOf(0);
    	}
    	console.log(colorIndex);
    
    	this.colored = !this.colored
    }

    Pile.prototype.showAllMatrices = function(){
        for(var i=0 ; i<this.pileMatrices.length ; i++){
            this.pileMatrices[i].setVisibility(true);
        }
    }

    Pile.prototype.updatePileMatrix = function()
    {
        this.pileMatrix = [];
        for (var i=0 ; i<this.pileMatrices[0].matrix.length ;i++) {
            this.pileMatrix[i] = [];
            for (var j=0 ; j< this.pileMatrices[0].matrix[i].length; j++) {
                this.pileMatrix[i][j] = 0;
            }
        }
        for (var t=0 ;t < this.pileMatrices.length ;t++) {
            for (var i=0 ;i < this.pileMatrices[t].matrix.length ;i++) {
                for (var j=0; j < this.pileMatrices[t].matrix[i].length ;j++) {
                    if(this.pileMatrices[t].matrix[i][j] > CELL_THRESHOLD)
                       this.pileMatrix[i][j] += this.pileMatrices[t].matrix[i][j];
                }
            }
        }
    }

    Pile.prototype.destroy = function(){
        this.g.selectAll(".pilePreview").remove();
        pileMatrices = []
        d3.select(this.g).remove();

        this.coverMatrix.destroy();
    }     

    function makeColumnPreviews(width) {
    opacityMultiplier = typeof opacityMultiplier !== 'undefined' ? opacityMultiplier : 1;
    return function(d) {
        var g = d3.select(this);
        var segLen = width / d.columnTotals.length;
        g.selectAll(".colPreview")
            .data(d.columnTotals)
            .enter()
            .append('line')
            .attr('class','colPreview')
            // .attr('x1',function(_,i) {
            //     return i*segLen;
            // })
            // .attr('x2',function(_,i) {
            //     return segLen*(i+1);
            // })
            .attr('y1',function(_,i) {
                return i*segLen;
            })
            .attr('y2',function(_,i) {
                return segLen*(i+1);
            })
            .style('opacity',function (v) { return opacityMultiplier*v/d.maxColumnTotal; });
    };
}

function pilePreviewMouseOver(d) {
    // console.log("pilePreviewMouseOver")
    isMouseOverPilePreview = true;
    hoveredMatrix = d;
    d.pile.showSingle(d);
    // hoveredMatrix.frame.attr("class", "matrixbackground-highlighted");
    // hoveredMatrix.showFrame(true);
    var c;
    var v = d3.select("#pilePreview_" + d.id);
    if(v[0][0] != null){
        c = v.attr('class').split('-')[0];
        v.attr('class', c+'-hovered');    
    }

    hoveredMatrix.pile.coverMatrix.setVisibility(false);

}

}

