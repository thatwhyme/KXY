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
let tmpLayer = 0

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
    handle(bluelabel_id, redlabel) {
        let blueNode = findNodeTo2(tree, bluelabel_id)
        let redNode = parseInt(redlabel)
        while (!blueNode.label.includes(redNode+"")) {
            tmpLayer++
            if(blueNode.label == ""){
                blueNode.label += redNode+""
            }else{
                blueNode.label += '/' + redNode
            }

            blueNode = blueNode.p

            if(redNode%2==0){
                redNode = (redNode-2)/2
            }else{
                redNode = (redNode-1)/2
            }
        }
    }
}

//思路： 这里红方点击之后，不需要为蓝方进行任何计算，蓝方只需要遍历所有的叶子结点，
//然后统计放置在某个位置之后，所造成的新增的冲突的个数，然后选中{1:冲突最少 2:prefix最长  3：最左侧的} 这个如果程序暂时没有实现，那么就提供一个人工进行选则的方式。
async function onlclick(d) {   //left click  for  red player

    console.log("next:"+next)
    if (next !== 'red') return
    if (d.data.red_end) return
    redNowLabel = d.data.label
    redNowLabel_id = d.data.id
    //red player chooses a empty leaf
    Recording.push("r:"+"id:"+redNowLabel_id)

    if(redNowLabel=="") {
        cur_red_choice_num++
        fill_Proportion()
        treemap.run(tree)
        return
    }
    FLAGPlayer = 1

    findNodeTo2(tree, redNowLabel_id, node => {
        node.red_process = true
    })
    cur_red_choice_num += 1
    fill_Proportion()
    next = 'blue'
    this.run(tree)

    onrclick_auto()
}

async function onrclick(d) {   //right click for blue player
    // console.log("next:"+next)
    // if (next !== 'blue') return
    // let tmp_redNowLabels = redNowLabel.split("/")
    // let length = tmp_redNowLabels.length
    // if (length>1) {
    //     if(blueSelectLabel.length<length-1) {
    //         tmpLayer = 0
    //         single.handle(d.data.id, tmp_redNowLabels[blueSelectLabel.length])
    //         findNodeTo2(tree, d.data.id, node => {
    //             Recording.push("b:"+"id:"+d.data.id+":"+tmpLayer)
    //         })
    //         blueSelectLabel.push(1)
    //     }else{
    //         tmpLayer = 0
    //         single.handle(d.data.id, tmp_redNowLabels[length-1])

    //         findNodeTo2(tree, redNowLabel_id, node => {
    //             node.red_end = true
    //             node.red_process = false
    //         })
    //         findNodeTo2(tree, d.data.id, node => {
    //             Recording.push("b:"+"id:"+d.data.id+":"+tmpLayer)
    //         })
    //         blueSelectLabel = []
    //         next = 'red'
    //         redNowLabel = ""
    //         FLAGPlayer = 0
    //     }
    // } else if(length==1) {//表明是单标签
    //     tmpLayer = 0
    //     single.handle(d.data.id, redNowLabel)
    //     findNodeTo2(tree, redNowLabel_id, node => {
    //         node.red_end = true
    //         node.red_process = false
    //     })
    //     findNodeTo2(tree, d.data.id, node => {
    //         Recording.push("b:"+"id:"+d.data.id+":"+tmpLayer)
    //     })
    //     next = 'red'
    //     redNowLabel = ""
    //     FLAGPlayer = 0
    // }
    // treemap.run(tree)
}

async function onrclick_auto() {   //right click for blue player
    console.log("auto next:"+next)
    if (next !== 'blue') return
    let tmp_redNowLabels = redNowLabel.split("/")
    let length = tmp_redNowLabels.length
    if(length>3){
        console.log("error")
        return
    }
    if(length>1){
        while(blueSelectLabel.length<length) {
            tmpLayer = 0
            var target = -1
            for(var i = beginLabel;i<=endLabel;i++){
                var node = findNodeTo2(tree,i+"")
                // console.log("test point:"+(node.label.split("/").length>=3))
                // ||node.label.split("/").length>=3&&node.label.indexOf(tmp_redNowLabels[blueSelectLabel.length])
                if(node.red_process || node.red_end ){
                    continue
                }
                if(ponrclick_autocheck(i,parseInt(tmp_redNowLabels[blueSelectLabel.length]))){
                    target = i
                    break
                }
            }
            console.log("the target:"+target)
            if(target==-1){
                alert("the coder lose")
                return
            }
            single.handle(target, tmp_redNowLabels[blueSelectLabel.length])
            
            Recording.push("b:"+"id:"+target+":"+tmpLayer)
            blueSelectLabel.push(1)
        }
       
        findNodeTo2(tree, redNowLabel_id, node => {
            node.red_end = true
            node.red_process = false
        })
       
        blueSelectLabel = []
        next = 'red'
        redNowLabel = ""
        FLAGPlayer = 0
        tmpLayer = 0
    } else if(length==1) {//表明是单标签
        tmpLayer = 0

        var target = -1
        for(var i = beginLabel;i<=endLabel;i++){
            
            var node = findNodeTo2(tree,i+"")
            // ||node.label.split("/").length>=3&&node.label.indexOf(tmp_redNowLabels[blueSelectLabel.length])
            if(node.red_process || node.red_end){
                continue
            }
            
            if(ponrclick_autocheck(i,redNowLabel)){
                target = i
                break
            }
        }
        console.log("the target:"+target)
        if(target==-1){
            alert("the coder lose")
            return
        }
        single.handle(target, redNowLabel)
        findNodeTo2(tree, redNowLabel_id, node => {
            node.red_end = true
            node.red_process = false
        })
        // findNodeTo2(tree, target, node => {
        //     Recording.push("b:"+"id:"+target+":"+tmpLayer)
        // })
        Recording.push("b:"+"id:"+target+":"+tmpLayer)
        next = 'red'
        redNowLabel = ""
        FLAGPlayer = 0
        tmpLayer = 0
    }
    treemap.run(tree)
}

//这个函数是被上方的函数调用，用于确定是否是一个合法的leftmost的code.
function ponrclick_autocheck(id,source){
    var node = findNodeTo2(tree,id+"") 
    // console.log("start:"+node.id)
    var layer = depth-1
    while(layer>0){
        // console.log("spy num:"+(node.label.split("/").length>3))
        // console.log("spy label:"+node.label)
        if(node.label.split("/").length>=3 && node.label.indexOf(source+"")==-1){
            // console.log("hahaha")
            return false
        }  
        // console.log("layer:"+layer)
        node = node.p
        // (x%2 ==0) ?"偶数":"奇数"
        source = (source%2 ==0) ? (source-2)/2:(source-1)/2
        layer-=1
    }
    return true
}

function UndoFunction(){
    let str = Recording.pop()
    if(null==str){
        return
    }
    // alert(str)
    let strs = str.split(":")
    // alert(strs)
    let len = strs.length
    if(len==3){//re back for red
        findNodeTo2(tree, strs[2], node => {
            node.red_end = false
            node.red_process = false
            node.normal = true
        })
        cur_red_choice_num -= 1
        fill_Proportion()
        redNowLabel = ""
        FLAGPlayer = 0
        next = "red"
    }else if(len==4){//re back for blue
        tmp = 0
        stopP = parseInt(strs[3])
        base = findNodeTo2(tree, strs[2])
        while(tmp<stopP){
            // base.label =
            labs = base.label.split("/")
            if(labs.length==1){
                base.label = ""
            }else if(labs.length==2) {
                base.label = base.label.split("/")[0]
            }else if(labs.length>2){
                base.label = labs.slice(0,-1).join("/");
            }
            base = base.p
            tmp++
        }
    }
    treemap.run(tree)

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

function Half_(){
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
    var end = (beginLabel+(endLabel- beginLabel+1)/2 -1);
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
