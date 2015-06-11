function Study_FB()
{
   
    Study_FB.prototype.loadFile = function(file){


        matrixGapMouseover = false;

        // CONDITION PARAMETERS
        // MATRIX_WIDTH = 200
        // CELL_SIZE = 10;

        MATRIX_GAP_HORIZONTAL = 10
        MATRIX_GAP_VERTICAL = 20
    
        hoveredMatrix = null;
        draggingMatrix = null; // index of currently dragged matrix (for matrices[])
        selectedMatrices = [];
        dragActive = false;

        nodes = []; 

        _fileNodeOrder = [];
        
        var _this = this;

        d3.json(file,function (graph) 
        {
            _graph = graph;
          
            nodes = graph.nodes;            
            _fileNodeOrder = []
            for(var i=0 ; i<nodes.length ; i++){
                _fileNodeOrder.push(i);
            }
        
            MATRIX_WIDTH = CELL_SIZE * nodes.length;
            // CELL_SIZE = MATRIX_WIDTH / nodes.length;

            var x = (SVG_WIDTH - MATRIX_WIDTH) /2; 
            var y = 100;

            // INIT MATRICES
            matrices = []
            for (var t = 0 ; t < graph.times.length; t++){
                var matrix = new Matrix(
                    t,
                    graph.times[t].matrix,
                    _fileNodeOrder,
                    svg);
                matrices.push(matrix);
                matrix.setVisibility(false);
                matrix.moveTo(x,y)
                matrix.g.on("dragstart", null)
                matrix.g.on("drag", null)
                matrix.g.on("dragend", null)
                matrix.g.on("click", null)
                matrix.g.on("mouseover", null)
                matrix.g.on("mouseout", null)
            }
            matrices[matrices.length-1].setVisibility(true);

            previews = svg.selectAll(".previews")
                .data(matrices)
                .enter()
                .append("line")
                .attr("class", "previews")
                .attr("id", function(d, i){return "pilepreview_"+i})
                .attr("x1", function(_,i){return x + i * 2})
                .attr("x2", function(_,i){return x + i * 2})
                .attr("y1", function(_,i){return y + MATRIX_WIDTH + 30})
                .attr("y2", function(_,i){return y + MATRIX_WIDTH + 40})
                .style("stroke", "#999")
                .style("stroke-width", 1)
                .on("mouseover", function(d,i){ 
                    _this.pilePreviewMouseOver(d)
                })
                .on("mouseout", function(d,i){ 
                    _this.pilePreviewMouseOut(d)})
                .on("click", function(d, i){
                    if(_currentTask != 'STATES'){
                        endTrail(d, i)
                    }else{
                        if(_selectedGaps.indexOf(i) > -1){
                            _selectedGaps.splice(i, 1)
                            d3.select(this).attr("stroke", "#999")
                        }else{
                            console.log("push")
                            _selectedGaps.push(i)
                            d3.select(this).attr("stroke", "#000")
                        }
                    }
                })
    
            finalizeNextTrail();
        });

    }

            

 
    Study_FB.prototype.pilePreviewMouseOver = function(d) {
        console.log("pilePreviewMouseOver")
        isMouseOverPilePreview = true;
        hoveredMatrix = d;
        for (var m = 0; m < matrices.length; m++) {
            matrices[m].setVisibility(false);
        }
        hoveredMatrix.setVisibility(true);  
        
        var v = d3.select("#pilepreview_" + d.id);
        if(v[0][0] != null){
            v.style('stroke', '#000');    
            v.style('stroke-width', 4)
        }
    }

    Study_FB.prototype.pilePreviewMouseOut = function(d) {
        isMouseOverPilePreview = false;
        
        if(_selectedGaps.indexOf(matrices.indexOf(hoveredMatrix)) == -1){
            var v = d3.select("#pilepreview_" + d.id);
            if(v[0][0] != null){
                v.style('stroke', '#999');
                v.style('stroke-width', 1)
            }
        }

        hoveredMatrix = null;
    }
}