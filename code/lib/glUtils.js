var GLUtils = new GLUtils()

function GLUtils(){
    GLUtils.prototype.addBufferedRect = function(array,x,y,z,w,h, colorArray, c)
    {
        w = w/2
        h = h/2
        array.push(
            [x-w, y-h, z],
            [x+w, y-h, z],
            [x+w, y+h, z],
            [x+w, y+h, z],
            [x-w, y+h, z],
            [x-w, y-h, z]
        )
        colorArray.push(
            [c[0], c[1], c[2]],
            [c[0], c[1], c[2]],
            [c[0], c[1], c[2]],
            [c[0], c[1], c[2]],
            [c[0], c[1], c[2]],
            [c[0], c[1], c[2]]
        )
    }


    GLUtils.prototype.makeBuffer3f = function(array){
        var buffer = new Float32Array( array.length * 3); // three components per vertex
        for ( var i = 0; i < array.length; i++ )
        {
            buffer[ i*3 + 0 ] = array[i][0];
            buffer[ i*3 + 1 ] = array[i][1];
            buffer[ i*3 + 2 ] = array[i][2];
        }
        return buffer  
    }

    GLUtils.prototype.createRectFrame = function(w,h, color, lineThickness)
    {   
        w = w/2
        h = h/2
        var geom = new THREE.Geometry();
        geom.vertices = [ 
            new THREE.Vector3(-w,-h,0), 
            new THREE.Vector3(-w, h,0),
            new THREE.Vector3( w, h,0),
            new THREE.Vector3( w,-h,0),
            new THREE.Vector3(-w,-h,0)
            ]

        var material = new THREE.LineBasicMaterial( {
            color:  color, 
            linewidth: lineThickness,
            linejoin: 'round',
            linecap: 'round' 

        });
        
        return new THREE.Line( geom, material);
    }

    GLUtils.prototype.createRect = function(w,h, color)
    {   
        var geom = new THREE.PlaneBufferGeometry(w, h, 1 , 1)
        var m = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true, 
                opacity: 1 })
        return new THREE.Mesh(geom, m)
    }

    GLUtils.prototype.createText = function(string, x, y, z, size, color, weight){
        if(!weight)
            weight = 'normal'
        var textGeom = new THREE.TextGeometry(string, {
                size: size,
                height: 1,
                weight: weight, 
                curveSegments: 5,
                font: 'helvetiker',
                bevelEnabled: false
            })
        var textMaterial = new THREE.MeshBasicMaterial( { color: color } );
        var label = new THREE.Mesh(textGeom, textMaterial)
        label.position.set(x,y,z)
        return label
    }
    

}







function createMarker(x, y, z, color)
{   
    var l = 10;
    var geom = new THREE.Geometry();
    
    geom.vertices = [ 
        new THREE.Vector3(-l,0,0), 
        new THREE.Vector3(l, 0,0), 
        new THREE.Vector3(0,-l,0), 
        new THREE.Vector3(0, l,0), 
    ]

    var material = new THREE.LineBasicMaterial( {
        color:  color, 
        linewidth: 1        
    });
    
    var m = new THREE.Line( geom, material, THREE.LinePieces );

    m.position.set(x, y, z)
    
    return m;
}






