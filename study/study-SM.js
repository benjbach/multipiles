function Study_SM(){

    Study_SM.prototype.loadFile = function(file){

        var _this = this;
           
        d3.json(file,function (graph) 
        {
            _graph = graph;
          
               // CONDITION PARAMETERS
            MATRIX_WIDTH = 200
            CELL_SIZE = 4;

            MATRIX_GAP_HORIZONTAL = 10
            MATRIX_GAP_VERTICAL = 20

            matrices = []; // contains all matrices 

            hoveredMatrix = null;
            draggingMatrix = null; // index of currently dragged matrix (for matrices[])
            selectedMatrices = [];
            dragActive = false;


            nodes = []; 

            nodes = graph.nodes;            
            console.log("nodes", nodes.length)
            _fileNodeOrder = []
            for(var i=0 ; i<nodes.length ; i++){
                _fileNodeOrder.push(i);
            }
        
            MATRIX_WIDTH = CELL_SIZE * nodes.length;
            cols = SVG_WIDTH 
            cols = Math.floor(cols / (MATRIX_WIDTH + MATRIX_GAP_HORIZONTAL))
           
            // INIT MATRICES
            for (var t = 0 ; t < graph.times.length; t++){
                var matrix = new Matrix(
                    t,
                    graph.times[t].matrix,
                    _fileNodeOrder,
                    svg);
                matrices.push(matrix);
                pos = _this.getLayoutPosition(t);
                matrix.moveTo(pos.x, pos.y)
                matrix.g.on('mouseover', null)
                matrix.g.on('mouseout', null)
            }

            if(_currentTask == 'STATES'){
                // create clickable gaps between matrices
                var matrixGaps = svg.selectAll("matrixGap")
                    .data(matrices)
                    .enter()
                    .append("rect")
                    .attr("x", function(d,i){
                        return  _this.getLayoutPosition(i).x + MATRIX_WIDTH ;
                    })
                    .attr("y", function(d,i){
                        return  _this.getLayoutPosition(i).y;
                    })
                    .attr("width", MATRIX_GAP_HORIZONTAL-3)
                    .attr("height", MATRIX_WIDTH)
                    .attr("class", "matrixGap")
                    .on("click", function(d,i){
                       pileBackwards(i)
                    })

                matrixGaps.on("mouseover", function(d,i){ 
                    if(_selectedGaps.indexOf(i) == -1)
                        d3.select(this).attr("class", "matrixGap-hovered")
                    })
                matrixGaps.on("mouseout", function(d,i){ 
                    if(_selectedGaps.indexOf(i) == -1)
                        d3.select(this).attr("class", "matrixGap")
                    })
                matrixGaps.on("click", function(d,i){ 
                    if(_selectedGaps.indexOf(i) > -1){
                        _selectedGaps.splice(i, 1)
                        d3.select(this).attr("class", "matrixGap")
                    }else 
                        _selectedGaps.push(i)
                })

            }


            finalizeNextTrail();
        });
    }

    Study_SM.prototype.getLayoutPosition = function(index)
    {
        var row = Math.floor(index / cols);
        var col = Math.floor(index % cols);

        return {
            x: MARGIN_LEFT + col * (MATRIX_WIDTH + MATRIX_GAP_HORIZONTAL),
            y: MARGIN_TOP + row * (MATRIX_WIDTH + MATRIX_GAP_VERTICAL)
        };
    }

    
    Study_SM.prototype.pilePreviewMouseOver = function(d) {
        // console.log("pilePreviewMouseOver")
        isMouseOverPilePreview = true;
        hoveredMatrix = d;
        for (var m = 0; m < matrices.length; m++) {
            matrices[m].setVisibility(false);
        }
        hoveredMatrix.setVisibility(true);  
        
        var v = d3.select("#pilepreview_" + d.id);
        if(v[0][0] != null){
            v.style('stroke', '#000');    
        }
    }

    Study_SM.prototype.pilePreviewMouseOut = function(d) {
        isMouseOverPilePreview = false;
        hoveredMatrix = null;
        
        var v = d3.select("#pilepreview_" + d.id);
        if(v[0][0] != null){
            v.style('stroke', '#777');    
        }
    }
}