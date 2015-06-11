function Slider(svg, height, min, max){

    _this = this

    this.height = height
    this.LEFT = 80;
    this.TOP = 20;
    var RIGHT = 20;
    this.BOTTOM = 50;
    var WIDTH = 300;
    var max = max;
    var min = 0;


    this.currentValue = 0;

    var valueRange = d3.scale.linear()
        .domain([this.TOP, this.height - this.BOTTOM])
        .range([max, 0]) 

    var drag = d3.behavior.drag()
        .origin(Object)
        .on("drag", dragMove)
        .on('dragend', dragEnd);

    this.svg = svg;

    this.g = svg.append("g")
        .attr("height", this.height)
        .attr("width", WIDTH)
        .attr("transform", "translate(0,0)")

    this.g.append("line")
        .attr("x1", this.LEFT)
        .attr("y1", this.TOP)
        .attr("x2", this.LEFT)
        .attr("y2", this.height-this.BOTTOM)
        .style("stroke", "#aaa")

    var circle = this.g.append("circle")
        .attr("id", "#sliderKnob")
        .attr("r", 7)
        .attr("cx", this.LEFT )
        .attr("cy", this.height-this.BOTTOM)
        .attr("fill", "#000")
        .style('opacity', .4)
        .call(drag);

    this.sliderLabel = this.g.append('text')
        .attr("x", this.LEFT + 20)
        .attr("y", this.height-this.BOTTOM+6)
        .text('Drag me')
        .attr('class', 'sliderLabel')

    this.g.append("text")
        .attr("x", this.LEFT-20)
        .attr("y", this.TOP-5)
        .text("All Piled")
        .attr("class", "sliderLabel")

    this.g.append("text")
        .attr("x", this.LEFT-20)
        .attr("y", this.height - this.BOTTOM + 20)
        .text("All Matrices (" + matrices.length + ")")
        .attr("class", "sliderLabel")

    this.sequentialBtn = this.g.append("text")
        .attr("x", this.LEFT -10)
        .attr("y", this.height - this.BOTTOM + 35)
        .text("Sequential")
        .attr("class", "sliderLabel")
        .on('click',function(d){
            setPilingMethod('sequential')
            _this.sequentialBtn.style('fill', '#000')
            _this.clusteredBtn.style('fill', '#999')
        })

    this.clusteredBtn = this.g.append("text")
        .attr("x", this.LEFT -10)
        .attr("y", this.height - this.BOTTOM + 50)
        .text("Clustered")
        .attr("class", "sliderLabel")
        .on('click',function(d){
            setPilingMethod('clustered')
            _this.sequentialBtn.style('fill', '#999')
            _this.clusteredBtn.style('fill', '#000')
        })
    this.sequentialBtn.style('fill', '#999')

    


    function dragMove() {
        var y = getBoundedMouse(this)
        circle.attr("cy", y)
        circle.attr("cx", _this.LEFT);
        _this.sliderLabel.attr("y", y)
        _this.sliderLabel.attr("x", _this.LEFT + 20);
        this.currentValue = valueRange(y)
        _this.sliderLabel.text(this.currentValue.toFixed(2))

    }

    function getBoundedMouse(target){
        return Math.max(20, Math.min(_this.height - _this.BOTTOM, d3.mouse(target)[1]))
    }

    function dragEnd() {
        var y = getBoundedMouse(this)
        this.currentValue = valueRange(y)
        setSimilarityPiling(this.currentValue);
    }

    Slider.prototype.setSliderKnob = function(value){
        this.currentValue = value
        console.log(valueRange.invert(value))
        circle.attr("cy", valueRange.invert(value))
        _this.sliderLabel.attr("y", valueRange.invert(value) -5)
    }

    Slider.prototype.setSliderLabel = function(string){
       _this.sliderLabel.text(string)
    }

    Slider.prototype.setTick = function(label, value){
        console.log('setTick')
        _this.g.append("text")
            .attr("x", _this.LEFT-5)
            .attr("y", valueRange.invert(value) + 3)
            .text(label)
            .attr("class", "sliderLabel")
            .attr('text-anchor', 'end')
            
        _this.g.append("line")
            .style("stroke", "#777")
            .attr("x1", _this.LEFT-3)
            .attr("x2", _this.LEFT+2)
            .attr("y1", valueRange.invert(value))
            .attr("y2", valueRange.invert(value))
    
    }


    Slider.prototype.destroy = function(){
        _this.g.remove();
    }


}

    function setSliderActive(b){
        if(b)
            d3.select("#sliderKnob").style("opacity", 0.2)
        else
            d3.select("#sliderKnob").style("opacity", 1)
    }

