function PilingAnimation(targetPile, matrices){
	
	this.targetPile = targetPile
	this.matrices = matrices.slice(0)
	
	this.steps = DURATION/1000 * FPS
	this.stepCount = 0

	// init
	this.animationPiles = []
	this.positions = []	
	// var m, p, sourcePile
	// this.dir

	this.done = false

	var x, y
	for(var i=0 ; i<matrices.length ; i++){
		m = matrices[i]
		this.positions.push([])
		for(var s=1 ; s<=this.steps ; s++){
			this.positions[i].push([
				m.pile.x 
				+ s *(targetPile.x 
					- m.pile.x)/this.steps, 
				m.pile.y + s *(targetPile.y - m.pile.y)/this.steps
			])
		}
		this.animationPiles.push(m.pile)
	}

	PilingAnimation.prototype.step = function(){
		if(this.stepCount < this.steps){
			for(var i=0 ; i<this.animationPiles.length ; i++){
				// console.log(this.positions[i][this.stepCount][0], this.positions[i][this.stepCount][1])
				this.animationPiles[i].moveTo(
					this.positions[i][this.stepCount][0],
					-this.positions[i][this.stepCount][1]
				)
			}
			this.stepCount++
		}else{
			this.finish()
		}
	}


	PilingAnimation.prototype.finish = function(){
     	this.done = true
       	// console.log('pile: ', this.matrices.length, piles.length)
        pile(this.matrices, this.targetPile, false)
       	// console.log('piled: ', this.piles.length)
       	this.animationPiles = []
     	for(var i=0 ; i<this.animationPiles.length ; i++){
     		if(this.animationPiles[i] != this.targetPile)
	     		this.animationPiles[i].destroy()
     	}
	}
}


function SplitAnimation(matrix){
	
	this.matrix = matrix
	
	this.steps = DURATION/1000 * FPS
	this.stepCount = 0

	// init
	this.animationPiles = []
	this.dir = []	
	this.positions= [] // positions for each time step 

	this.done = false

	var x, y
	var pSource = this.matrix.pile;
    this.pNew = new Pile(pileIDCount++,scene, allPileOrdering[orderMenu.selectedIndex], _zoomFac);
    this.pNew.colored = pSource.colored;
    piles.splice(piles.indexOf(pSource)+1, 0, this.pNew);

    var m = [];
    for(var i=pSource.getMatrixPosition(matrix) ; i<pSource.size() ; i++){
        m.push(pSource.getMatrix(i))
    }

    pile(m, this.pNew, false)
    updateLayout(piles.indexOf(this.pNew)-1, true);
    if(orderMenu.selectedIndex == ORDER_LOCAL)
        this.pNew.setNodeOrder(this.pNew.calculateLocalOrder())

    this.pNew.draw();
    pSource.draw();
    this.dir = [(this.pNew.x-pSource.x)/this.steps, (this.pNew.y-pSource.y)/this.steps]
    for(var i=1 ; i<=this.steps ; i++){
    	this.positions.push([pSource.x + i * this.dir[0], -pSource.y + i * this.dir[1]])
    }



	// move pNew back to where pSource is.
	this.pNew.moveTo(pSource.x, pSource.y)
    
	SplitAnimation.prototype.step = function(){
		if(this.stepCount < this.steps){
			// console.log(this.pNew.y, this.pNew.y + this.dir[1])
			this.pNew.moveTo(
				this.positions[this.stepCount][0], 
				this.positions[this.stepCount][1]
			)
			this.stepCount++
		}else{
			this.finish()
		}
	}

	SplitAnimation.prototype.finish = function(){
     	this.done = true
	}
}

function DepileAnimation(piles, startPos){
	
	this.startPos
	this.piles = piles
	this.steps = DURATION/1000 * FPS
	this.stepCount = 0
	this.done = false

	this.positions = []
	for(var i=0 ; i<this.piles.length ; i++){
		this.positions.push([])
		for(var s=1 ; s<=this.steps ; s++){
			this.positions[i].push([
				startPos.x + s *(this.piles[i].x - startPos.x)/this.steps, 
				startPos.y + s *(this.piles[i].y - startPos.y)/this.steps
			])
		}
		this.piles[i].moveTo(startPos.x, startPos.y)
	}

    
	DepileAnimation.prototype.step = function(){
		if(this.stepCount < this.steps){
			for(var i=0 ; i<this.piles.length ; i++){
				this.piles[i].moveTo(
					this.positions[i][this.stepCount][0], 
					-this.positions[i][this.stepCount][1]
				)
			}
			this.stepCount++
		}else{
			this.finish()
		}
	}

	DepileAnimation.prototype.finish = function(){
     	this.done = true
     	for(var i=0 ; i<this.piles.length ; i++){
     		this.piles[i].draw()
     	}
     	render()
	}
}