var pileUtils = new PileUtils()

function PileUtils(){


	PileUtils.prototype.calculateClusterPiling = function(threshold, matrices, distanceMatrix){
    	var piling = [0]
		var pilecount = 1
		for(var i=1 ; i<matrices.length; i++){
			for(var j=i-1 ; j>= piling[pilecount-1] ;j--){
				// console.log(i, j, distanceMatrix[i][j], threshold)
				if(distanceMatrix[i][j] > threshold){
					piling[pilecount] = i; 
					pilecount++;
					break;
				}
			}
		}
		return piling
	}


	PileUtils.prototype.calculateDistance = function(matrices, nodes){
		var dMat = []
		for(var i=0 ; i<matrices.length; i++){
			dMat[i] = [];		
			for(var j=0 ; j<matrices.length; j++){
				dMat[i][j] = -1;						
			}
		}

		var maxDist
		for(i=1 ; i<matrices.length; i++){
			for(j=i-1; j>=0; j--){
				d = this.distance(matrices, i, j, nodes, dMat);
				maxDistance = Math.max(maxDistance, d);
			}
		}
		
		return {
			distanceMatrix: dMat, 
			maxDistance: maxDistance
		}

	}


	PileUtils.prototype.distance = function(matrices, m1,m2, nodes, dMat){

		if(dMat[m1][m2] != -1){
			return dMat[m1][m1];
        }
        var d=0, 
        	a=0, 
        	b=0

        for(var i=0 ; i<nodes.length ; i++){
            a = nodes[i]
            for(var j=i ; j<nodes.length ; j++){
                b = nodes[j]
                d += Math.pow(matrices[m1][a][b] - matrices[m2][a][b], 2);
            }
        }
        d = Math.sqrt(d);
        dMat[m1][m2] = d;
        dMat[m2][m1] = d;
        return d;
    }


}
