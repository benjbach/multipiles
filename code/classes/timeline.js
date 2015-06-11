function Timeline(){

	var PILE_WIDTH = 40;
	var PILE_GAP = 5
	var MATRIX_GAP = 2
	var MATRIX_LINES_GAP = 20; // gap between locally ordered matrices to show node traces
	var TIMELINE_MARGIN_LEFT = 130

	var HORIZONTAL = true;
	_thisTimeline = this;

	var previousOver

	var timelineNodeOrder = []

	this.g = svgTimeline.append("g")
		.attr("transform", 
			"translate(" + TIMELINE_MARGIN_LEFT + ", 0)")
		.attr("height", TIMELINE_HEIGHT);

	// this.line = this.g.append("line")
	// 	.attr("x1", 0)
	// 	.attr("y1", TIMELINE_HEIGHT - 20)
	// 	.attr("x2", _courseWidth)
	// 	.attr("y2", TIMELINE_HEIGHT - 20)
	// 	.attr("width", piles.length * 10)		
	// 	.attr("id", "timeline");

	// Timeline.prototype.rotateStacking = function(){
	// 	HORIZONTAL = !HORIZONTAL;
	// 	_thisTimeline.setStackingDirection(HORIZONTAL);
	// 	_thisTimeline.updateLayout();
	// }

	// var rotateButton = this.g.append('g')
	// 	.on("click", _this.rotateStacking)
	// 	.style('cursor','pointer');
	// rotateButton.append("rect")
	// 	.attr('y', TIMELINE_HEIGHT - 17)
	// 	.attr('width', 100)
	// 	.attr('height', 20)
	// 	.style('fill', 'darkgray');
	// rotateButton.append("text")	
	// 	.attr("x", 2)
	// 	.attr("y", TIMELINE_HEIGHT - 4)
	// 	.attr("id", "stackChangeButton")
	// 	.attr("class", "timelineControl")
	// 	.style('fill','white');
	var labelDist = (TIMELINE_HEIGHT - 20) / (nodes.length);
	
	Timeline.prototype.setStackingDirection = function(isHorizontal){
		HORIZONTAL = isHorizontal;
		if(HORIZONTAL){
			PILE_GAP = 1
			PILE_WIDTH = TIMELINE_HEIGHT - 20;
			MATRIX_GAP = 6
			d3.select("#stackChangeButton").text("Stack Vertically");
		}else{
			PILE_GAP = 5			
			PILE_WIDTH = 40;
			MATRIX_GAP = 4
			d3.select("#stackChangeButton").text("Stack Horizontally");
		}
		_thisTimeline.segLen = PILE_WIDTH / nodes.length;
	}
	this.setStackingDirection(HORIZONTAL);

	var labelDrag = d3.behavior.drag()
			.on("dragstart", labelDragStart)
			.on("drag", labelDrag)
			.on("dragend", labelDragEnd)
	
	var nodeLabelSize = Math.min(labelDist*1.1, 12)

	this.nodeLabels = this.g.selectAll(".timelineNodeLabels")
		.data(nodes)
		.enter()
			.append("text")
			.attr("x", TIMELINE_MARGIN_LEFT)
			.attr("y", function(d,i){
				return (i+1) * labelDist})
			.attr("class", "timelineNodeLabels")
			.style("font-size", nodeLabelSize)
			.text(function(d, i){return d.name})
			.call(labelDrag)
			.on("click", function(d,i){
				if(d3.event.shiftKey){
					focusOn([d]);
				}else{
					clearSelectedNodes()
				}
			})
			.on("mouseover", function(d,i){
				mouseOverCol = i; 
				showEgoNetwork(true)
				d3.select(this).style('font-size', 12)
			})
			.on("mouseout", function(d,i){
				mouseOverCol = -1; 
				showEgoNetwork(false)
				d3.select(this).style('font-size', nodeLabelSize)
			})

	
	var selectedNodes = []
	function labelDragStart(d,i){
		d3.selectAll(".timelineNodeLabels.selected")
			.attr("class","timelineNodeLabels")
		selectedNodes = [];	
		selectedNodes.push(d);	
		d3.select(this).attr("class","timelineNodeLabels selected");
	}
	function labelDrag(d){
		var ey = d3.event.y
		d3.selectAll(".timelineNodeLabels")
			.each(function(d,i){
				var obj = d3.select(this);
				if(Math.abs(obj.attr("y") - ey) <= 3){
					if(selectedNodes.indexOf(d) == -1){	
						selectedNodes.push(d);	
						obj.attr("class","timelineNodeLabels selected")
					}
				}
			})
	}
	function labelDragEnd(d){
		if(selectedNodes.length > 1){
			var focusNodes= []
			for(var i=0 ; i<selectedNodes.length ; i++){
				focusNodes.push(nodes.indexOf(selectedNodes[i]))
			}
			console.log('select some', focusNodes)
			focusOn(focusNodes)
		}else{
			// console.log('select one', allPileOrdering[orderMenu.selectedIndex])
			// selectedNodes = []
			// focusOn(allPileOrdering[orderMenu.selectedIndex])
			clearSelectedNodes()
		}
	}

	function clearSelectedNodes(){
		d3.selectAll(".timelineNodeLabels.selected")
			.attr("class","timelineNodeLabels")
		selectedNodes = [];	
		focusOn(allPileOrdering[orderMenu.selectedIndex]);
	}

	function matrixMouseOver(m) 
	{	
		highlightNoPile()
		d3.select(this)
			.attr('opacity', .5)

		// UPDATE PILES PLOT
		if(previousOver){
			d3.select(previousOver)
				.attr('opacity', 1)
			previousOver.__data__.pile.showSingle(undefined)	
			previousOver.__data__.pile.draw()	
		}
		m.pile.showSingle(m)
		highlightPile(m.pile)
		m.pile.draw()
		previousOver = this

		render()
	}

	function matrixMouseOut(m){
		m.pile.showSingle(undefined)	
		m.pile.draw()	

		render()
	}

	function showEgoNetwork(b){

		if(b) {
			svgTimeline.selectAll(".colPreview")
	    		.style('opacity', function(v,i) {
	    			var matrix = matrices[parseInt(i/(timelineNodeOrder.length),10)];
	    			var i = i % timelineNodeOrder.length;
	    			i = timelineNodeOrder[i]
	    			if(matrix)
	    				return mouseOverCol == i ? 0: cellValue(matrix.matrix[i][mouseOverCol]);
	    		});
		}
		else{
			svgTimeline.selectAll(".colPreview")
	    		.style('opacity', function(v,i) {
					var matrix = matrices[parseInt(i/(timelineNodeOrder.length),10)];
	    			i = timelineNodeOrder[i]
					if(matrix) 
		    			return cellValue(v);
	    		});
		}
	}

	var mouseOverCol = -1;
	function mouseOverColPreview(d, i) {
		mouseOverCol = i;
	}

	Timeline.prototype.updateLayout = function() 
	{
		var _this = this;    

		this.g.selectAll(".timelineMatrix").remove();
		this.g.selectAll(".timelineMatrix-hovered").remove();

		this.previews = this.g.selectAll(".timelineMatrix")
			.data(matrices.filter(function(d,i){
				return piles.indexOf(d.pile) >= startPile
			}))
			.enter()
			.append('g')
			.attr("id", function(d,i){return "timelineMatrix_" + d.id;})
			.attr('transform', function(d) {
				return 'translate('+ (TIMELINE_MARGIN_LEFT + _this.getMatrixPositionX(d))+','+_this.getMatrixPositionY(d)+')';
			})
			.attr("class", "timelineMatrix")
			.style("stroke-width", MATRIX_GAP)
			.on("mouseover", matrixMouseOver)
			.on("click", function(d,i){
				if(d.pile.getMatrixPosition(d) == 0){
					var mats = d.pile.pileMatrices;
					var i = piles[piles.indexOf(d.pile)-1];
					pile(mats, i)
					savePilingHistory()
				}else{
					splitPile(d)
					savePilingHistory()
				}
			})
			.each(makeColumnPreviews(PILE_WIDTH))
			.on('mouseout', matrixMouseOut)

		if(HORIZONTAL)
		{
			this.previews.append("text")
				.attr('x', -5)
				.attr('y', TIMELINE_HEIGHT -8)
				.attr("class", "timelineTimeLabels")
				.style("font-size", MATRIX_GAP*2)
				.text(function(d, i){
					if(matrices.indexOf(d) % 5 == 4 )
						return matrices.indexOf(d)+1
				})
		

            // CREATE LINES CONNECTING odered piles
			this.g.selectAll(".nodeTrace").remove();

            var ml, mr, n, il, ir,
            	plx, prx, py
            var orderState  = false
            for(var i=1 ; i<piles.length ; i++){
			    if(piles[i].size() == 0 || !piles[i].IS_LOCALLY_ORDERED) 
			    	continue;
           		
           		mr = piles[i].get(0);
           		ml = piles[i-1].getLast();

           		plx = TIMELINE_MARGIN_LEFT + this.getMatrixPositionX(ml) - MATRIX_GAP/2;
           		plx += MATRIX_GAP;
           		prx = TIMELINE_MARGIN_LEFT + this.getMatrixPositionX(mr) - MATRIX_GAP/2;
           		py = this.getMatrixPositionY(mr) + this.segLen/2;


           		this.g.selectAll(".nodeTrace.pile_" + i )
                	.data(timelineNodeOrder)
                	.enter()
                    .append("line")
                    .attr("class", "nodeTrace pile_" + i)
                    .attr("x1", plx)
                    .attr("x2", prx)
                    .attr("y1", function(d,i){
                    	return py + ml.nodes.indexOf(d) * _this.segLen })
                    .attr("y2", function(d,i){
                    	return py + mr.nodes.indexOf(d) * _this.segLen })
           	}	
		}
	}


	Timeline.prototype.getMatrixPositionX = function(matrix){
		var x;
		if(HORIZONTAL){
			var pilePos = 0;
			var orderState = false;
			for(var i=startPile ; i < piles.indexOf(matrix.pile) ; i++){
				pilePos += piles[i].size() * MATRIX_GAP + PILE_GAP;
				if(i>0 && (
					orderState || 
					piles[i].IS_LOCALLY_ORDERED))
					pilePos += 10;
				orderState = piles[i].IS_LOCALLY_ORDERED;
			}		
			if(piles.indexOf(matrix.pile)>0 && (orderState || matrix.pile.IS_LOCALLY_ORDERED))
				pilePos += MATRIX_LINES_GAP;

			x = ((matrix.pile.getMatrixPosition(matrix)+1) * MATRIX_GAP) + pilePos;
		}else{
			x = (piles.indexOf(matrix.pile) - startPile) * (PILE_WIDTH + PILE_GAP);
		}

		return x;
	}
	Timeline.prototype.getMatrixPositionY = function(matrix){
		var y;
		if(HORIZONTAL)
			y = TIMELINE_HEIGHT - PILE_WIDTH - 21
		else
			y = this.line.attr("y1") - ((matrix.pile.getMatrixPosition(matrix)+1) * MATRIX_GAP);

		return y;
	}

	Timeline.prototype.updateNodeOrder = function(newNodeOrder){
		timelineNodeOrder = newNodeOrder;
		this.g.selectAll(".timelineNodeLabels")
			.attr("y", function(d,i){
				return (timelineNodeOrder.indexOf(i)+1) * labelDist})
	}


	function makeColumnPreviews(width, opacityMultiplier) {
		opacityMultiplier = 1;
	    return function(d) {
			// var _this = this;		       
	        var g = d3.select(this);
	        var segLen = width / d.nodeValues.length;
	        if(HORIZONTAL){
				g.selectAll(".colPreview")
		            .data(d.nodeValues)
		            .enter()
		            .append('line')
		            .attr('class','colPreview')
		            .attr('y1',function(_,i) {
		                return i * segLen;
		            })
		            .attr('y2',function(_,i) {
		                return segLen*(i+1);
		            })
		            .on('mouseover',mouseOverColPreview)
					.style('stroke', '#000')
		            .style('opacity',function (v) { return cellValue(v)});
	        }else{
	        	g.selectAll(".colPreview")
		            .data(d.nodeValues)
		            .enter()
		            .append('line')
		            .attr('class','colPreview')
		            .attr('x1',function(_,i) {
		                return i* segLen;
		            })
		            .attr('x2',function(_,i) {
		                return segLen*(i+1);
		            })						
		            .style('opacity',function (v) { return cellValue(v)});
	        }
		};
  	}

  	Timeline.prototype.showSourceTarget = function(source, target){
  		
  		this.hideSourceTarget();

  		var y1 = timelineNodeOrder.indexOf(source) * labelDist;
  		var y2 = timelineNodeOrder.indexOf(target) * labelDist;
   		var lineData = [ 
  			{ "x": TIMELINE_MARGIN_LEFT + MARGIN_LEFT - 5,   "y": y1},  
			{ "x": TIMELINE_MARGIN_LEFT + MARGIN_LEFT - 25,  "y": y1 + (y2-y1)/8},
			{ "x": TIMELINE_MARGIN_LEFT + MARGIN_LEFT - 25,  "y": y1 + (y2-y1)*7/8},
            { "x": TIMELINE_MARGIN_LEFT + MARGIN_LEFT - 5,  "y": y2}];

		var lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
	        .interpolate("basis");

  		var curve = svgTimeline.append("path")
  			.attr("id", "nodeline")
            .attr("d", lineFunction(lineData))
            .attr("stroke", "#888")
            .attr("stroke-width", 1)
            .attr("fill", "none");

  		var arrowData = [ 
  			{ "x": TIMELINE_MARGIN_LEFT + MARGIN_LEFT - 7, "y": y2-3},  
			{ "x": TIMELINE_MARGIN_LEFT + MARGIN_LEFT - 2, "y": y2},
            { "x": TIMELINE_MARGIN_LEFT + MARGIN_LEFT - 7, "y": y2+3}];
		
		var arrowLineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
	        .interpolate("linear")
	       
		var arrowHead = svgTimeline.append("path")
  			.attr("id", "arrowHead")
  			.attr("d", arrowLineFunction(arrowData))
            .attr("fill", "#444");

         d3.selectAll('.timelineNodeLabels')
         	.filter(function(d,i){return i==source || i==target})
			.style('font-size', 10)
  	}

  	Timeline.prototype.hideSourceTarget = function(){
		svgTimeline.select("#nodeline").remove();
		svgTimeline.select("#arrowHead").remove();
		d3.selectAll('.timelineNodeLabels')
			.style('font-size', 7)

  	}


  	Timeline.prototype.updatePiles = function(pile){
  		this.updateLayout();
  	}

  	Timeline.prototype.timelineDragStart = function(d){
  		console.log("Dragstart");
  	}
  	Timeline.prototype.timelineDrag = function(d){
  	  	console.log("drag");	
  	}  	
  	Timeline.prototype.timelineDragEnd = function(d){
  		console.log("dragend", d);
  	}

  	svgTimeline.on("wheel.zoom", timelinezoomed)

  	function timelinezoomed(){
  		d3.event.preventDefault();

  		if(d3.event.wheelDelta < 0){
	  		startPile += 1;
  		}else{
	  		startPile -= 1;
  		}
  		startPile = Math.min(piles.length-1, Math.max(0, startPile))
  		timeline.updateLayout();
  		updateLayout(0, false);
  	}

  	function setSliderLabel(){
  		
  	}

}
