function Study_MP(){

    // CONDITION PARAMETERS
    

    var selectionDrag = d3.behavior.drag()
                .on("dragstart", dragStart)
                .on("drag", drag)
                .on("dragend", endDrag)

    var buttonHover = false 
 

    cols = 0

    var pileIDCount = 0

    var matrixGaps = []

     
   
    Study_MP.prototype.loadFile = function(file){
        
        _this = this;

        MATRIX_WIDTH = 200
        CELL_SIZE = 4;

        hoveredMatrix = null;
        draggingMatrix = null; // index of currently dragged matrix (for matrices[])
        selectedMatrices = [];
        dragActive = false;

        matrixGapMouseover = false;

        cols = 0

        _fileNodeOrder = [];

        pileIDCount = 0
        buttonHover = false;

        d3.json(file,function (graph) 
        {
            _graph = graph;
            nodes = graph.nodes;

            nodes = graph.nodes;            
            _fileNodeOrder = [];
            for(var i=0 ; i<nodes.length ; i++){
                _fileNodeOrder.push(i);
            }
          
            MATRIX_WIDTH = CELL_SIZE * nodes.length;
            cols = SVG_WIDTH 
            cols = Math.floor(cols / (MATRIX_WIDTH + MATRIX_GAP_HORIZONTAL))
         
            
            // svg.call(selectionDrag) 

            svg.append("rect")
                .attr("x", SVG_WIDTH/2 - 50)
                .attr("y", 5)
                .attr("width", 100)
                .attr("height", 20)
                // .on("click", function(){
                //     console.log("pile all")
                //     pile(matrices, piles[0])
                // })
                .style("fill", "#666")
                .style("stroke", "none")
                .on("mouseover", function(){buttonHover = true;})
                .on("mouseout", function(){buttonHover = false;})

            svg.append("text")
                .attr("x", SVG_WIDTH/2-20)
                .attr("y", 20)
                .text("Pile All")
                .style("fill", "#fff")
                .on("mouseover", function(){buttonHover = true;})
                .on("mouseout", function(){buttonHover = false;})

            var pos;
            piles = []

            for (var i = 0; i < graph.times.length ; i++) {
                var p = new Pile(pileIDCount++,MATRIX_WIDTH, svg);
                piles.push(p);
            }


            
            // INIT MATRICES
            matrices = []
            for (var t = 0 ; t < graph.times.length ; t++) {
                var p = piles[t]
                var matrix = new Matrix(
                    t,
                    graph.times[t].matrix,
                    _fileNodeOrder,
                    svg);

                matrices.push(matrix);
                p.add([matrix]);

                matrix.g.on("mouseover", function (d) {
                    var i = parseInt(d3.select(this).attr("id").split('_')[1]);
                    hoveredMatrix = matrices[i];
                    showTools(hoveredMatrix.pile);
                })
                matrix.g.on("mouseout", function (d) {
                    hideTools(svg);
                    hoveredMatrix = null;
                });        
            }

            // create clickable gaps between matrices
            matrixGaps = svg.selectAll("matrixGap")
                .data(piles)
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
                    console.log("click gap")
                    pileBackwards(i)
                })

            matrixGaps
                .on("mouseover", function(d,i){ 
                    d3.select(this).attr("class", "matrixGap-hovered")
                    matrixGapMouseover = true;
                })
                    .on("mouseout", function(d,i){ 
                    matrixGapMouseover = false;
                    d3.select(this).attr("class", "matrixGap")})


            var s = 0;
            var mats = []
            for(var i=0 ; i<matrices.length ; i++){
                if(i>_graph.stateborders[s]){
                    console.log("pile");
                    s++;
                    pile(mats, piles[s])
                    mats = []
                }
                mats.push(matrices[i])
            }
            pile(mats, piles[s])
              
              
            _this.updateLayout(0, false);



            if(_isLoadedSession)
                finalizeLoadSession()


            finalizeNextTrail();

        });

    }

    ////////////////////////////////
    /// PILING

    // Piles a set of matrices onto a target pile 
    // removes it from source pile, and 
    // updates the layout
    Study_MP.prototype.pile = function(mats, targetPile)
    {   
        var matricesToPile = []; 
        matricesToPile.push.apply(matricesToPile, mats);
        var insertIndex;
        var pos;
        var m;
        var sourcePile, spi;
        for (var i = 0; i < matricesToPile.length; i++)
        {
            // console.log("pile ", i);
            m = matricesToPile[i]; 
            sourcePile = m.pile;
            sourcePile.remove([m]);
            if(sourcePile.size() == 0 && sourcePile != targetPile){
                sourcePile.destroy();
                spi = piles.indexOf(sourcePile);
                piles.splice(spi,1);
            }

        }
        targetPile.add(matricesToPile);
        updateLayout(piles.indexOf(targetPile), true);
        deselectAllMatrices();
        targetPile.showAggregation();  
     }


    function pileBackwards(i){
        if(Math.floor(i / this.cols) % 2 == 1)
            i--;

        if(piles[i].size() == 1){
            console.log("piles[i].length == 1")
            var toPile = [];
            for(var j=i ; j>= 0 ; j--){
                if(piles[j].size() > 1){
                    pile(toPile, piles[j+1]);
                    break;
                }else if(piles[j].size() == 1){
                    if(j == 0){
                        pile(toPile, piles[0]);       
                        break;               
                    }else{
                        toPile.push(piles[j].get(0))
                    }    
                }
            }
        }else if(piles[i].size() > 1 && i>0){
            pile(piles[i].pileMatrices, piles[i-1])
        }
     }

    Study_MP.prototype.depile = function(pile){
        var mats = [];
        var ix = piles.indexOf(pile);
        mats.push.apply(mats, pile.pileMatrices)
        // console.log("try depile: ",mats.length,"matrices");
        if(mats.length == 1) return;

        for(var i=mats.length-1 ; i>0 ; i--){
            pile.remove([mats[i]])
                           
            var pNew = new Pile(pileIDCount++,MATRIX_WIDTH, svg);
            pNew.colored = pile.colored;
            piles.splice(ix+1, 0, pNew);
            
            pNew.add([mats[i]])

            pNew.showAggregation();
        }

        pile.showAggregation();
        this.updateLayout(ix, true);
    }


   
    // Splits a pile at the position of the passed matrix. 
    // The passed matrix becomes the base for the new pile 
    function splitPile(matrix)
    {
        var pSource = matrix.pile;
        var pNew = new Pile(pileIDCount++,MATRIX_WIDTH, svg);
        pNew.colored = pSource.colored;
        piles.splice(piles.indexOf(pSource)+1, 0, pNew);

        var m = [];
        for(var i=pSource.getMatrixPosition(matrix) ; i<pSource.size() ; i++){
            m.push(pSource.get(i))
        }

        pile(m, pNew);
        console.log("_this",_this)
        _this.updateLayout(piles.indexOf(pNew)-1, true);
        pNew.showAggregation();
        pSource.showAggregation();
    }



    Study_MP.prototype.removeFromPile= function(pile){

    }

    function deselectAllMatrices()
    {
        for(var i in selectedMatrices)
        {
            selectedMatrices[i].frame.attr("class", "matrixbackground")
        }
        selectedMatrices = [];
    }

         

    Study_MP.prototype.showSingleMatrix= function(pile, matrixIndex){
        var a=0;
        if(pile.length > 1){
            for(var m in pile){
                if(lowerTriangleMatrices.indexOf(pile[m]) == -1){
                   pile[m].setVisibility(false);
                    activePile = pile;
                    if(pile[m] == matrices[matrixIndex])
                        activeMatrixInPileIndex = a; 
                    a++;
                }
            }
            matrices[matrixIndex].setVisibility(true);  
        }
    }



    // Update layout depending on order of piles in piles array.
    // Starts updating at pileIndex.
    Study_MP.prototype.updateLayout= function(pileIndex, animate)
    {
        animate = true;
        var pos, p;
        var px
        for(var i=pileIndex ; i<piles.length ; i++){            
            p = piles[i];
            pos = this.getLayoutPosition(i);
            px = pos.x;
            py = pos.y;
            p.moveTo(pos.x, pos.y, animate)
            matrixGaps.filter(function(_,j) {
                    return i==j})
                .attr("x", function(d,j){
                    // console.log(j,px, px + MATRIX_WIDTH + 2 * piles[i].size())
                    return px + MATRIX_WIDTH + 2 * piles[i].size()})
                .attr("y", py)
        }

        matrixGaps.filter(function(_,j){
                return j>=piles.length;
            })
            .style("opactity", 0)
            .on("mouseover", null)
        matrixGaps.filter(function(_,j){
                return j<piles.length;
            })
            .style("opacity",1)
            .on("mouseover", function(d,i){ 
                d3.select(this).attr("class", "matrixGap-hovered")
                matrixGapMouseover = true;
            })

    }


    ////////////////////////
    ///////// DRAG /////////
    ////////////////////////

    // General dragging function on svg
    function dragStart()
    {
        if(_currentTechnique != 'MP') return;

        if(matrixGapMouseover) return;

        draggingMatrix = null;
        console.log("hoveredMatrix == null",hoveredMatrix == null)
        if(hoveredMatrix != null){
            startDragMatrix()
        }else{
            startDragSelectionRectangle();
        }
    }

    function drag(event){
        if(_currentTechnique != 'MP') return;
        
        if(draggingMatrix != null){  
            dragMatrix()
        }else{
            dragSelectionRectangle()
        }
    }

    function endDrag(){
        if(_currentTechnique != 'MP') return;
        
        if(draggingMatrix != null){  
            endDragMatrix()
        }else{
            endDragSelectionRectangle()
        }                   
        draggingMatrix = null; 
    }

    var selectionRect = (function () {
        var x1, x2, y1, y2;
        return {
            start: function (x, y) {
                x1 = x2 = x;
                y1 = y2 = y;
            },
            drag: function (x, y) {
                x2 = x;
                y2 = y;
            },
            minX: function () { return Math.min(x1, x2) },
            maxX: function () { return Math.max(x1, x2) },
            minY: function () { return Math.min(y1, y2) },
            maxY: function () { return Math.max(y1, y2) },
            width: function () { return Math.abs(x1 - x2) },
            height: function () { return Math.abs(y1 - y2) }
        }
    })();

    function startDragSelectionRectangle() {
        deselectAllMatrices();
        if (pileTools.mouseover) return;
        var mousePos = d3.mouse(svg[0][0]);
        selectionRect.start(mousePos[0], mousePos[1]);

        svg.append("rect")
            .attr("id", "selectionRect")
            .attr("x", selectionRect.minX())
            .attr("y", selectionRect.minY())
            .attr("width", 0)
            .attr("height", 0);
    }            

    function dragSelectionRectangle() {
        var mousePos = d3.mouse(svg[0][0]);
        selectionRect.drag(mousePos[0], mousePos[1]);

        d3.select("#selectionRect")
            .attr("x", selectionRect.minX())
            .attr("y", selectionRect.minY())
            .attr("width", selectionRect.width())
            .attr("height", selectionRect.height());        
    }

    function endDragSelectionRectangle(){
        console.log("end drag")
        d3.select("#selectionRect").remove();

        // get matrices in selectionRect
        for(var i = 0; i < matrices.length; i++){
            var m = matrices[i],
                x = m.x + MATRIX_WIDTH,
                y = m.y + MATRIX_WIDTH;
            if( x > selectionRect.minX() && x < selectionRect.maxX()
                && y > selectionRect.minY() && y < selectionRect.maxY())
            {
                selectedMatrices.push(m);
            }
        }
        hideTools(svg);

        if(selectedMatrices.length > 0)
            pile(selectedMatrices, selectedMatrices[0].pile);
        else if(buttonHover)
            pile(matrices, piles[0])


        buttonHover = false;
    }

    function startDragMatrix(){
        draggingMatrix = hoveredMatrix;
    
        // bring draggingMatrix to top of z buffer:
        var g = draggingMatrix.g.remove(); 
        svg.append(function () { return draggingMatrix.g[0][0] });
    }

    function dragMatrix(){
        draggingMatrix.move(d3.event.dx, d3.event.dy);
        dragActive = true;
    }

    function endDragMatrix()
    {
        var targetPile, targetMat;
        // look for pile where to push matrix
        var pos;
        var p;
        for(var i=0 ; i< piles.length ; i++){
            p = piles[i];
            pos = [p.x, p.y]
            var dist = Math.sqrt( 
                Math.pow(pos[0] - draggingMatrix.x, 2) + 
                Math.pow(pos[1] - draggingMatrix.y, 2)); 
            if(dist < MATRIX_WIDTH){
                targetPile = p;
                break;
            }
        }

        if (targetPile == null) {
            // fix layout when no drop target found
            _this.updateLayout(0, true);
            return;
        }
        if(targetPile == draggingMatrix.pile){
            if(isMouseOverPilePreview){
                splitPile(draggingMatrix)
            }
            else{
                if(_currentTask != 'STATES') 
                    endTrail(matrices.indexOf(draggingMatrix))
            }

            return;
        } 


        pile([draggingMatrix], targetPile);
    
        draggingMatrix = null;
        dragActive = false;
    }

    function generalKeydown(event)
    {
       
    }

    function generalKeyup(){
        // shiftDown = false;
    }

    // index indicates the matrix index, not its position 
    // in the layout
    Study_MP.prototype.getMatrixPosition = function(matrixIndex)
    {
        return _this.getLayoutPosition(matrixPos[matrixIndex])
    }

    Study_MP.prototype.getLayoutPosition = function(index)
    {
        var x=MARGIN_LEFT, y=MARGIN_TOP;
        for(var i=0 ; i<index ; i++){
            x += MATRIX_WIDTH + (piles[i].size()*2) + MATRIX_GAP_HORIZONTAL
            if((x+MATRIX_WIDTH + (piles[i].size()*2) + MATRIX_GAP_HORIZONTAL) > SVG_WIDTH){
                x = MARGIN_LEFT;
                y += MATRIX_WIDTH + MATRIX_GAP_VERTICAL; 
            }
        }
        return {x: x, y: y}

        // var row = Math.floor(index / cols);
        // var col = Math.floor(index % cols);
        
        // return {
        //     x: MARGIN_LEFT + col * (MATRIX_WIDTH + MATRIX_GAP_HORIZONTAL),
        //     y: MARGIN_TOP + row * (MATRIX_WIDTH + MATRIX_GAP_VERTICAL)
        // };
    }

    // Sorts matrices in pile according to time
    function sortTime(pile){
        // console.log("sort time");
        pile.pileMatrices.sort(matrixTimeComparator)
        pile.positionLabels();
    }

    function matrixTimeComparator(a,b){
        return parseInt(a.id) - parseInt(b.id); 
    }   

   function hidedistance(){
        for(var i in matrices){
            matrices[i].gPlot.style("opacity", "1") 
        }
    }

    

    // Piles a set of matrices onto a target pile 
    // removes it from source pile, and 
    // updates the layout
    function pile(mats, targetPile)
    {   
        var matricesToPile = []; 
        matricesToPile.push.apply(matricesToPile, mats);
        var insertIndex;
        var pos;
        var m;
        var sourcePile, spi;
        for (var i = 0; i < matricesToPile.length; i++)
        {
            // console.log("pile ", i);
            m = matricesToPile[i]; 
            sourcePile = m.pile;
            sourcePile.remove([m]);
            if(sourcePile.size() == 0 && sourcePile != targetPile){
                sourcePile.destroy();
                spi = piles.indexOf(sourcePile);
                piles.splice(spi,1);
            }
        }
        targetPile.add(matricesToPile);
        sortTime(targetPile)
        targetPile.positionLabels()

        _this.updateLayout(piles.indexOf(targetPile), true);
        deselectAllMatrices();
        targetPile.showAggregation();  
    }
}

    function showTools(pile) {
        // console.log(piles.indexOf(pile))
        pileTools.pile = pile; 
        var tools = this.svg.selectAll(".pileTools")
            .data(pileTools.filter(function(d,i){
                return d.single || pile.size() > 1;}));
       
        var added = tools.enter().append('g')
            .style('opacity', 0)
            .attr('class', 'pileTools');
        added
            .append("rect")
            .attr('width', 15)
            .attr('height', 15)
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('fill', function (d) {
                return d.colour;
            })
            .on('mouseover', function () {
                pileTools.mouseover = true;
                tools.style('opacity', 1);
            })
            .on('mouseout', function () {
                pileTools.mouseover = false;
                tools.style('opacity', 0);
                hideTools(pileTools.pile.svg)
            })
            .on('click', function (d) {
                d.doit([pileTools.pile]);
            });
        added.append('title').text(function (d) { return d.name; });
        added.append('text')
            .attr('class','toolLabel')
            .attr('fill', 'white')
            .attr('pointer-events','none');

        tools.select('rect')
            .attr('y', pile.y + MATRIX_WIDTH)
            .attr('x', function(d,i){ 
                return pile.x + MATRIX_WIDTH -15});
        
        tools.select('text')
            .attr('y', function (d, i) {
                var y = pile.y + MATRIX_WIDTH +12 ;
                return y;
            })
            .attr('x', function(d,i){ return pile.x + MATRIX_WIDTH -15 +3})
             .text(function(d) { return d.shortCut })

        tools.transition()
            .style('opacity', 1);
    }