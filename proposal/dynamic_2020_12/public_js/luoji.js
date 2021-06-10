const colorMap = {
    normal: '#6699FF',    // the inital color of each node 
    red_process: '#e14089',//when the red player just choose a node, it becomes red.
    blue_end: '#9966FF',//it is the blue player's normal end.   purple
    blue_dark_end:'#663399', //when blue player's end appears in the dummy area.  drak purple
    red_end: 'lightgreen', // when the red player's strategy is resolved, it becomes lightgreen
    predictcolor:'#056E5F' //to represent that a leaf node is legit
}

//get the Color of each node.
function getColor(d) {

    if (d.data.isDummy && !d.data.blue && !d.data.predictcolor) return d.data.dummy_color

    if (d.data.red_process) {
        return colorMap.red_process
    }else if(d.data.red_end){
        return  colorMap.red_end
    } else if (d.data.blue_end) {
        return colorMap.blue_end 
        // if(d.data.isDummy){ 
        //     return colorMap.blue_dark_end
        // }else{
            
        // }
    }else if(d.data.predictcolor){ 
        return colorMap.predictcolor
    }else if(d.data.normal) { 
        return colorMap.normal
    }
}
let cur_red_choice_num = 0 // to represent how many nodes you have chosen at present
let next = 'red'  //to represent this is whose turn to move
let Recording = []; //This is used to record every step
  
// this variable can only be set at the beginning of the game, and we can not change it during the process.
let depth = 7;  // levels of the tree;  if depth == 10, that means the tree has 10 levels(including the root)
let beginLabel;// the start label of the leaf node
let endLabel;// the end label of the leaf node
let treemap;
let Play_mode = "";

const tree = {
    label: '0',
    id:'0',
    children: [],
    color: colorMap.未选择,
    isLeaf: false,
    dummy: new Set(),
    preCor:"normal",
    curCor:"normal"
}

//to inital some important variables related with depth
function set_Variable(depth){
    beginLabel = Math.pow(2,depth-1)-1;
    endLabel = 2 * beginLabel;
}

function refreshGlobalVariable() {
    cache = {
        0: [tree]
    }
    Recording = []
}

let cache = {
    0: [tree]
}
let tmpCount = 0
let DUMMY = false  
let redNowLabel =  ''
let redNowLabel_id =''
let blueClickCount = 1
let blueSelectLabel = []

let isDoubleLabel = label => {
    return /\d+\/\d+/g.test(label)
}
function error(msg){
    alert(msg || 'Blue Error！！')
}

function newGame(){
    FLAGPlayer = 0
    Play_mode = ""
	next='red'
    cur_red_choice_num = 0
    fill_Proportion()
    start()
}

//produce an integer in the range of [min, max]   min<= output <= max
function Random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function start() {
    treemap = new Tree(depth, onlclick, onrclick)
    treemap.run(tree)
    window.onresize = () => {
        treemap.run(tree)
    }
}

start()

function minus(){
    depth --
    if (depth <= 4) depth = 4
    start()
    FLAGPlayer = 0
    // global_request = ""
    // des_Label = ""
    cur_red_choice_num = 0
    fill_Proportion()
}
function add() {
    depth ++
    if (depth >= 11) depth = 11
    console.log(depth, 'depth')
    start()
    FLAGPlayer = 0
    // global_request = ""
    // des_Label = ""
    cur_red_choice_num = 0
    fill_Proportion()
}



function construct_luoji(depth){
    let count = 1
    let id = 1
    for (let i = 0; i < depth - 1; i++) {
        cache[i + 1] = []
        for(let c of cache[i]) {
            let c1 = {
                label: count++ + '',
                id: id++ +"",
                children: [],
                isLeaf: i === depth - 2,
                p: c,
                dummy: new Set(),
                isDummy: false,
                normal:true,
                red_end:false,
                red_process:false,
                blue:false,
                predictcolor:false,
                value: Math.pow(2, depth-1),
                preCor:"normal",
                curCor:"normal"
            }
            let c2 = {
                label: count++ + '',
                id: id++ +"",
                children: [],
                isLeaf: i === depth - 2,
                p:c,
                dummy: new Set(),
                isDummy: false,
                normal:true,
                red_end:false,
                red_process:false,
                blue:false,
                predictcolor:false,
                value: Math.pow(2, depth-1),
                preCor:"normal",
                curCor:"normal"
            }
            if (i === depth - 2) {
                c1.size = i
                c2.size = i
            }
            c.children = [c1, c2]
            cache[i+1].push(c1, c2)
        }
    }
}

function checkNodeCanClick(d){ //check for blue player
    if(!d.data.predictcolor) return false  
    return true
}
const single = {  //single label of red player suitation (leaf node)
    check(bluelabel, redlabel) {   //check the strategy of blue player
        let blueNode = findNodeTo2(tree, bluelabel)
        let redNode = parseInt(redlabel)
        while (!blueNode.label.includes(redNode+"")) {
            let _b_label = blueNode.label.split('/')
            if (_b_label.length === 2 && !_b_label.includes(redNode+"")) {
                return false
            }
            blueNode = blueNode.p
            if(redNode%2==0){
                redNode = (redNode-2)/2
            }else{
                redNode = (redNode-1)/2
            }
        }
        return true
    },

    handle(bluelabel, redlabel) {   //change the corresponding color and label
        let blueNode = findNodeTo2(tree, bluelabel)
        // let redNode = findNodeTo(tree, redlabel)
        let redNode = parseInt(redlabel)
        while (!blueNode.label.includes(redNode+"")) {
            if (!isDoubleLabel(blueNode.label)) {
                if(blueNode.label == ""){
                    blueNode.label += redNode+""
                }else{
                    blueNode.label += '/' + redNode
                }
                tmpLayer ++
                blueNode.blue_end = true  
                blueNode.normal = false
                blueNode.curCor = "blue_end"
                blueNode = blueNode.p

                if(redNode%2==0){
                    redNode = (redNode-2)/2
                }else{
                    redNode = (redNode-1)/2
                }

            }else{
                break
            } 
        }
    }
}


async function onlclick(d) {   //left click  for  red player

    console.log("next:"+next)
    if (next !== 'red') return
    if (d.data.red_end) return
    if(d.data.label==""){
        d.data.normal = false
        d.data.red_end = true
        Recording.push("r:"+d.data.id+":normal")
        cur_red_choice_num++
        fill_Proportion()
        treemap.run(tree)
        console.log("Recording")
        console.log(Recording)
        return
    }
    
    next = 'blue'
    // status = 'process'
    redNowLabel = d.data.label
    redNowLabel_id = d.data.id

    if (isDoubleLabel(redNowLabel)){
        FLAGPlayer = 2
    }else{
        FLAGPlayer = 1
    }
    
    var str_cord = "r:"+redNowLabel_id
    
    findNodeTo2(tree, redNowLabel_id, node => {
        if(node.normal){
            str_cord +=":"+"normal"
        }else if(node.blue_end){
            str_cord +=":"+"blue_end"
        }
        node.red_process = true
    })
    Recording.push(str_cord)
    console.log(Recording)


    var tmpCount = 0;  //we use this num to record the number of the legit nodes in each round. if tmpCount==0 after a predicting round, then we can say the red player wins.
    if (!isDoubleLabel(redNowLabel)){ 
        for( var i = beginLabel; i < endLabel+1; i++ ){
            var label = ""+i; //change the i to a string
            findNodeTo2(tree, label, node => {
                if(!node.red_process && !node.red_end && !isDoubleLabel(node.label)){
                    if(single.check(label,redNowLabel)){
                        tmpCount ++;
                        if(node.normal){
                            node.preCor = "normal"
                            node.normal = false
                        }else if(node.blue_end){
                            node.preCor = "blue_end"
                            node.blue_end = false
                        }
                        node.predictcolor = true
                    }
                }
            })
        }

        if(tmpCount == 0){
            alert('red wins line:432')
        }
    }

    if (isDoubleLabel(redNowLabel)){ 
        // step1:
        var tmp_redNowLabels = redNowLabel.split('/')
        for( var i = beginLabel; i < endLabel+1; i++ ){
            var label = ""+i; //change the i to a string
            findNodeTo2(tree, label, node => {
                if( !node.red_end && !node.red_process && !isDoubleLabel(node.label)){
                    if(single.check(label,tmp_redNowLabels[0])){
                        tmpCount ++
                        if(node.normal){
                            node.preCor = "normal"
                            node.normal = false
                        }else if(node.blue_end){
                            node.preCor = "blue_end"
                            node.blue_end = false
                        }
                        node.predictcolor = true
                    }
                }
            })
        }
        if(tmpCount == 0){
            alert('red wins line:453')
        }
    }
    this.run(tree)
    cur_red_choice_num += 1
    fill_Proportion()

    // await sleep(1)
    Auto_blue()
}

async function onrclick(d) {   //right click for blue player
    console.log("next:"+next)
    if (next !== 'blue') return

    if (isDoubleLabel(redNowLabel)) { //represent that red player chose a double-labels node
       
        if(blueSelectLabel.length == 0){ 
            if(!d.data.predictcolor) return  
            blueSelectLabel.push(d.data.id)

            findNodeTo2(tree, blueSelectLabel[0], node => {
                
                node.predictcolor = false
                node.blue_end = true
                node.normal = false
                tmpLayer = 0
                var str_cord = "b:"+d.data.id+":"+node.curCor
                single.handle(blueSelectLabel[0], redNowLabel)
                str_cord += ":stop-"+tmpLayer+":"
                Recording.push(str_cord)
                console.log(Recording)
                treemap.run(tree)
            })

            //Remove the legal node for the first node
            for( var i = beginLabel; i < endLabel+1; i++ ){
                var label = ""+i; //change the i to a string
                findNodeTo2(tree, label, node => {
                    if(node.predictcolor){
                        if(node.preCor=="normal"){
                            node.normal = true
                        }else if(node.preCor=="blue_end"){
                            node.blue_end = true
                        }
                        node.red_process = false
                        node.red_end = false
                        node.predictcolor = false
                    }
                })
            }

            tmpCount = 0
            
            //Mark all the legal nodes for the second label
            for( var i = beginLabel; i < endLabel+1; i++ ){
                var label = ""+i; //change the i to a string
                findNodeTo2(tree, label, node => { //blueSelectLabel[0] != label 
                    if( !isDoubleLabel(node.label) && !node.red_process &&!node.red_end){
                        if(single.check(label, redNowLabel.split("/")[1])){
                            tmpCount ++;
                            if(node.normal){
                                node.preCor = "normal"
                                node.normal = false
                            }else if(node.blue_end){
                                node.preCor = "blue_end"
                                node.blue_end = false
                            }
                            node.predictcolor = true
                        }
                    }
                })
            }
            
            treemap.run(tree)
            if(tmpCount == 0){
                alert('red wins line:517')
            }
            return 

        }else{  //This indicates that the first legal node has been selected and the second node is currently being processed
            
            if(!d.data.predictcolor) return  
            for( var i = beginLabel; i < endLabel+1; i++ ){
                var label = ""+i; 
                if(label==d.data.id)
                    continue
                findNodeTo2(tree, label, node => {
                    if(node.predictcolor){
                        if(node.preCor=="normal"){
                            node.normal = true
                            node.blue_end = false
                        }else if(node.preCor=="blue_end"){
                            node.blue_end = true
                            node.normal = false
                        }
                        node.red_process = false
                        node.red_end = false
                        node.predictcolor = false
                    }
                })
            }
        }

    } else {  //means that red player chose a single-label leaf
        if (!checkNodeCanClick(d)) return

        //remove the predictor color to its original color
        for(var i = beginLabel; i < endLabel+1; i++){
            var label = ""+i; //change the i to a string
            if(label==d.data.id)
                continue
            findNodeTo2(tree, label, node => {
                if(node.predictcolor){
                    if(node.preCor=="normal"){
                        node.normal = true
                        node.blue_end = false
                    }else if(node.preCor=="blue_end"){
                        node.blue_end = true
                        node.normal = false
                    }
                    node.red_process = false
                    node.red_end = false
                    node.predictcolor = false
                }
            })
        }
    }

    next = 'red'

    findNodeTo2(tree, redNowLabel_id, node => {
        node.red_end = true 
        node.red_process = false
        node.blue_end = false
        node.predictcolor = false

    })

    findNodeTo2(tree, d.data.id, node => {
        node.normal = false
        node.blue_end = true
        node.red_process = false
        node.red_end = false
        node.predictcolor = false
    })

    if (isDoubleLabel(redNowLabel)) {
        
        FLAGPlayer = FLAGPlayer - 2
        tmpLayer = 0
        var tmpstr = Recording.pop()
        tmpstr += (d.data.id+":"+d.data.curCor)
        // double.handle(blueSelectLabel[0], d.data.id, redNowLabel)
        single.handle(d.data.id, redNowLabel.split("/")[1])
        tmpstr +=":stop-"+tmpLayer
        Recording.push(tmpstr)
        console.log(Recording)
        blueSelectLabel = []
        treemap.run(tree)

    } else {
        FLAGPlayer = FLAGPlayer - 1
        tmpLayer = 0
        var tmpstr = ("b:"+d.data.id+":"+d.data.curCor)
        single.handle(d.data.id, redNowLabel)
        tmpstr += ":stop-"+tmpLayer
        Recording.push(tmpstr)
        console.log(Recording)
        treemap.run(tree)  
    }
}


//Undo button
function UndoFunction(d){
    console.log('click undo button,the undo function begins')
    if(Recording.length == 0){
        console.log('Recording is empty')
        return
        
    }
    tmpCount = 0
    var tmp = Recording.pop()
    console.log(tmp)
    var tmps = tmp.split(":");
    if(tmps.length == 3){    //r:63:normal
        findNodeTo2 (tree, tmps[1], node => {  
            console.log("herehere")
            if(tmps[2]=="normal"){
                node.normal = true
                node.blue_end = false
                node.curCor = "normal"
            }else if(tmps[2]=="blue_end"){
                node.blue_end = true
                node.normal = "false"
                node.curCor = "blue_end"
            }
            node.red_process = false
            node.red_end = false
            node.predictcolor = false


            for( var i = beginLabel; i < endLabel+1; i++ ){
                var label = ""+i; //change the i to a string
                findNodeTo2(tree, label, node => {
                    if(node.predictcolor){
                        if(node.preCor=="normal"){
                            node.normal = true
                            node.blue_end = false
                        }else if(node.preCor=="blue_end"){
                            node.blue_end = true
                            node.normal = false
                        }
                        node.red_process = false
                        node.red_end = false
                        node.predictcolor = false
                    }
                })
            }  
        })    
        FLAGPlayer = 0
        next = 'red'
        redNowLabel = ""
        cur_red_choice_num -= 1
        fill_Proportion()

    }else if(tmps.length == 4 || tmps.length==5){ // b:126:normal:stop-6
        // b:159:normal:stop-6:
        //tmps is the strategy of blue player
        //This tmpired just wants to see which node is selected by the red player in the previous step。
        var tmpRed = Recording.pop()
        var tmpRedLabel = tmpRed.split(':')[1]
        var tmpcor = tmpRed.split(':')[2]
        // Recording.push(tmpRed)
        //Find the red node and restore it to red_ Process status
        findNodeTo2(tree, tmpRedLabel, node => {
            if(tmpcor=="normal"){
                node.normal = true
                node.blue_end = false
            }else if(tmpcor =="blue_end"){
                node.blue_end = true
                node.normal = false
            }
            node.red_process = false
            node.red_end = false
            node.predictcolor = false
        }) 

        //Find the blue node and return to normal state + predicting_color status
        findNodeTo2(tree, tmps[1], node => {  
            console.log('find it:'+tmps[1])
            var cor;
            if(tmps[2]=="normal"){
                node.blue_end = false
                node.normal = true
                cor = 1
            }else if(tmps[2]=="blue_end"){
                node.blue_end = true
                node.normal = false
                cor = 2
            }

            console.log("cor: "+cor)
            node.predictcolor = false 
            
            tmpOps = 0
            while ( tmpOps < parseInt(tmps[3].split('-')[1]) ) {
                if(node.label.split("/").length==2){
                    node.label = node.label.split('/')[0]
                }else if(node.label.split("/").length==1){
                    node.label = ""
                }
                if(cor==1){
                    node.normal = true
                    node.blue_end = false
                    node.curCor = "normal"
                }else{
                    node.normal = false
                    node.blue_end = true
                    node.curCor = "blue_end"
                }
                if(node.label==""){
                    node.normal = true
                    node.blue_end = false
                    node.curCor = "normal"
                }
                node = node.p
                tmpOps ++
            }
        }) 

        if(tmps.length==5){
            blueSelectLabel = []
            for( var i = beginLabel; i < endLabel+1; i++ ){
                var label = ""+i; //change the i to a string
                findNodeTo2(tree, label, node => {
                    if(node.predictcolor){
                        // console.log("did here")
                        if(node.preCor=="normal"){
                            node.normal = true
                            node.blue_end = false
                        }else if(node.preCor=="blue_end"){
                            node.blue_end = true
                            node.normal = false
                        }
                        node.red_process = false
                        node.red_end = false
                        node.predictcolor = false
                    }
                })
            } 
        }
        FLAGPlayer = 0
        next = 'red'
        redNowLabel = ""
        cur_red_choice_num -= 1
        fill_Proportion()
        console.log("Recording:")
        console.log(Recording)

    }else if(tmps.length == 7){ // b:110:normal:stop-5:111:normal:stop-4
       
        var tmpRed = Recording.pop()
        var tmpRedLabel = tmpRed.split(':')[1]
        var tmpcor = tmpRed.split(':')[2]

        //Find the red node and restore it to red_ Process status
        findNodeTo2(tree, tmpRedLabel, node => {
            if(tmpcor=="normal"){
                node.normal = true
                node.blue_end = false
            }else if(tmpcor =="blue_end"){
                node.blue_end = true
                node.normal = false
            }
            node.red_process = false
            node.red_end = false
            node.predictcolor = false
        }) 
  
        //Find the blue node and return to normal state + predicting_color status
        findNodeTo2(tree, tmps[1], node => {  
            console.log('find it:'+tmps[1])
            var cor;
            if(tmps[2]=="normal"){
                node.blue_end = false
                node.normal = true
                cor = 1
            }else if(tmps[2]=="blue_end"){
                node.blue_end = true
                node.normal = false
                cor = 2
            }

            console.log("cor: "+cor)
            node.predictcolor = false 
            
            tmpOps = 0
            while ( tmpOps < parseInt(tmps[3].split('-')[1]) ) {
                if(node.label.split("/").length==2){
                    node.label = node.label.split('/')[0]
                }else if(node.label.split("/").length==1){
                    node.label = ""
                }
                
                if(cor==1){
                    node.normal = true
                    node.blue_end = false
                    node.curCor = "normal"
                }else{
                    node.normal = false
                    node.blue_end = true
                    node.curCor = "blue_end"
                }
                if(node.label==""){
                    node.normal = true
                    node.blue_end = false
                    node.curCor = "normal"
                }
                node = node.p
                tmpOps ++
            }
        }) 

        //Find the blue node and return to normal state + predicting_color status
        findNodeTo2(tree, tmps[4], node => {  
            console.log('find it:'+tmps[4])
            var cor;
            if(tmps[5]=="normal"){
                node.blue_end = false
                node.normal = true
                cor = 1
            }else if(tmps[5]=="blue_end"){
                node.blue_end = true
                node.normal = false
                cor = 2
            }

            console.log("cor: "+cor)
            node.predictcolor = false 
            
            tmpOps = 0
            while ( tmpOps < parseInt(tmps[6].split('-')[1]) ) {
                if(node.label.split("/").length==2){
                    node.label = node.label.split('/')[0]
                }else if(node.label.split("/").length==1){
                    node.label = ""
                }
                if(cor==1){
                    node.normal = true
                    node.blue_end = false
                    node.curCor = "normal"
                }else{
                    node.normal = false
                    node.blue_end = true
                    node.curCor = "blue_end"
                }
                if(node.label==""){
                    node.normal = true
                    node.blue_end = false
                    node.curCor = "normal"
                }
                node = node.p
                tmpOps ++
            }
        }) 

        FLAGPlayer = 0
        next = 'red'
        redNowLabel = ""
        cur_red_choice_num -= 1
        fill_Proportion()
        console.log("Recording:")
        console.log(Recording)
    }
    else{
        console.log("what happened?")
    }

    treemap.run(tree);

    console.log('click undo button,the undo function ends')
    console.log()
}

//this function is used to show the proporation of red nodes
function fill_Proportion() {
    Proportion = cur_red_choice_num/(beginLabel+1) * 100
    document.getElementById("Proportion").innerHTML = Proportion + "%";
}

function Half(){
    newGame()
    var i = (beginLabel+(beginLabel-1)/2 +1);
    for(;i<=endLabel;i++){
        var node = findNodeTo2(tree,i+"")
        node.label = ""
        node = node.p
        while(node.id!="0" && node.label!=""){
            node.label = ''
            node = node.p
        }
    }
    treemap.run(tree)
}

function Quarter(){
    newGame()
    for(var i = beginLabel;i<=endLabel;i++){
        var node = findNodeTo2(tree,i+"")
        node.label = ""
        node = node.p
        while(node.id!="0" && node.label!=""){
            node.label = ''
            node = node.p
        }
    }
    var end = (beginLabel+(endLabel- beginLabel+1)/4 -1);
    var j = beginLabel

    var cur = j
    for(var i=j;i<=end;i++){
        var node = findNodeTo2(tree,i+"")
        node.label = cur+"/"+(cur+1)
        cur += 2
    }

    for(var i = 1;i<depth;i++){
        j = (j-1)/2
        end = (end-2)/2
        cur = j
        for(var k = j;k<=end;k++){
            var node = findNodeTo2(tree,k+"")
            node.label = cur+"/"+(cur+1)
            cur += 2
        }
    }
    var node = findNodeTo2(tree,1+"")
    node.label = 1+""
    treemap.run(tree)
}

function Quarter2(){
    newGame()
    for(var i = beginLabel;i<=endLabel;i++){
        var node = findNodeTo2(tree,i+"")
        node.label = ""
        node = node.p
        while(node.id!="0" && node.label!=""){
            node.label = ''
            node = node.p
        }
    }
    var node = findNodeTo2(tree,1+"")
    node.label = 1+""

    node = node.children[0]
    node.label = "3/4"

    for(var i = 3;i<depth;i++){// start form the third level
        var begin_ = Math.pow(2,i)-1
        var end_ = begin_ + Math.pow(2,i-2) -1
        for(var k = begin_; k<=end_;k++){
            var cur_node_ = findNodeTo2(tree, k+"")
            var P_cur_node_ = cur_node_.p
            var p_labels = P_cur_node_.label.split("/")
            var gap;
            if(k%2==1){
                gap = 1
            }else{
                gap = 2
            }
            var cur_lables =  (parseInt(p_labels[0])*2+gap)+"/"+(parseInt(p_labels[1])*2+gap)
            cur_node_.label = cur_lables
        }
        
    }
    treemap.run(tree)
}



function findNodeTo(node, label, handle = () => {}) {  //find the node with the appointed label
    if (node.label === label || node.label.split("/")[0] == label) {
        handle(node)
        return node
    } else if (node.children.length) {
        return findNodeTo(node.children[1], label, handle) || findNodeTo(node.children[0], label, handle)
    } else {
        return    //return undefined
    }
}

function findNodeTo2(node, id, handle = () => {}) {  //find the node with the appointed id
    if (node.id == id) {
        handle(node)
        return node
    } else if (node.children.length) {
        return findNodeTo2(node.children[1], id, handle) || findNodeTo2(node.children[0], id, handle)
    } else {
        return    //return undefined
    }
}


// when we start the Solve_mode, we need to change a global var state, then we just need to 
// play the red player. And the PC will player the role of blue player.
function Solve_mode(){
    Play_mode = "auto"
}

async function Auto_blue(){
    
    if(Play_mode != "auto"){
        return
    }
    var begin_auto = beginLabel
    var end_auto = endLabel 

    for(var i = (begin_auto+1)*0.25+begin_auto; i<=end_auto;i++){
        var node = findNodeTo2(tree, i+"")
        if(node.predictcolor){
            var obj = new Object()
            obj.data = node
            onrclick(obj)
            onrclick(obj)
        }
    }
}

async function sleep(time) {// 1秒
    await new Promise(r => setTimeout(r, time * 1000))
}



