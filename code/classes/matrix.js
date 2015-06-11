function Matrix(id, matrix) {

    var DIAGONAL_VALUE = 0;

    this.matrix = matrix;
    numNodes = matrix.length
    for (var i=0 ;i < numNodes ;i++) {
        for (var j=i; j < numNodes ;j++) {
            this.matrix[i][j] = Math.max(0, this.matrix[i][j])
            this.matrix[j][i] = this.matrix[i][j]
        }
    }
        
    this.pile;

    this.id = id;

    // GLOBAL VARS
    this.nodeValues = new Array(matrix.length);
    var v 
    for(var i=0 ; i<matrix.length; i++){
        v = 0
        for(var j=0 ; j<matrix[i].length; j++){
          v += matrix[i][j] 
        }    
        this.nodeValues[i] = v/matrix.length
    }

    this.color = "#aaa" // annotation color of matrix

    Matrix.prototype.getConnectionValue = function (source, target) {
        var value = this.matrix[this.currentNodeOrder.index(source)][this.currentNodeOrder.index(target)];
        return value;
    }
}
    

