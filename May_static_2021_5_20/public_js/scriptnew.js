let FLAGPlayer = 0
var tooltip = d3.select("#body")
    .append("div")
    .attr("class", "tooltip")
    .style("z-index", "10")//10
    .style("opacity", 0)


class Tree{
    constructor(depth, lc, rc){
        // set_Variable()
		refreshGlobalVariable()
        set_Variable(depth)
        construct_luoji(depth)

		fill_Proportion()
        this.lc = lc.bind(this)
        this.rc = rc.bind(this)
    }
    run(tree){
        // console.log("run depth:"+depth)
        const width = window.innerWidth;
		const height = window.innerHeight - 117;
        const radius = (Math.min(width, height)) / 2 / depth;

		const arc = d3.arc()
                .startAngle(d => d.x0)
                .endAngle(d => d.x1)
                .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))//0.005
                .innerRadius(d => d.y0  * radius )   //+ Math.pow(1.5,d.depth-1)
                .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))// + Math.pow(1,d.depth-1)) //newcode
                .padRadius(radius* 1.5 )
    
        const partition = data => {
            const root = d3.hierarchy(data)
                    .sum(d => d.size)
                    .sort((a, b) => b.value - a.value);
            return d3.partition()
                    .size([2 * Math.PI, root.height + 1])
                    (root);
        };
        var data = tree
        const root = partition(data);
        
        root.each(d => d.current = d);
        
        d3.select('#partitionSVG').selectAll('*').remove()
        const svg = d3.select('#partitionSVG')
                .style("width", "100%")
                .style("height", "100%")
                .style("font", "10px monospace"); // key2   about the size of the label
				
        const g = svg.append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);

        g.append("g")
                .selectAll("path")
                .data(root.descendants().slice(1))
                .join("path")
                .attr("fill", getColor)
                .attr("d", d => arc(d.current))
                .on('click', d =>{
                    
                    if(FLAGPlayer == 0){
                        console.log('call red player')
                        if (d.data.isLeaf) {
                            this.lc(d)
                        }
                    }else{
                        console.log('call blue player')
                        if (d.data.isLeaf) {
                            this.rc(d)
                        }
                        d3.event.preventDefault()
                    }
                   
                })
                .on("mouseover", function(d) {
                    d3.selectAll("path")
                    .transition()
                    .duration(300)
                    .style("opacity", 1);
                    
                    //test
                    // alert(d.data.value)//+ "depth:"+Math.pow(2, depth-1)

                    var sequenceArray = d.ancestors().reverse();
                    sequenceArray.shift(); 
                    
                    svg.selectAll("path")
                    .filter(function(node) {
                                return (sequenceArray.indexOf(node) >= 0);
                            })
                    .transition()
                    .duration(300)
                    .style("opacity", 0.8);

                    tooltip.html(d.data.label)
                    return tooltip
                      .transition()
                      .duration(300)
                      .style("opacity", 1)
                  })
                  .on("mousemove", function(d) {
                    return tooltip
                    .transition()
                    .duration(300)
                      .style("top", (d3.event.pageY+0)+"px")//+10
                      .style("left", (d3.event.pageX+0)+"px");//+10
                  })
                  .on("mouseout", function(d){
                   d3.selectAll("path")
                    .transition()
                    .duration(300)
                    .style("opacity", 1);

                    return tooltip
                    .transition()
                    .duration(300)
                    .style("opacity", 1);
                  })
               
        g.append("g")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .style("user-select", "none")
                .selectAll("text")
				// .attr("font-size", "7px")
				// .attr("font-family", "monospace")
				// .attr("stroke-width", "0px")
                .data(root.descendants().slice(1))
                .join("text")
                .attr("dy", "0.35em")
                .attr("transform", d => labelTransform(d.current))
                //key2 if you do not want to show the label on the disk, just comment out the following sentence
                .text(d => d.data.label);


        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }
    }
}