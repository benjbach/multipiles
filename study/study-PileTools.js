var pileTools = [
{
    name: "Depile",
    colour: "#77f",
    shortCut: "D",
    doit: function (piles, study) {
        var p = []
        p.push.apply(p, piles)
        for(var i=p.length-1 ; i>=0 ; i--){
             _currentTechniqueClass.depile(p[i]);
        }
    },
    single: false
}];
