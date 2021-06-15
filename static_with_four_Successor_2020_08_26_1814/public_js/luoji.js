const colorMap = {
    normal: '#6699FF',  // this color means the normal node in the circle
    red_process: '#e14089',  //this color means the node is just selected by the red player
    red_process2: '#8c0442',  //this color means the node is a red node and it is chosen by blue player,then becomes dark red 
    blue_end: '#9966FF',      //this color means that the purple node where the blue player's stragety to solve one red node
    red_end: 'lightgreen', //this color means the green node
    predictcolor: '#048774'
}


function getColor(d) {
    if (d.data.chosen) return colorMap.red_process2
    if (d.data.red_end) {
        return colorMap.red_end
    } else if (d.data.firstStage) {
        return colorMap.red_process
    } else if (d.data.blue) {
        return colorMap.blue_end
    } else if (d.data.predictcolor) {
        return colorMap.predictcolor;
    } else if (d.data.normal) {
        return colorMap.normal;
    }
}


const tree = {
    id: 0,
    label: '0',
    children: [],
    color: colorMap.未选择,
    isLeaf: false,
    // dummy: new Set(),
}

const cache = {
    0: [tree]
}

let depth
//represent the range of the leaves range
let beginLabel = 0;
let endLabel;

let beginLabel_rand = 0;
let endLabel_rand;

let Recording = []; //This is used to record every step

// let red_example = [63,64,65,67,68,69,71,72,73,79,80,81,83,84,85,87,88,89,95,96,97,99,100,101,103,104,105]
let red_example;

let red_example_4=[15, 16, 17, 19,20,21, 23,24, 25]

let red_example_5=[31,32,33,34,35,36,39,40,41,42,43,47,48,49,50]

let red_example_6=[63,64,65,67,68,69,71,72,73,79,80,81,83,84,85,87,88,89,95,96,97,99,100,101,103,104,105]

let red_example_7=[127,128,129,130,131,132,135,136,137,138,139,140,143,144,145,146,147,148,159,160,161,162,163,164,167,168,169,170,171,172,175,176,177,178,179,180,191,192,193,194,195,196,199,200,201,202,203,204,207,208,209,210,211,212] 

let red_example_8=[255, 256, 257, 259, 260, 261, 263, 264, 265, 271, 272, 273, 275, 276, 277, 279, 280, 281, 287, 288, 289, 291, 292, 293, 295, 296, 297, 319, 320, 321, 323, 324, 325, 327, 328, 329, 335, 336, 337, 339, 340, 341, 343, 344, 345, 351, 352, 353, 355, 356, 357, 359, 360, 361, 383, 384, 385, 387, 388, 389, 391, 392, 393, 399, 400, 401, 403, 404, 405, 407, 408, 409, 415, 416, 417, 419, 420, 421, 423, 424, 425]


let redList = []
let tmpList = []

let Max_Choice_Num = 0  // this is a constraint for Red player
//const Max_Choice_Num = 27  // this is a constraint for Red player
let cur_red_choice_num = 0  //Indicates how many nodes are selected by the red player at current

let redNowLabel = ''

let gameBegin = 0 //represent that the game begins

var count = 1
var id_count = 1
let isDoubleLabel = label => {
    return /\d+\/\d+/g.test(label)
}
function error(msg) {
    alert(msg || 'Blue Error！！')
}


//to inital some important variables related with depth
function set_Variable(){
	//please don not change the sequence of the script in html file or add(reove) script in html file.
    var loadUrl = document.getElementsByTagName("script")[4].getAttribute("src");
    // debug
    // console.log("loadUrl:"+loadUrl)
    depth = loadUrl.split('=')[1]
    //debug
    console.log('get you depth:'+depth)

    beginLabel_rand = Math.pow(2,depth-1)-1;
    endLabel_rand = beginLabel_rand*2;
    for(let i=1;i<=depth-1;i++){
        beginLabel = beginLabel*4+1;
    }
    endLabel = 4 * beginLabel;
	
	if(depth-1 == 4){
		red_example = red_example_4
	}else if(depth-1 == 5){
		red_example = red_example_5
	}else if(depth-1 == 6){
		red_example = red_example_6
	}else if(depth-1 == 7){
		red_example = red_example_7
	}else if(depth-1 == 8){
		red_example = red_example_8
	}
    
}

function label_for_quadtree(c){
    if(c.label != ""){
        return true
    }else{
        return false
    }
}

function construct_luoji(depth){
	for (let i = 0; i < depth - 1; i++) {
		cache[i + 1] = []
		for (let c of cache[i]) {
			let c1 = {
                id: id_count++,
				label: label_for_quadtree(c)==true? count++ +"":"",
				children: [],
				isLeaf: i === depth - 2,
				p: c,
				normal: true,
				firstStage: false,
				chosen: false,
				red_end: false,
				predictcolor: false,
				blue: false,
			}
			let c2 = {
                id: id_count++,
				label: label_for_quadtree(c)==true? count++ +"":"",
				children: [],
				isLeaf: i === depth - 2,
				p: c,
				normal: true,
				firstStage: false,
				chosen: false,
				red_end: false,
				predictcolor: false,
				blue: false,
			}
			let c3 = {
                id: id_count++,
				label:'',
				children: [],
				isLeaf: i === depth - 2,
				p: c,
				normal: true,
				firstStage: false,
				chosen: false,
				red_end: false,
				predictcolor: false,
				blue: false,
			}
			let c4 = {
                id: id_count++,
				label:'',
				children: [],
				isLeaf: i === depth - 2,
				p: c,
				normal: true,
				firstStage: false,
				chosen: false,
				red_end: false,
				predictcolor: false,
				blue: false,
			}
			if (i === depth - 2) {
				c1.size = i
				c2.size = i
				c3.size = i
				c4.size = i
			}
			c.children = [c1, c2, c3, c4]
			cache[i + 1].push(c1, c2, c3, c4)
		}
	}
}

function checkNodeCanClick(d) { //check for blue player
    if (d.data.red_end) return false
    if (d.data.blue) return false
    if (d.data.firstStage) return false
    if (d.data.chosen) return false
    return true
}

const single = {  //single label of red player suitation (leaf node)
    check(Blue_ID, Red_ID) {   //check the strategy of blue player
        let blueNode = findNodeTo_ID(tree, Blue_ID)
        let redNode = findNodeTo_ID(tree, Red_ID)
        while (blueNode != redNode) {
            let _r_label = redNode.label
            let _b_label = blueNode.label
            if (_b_label.length == 1 && _b_label != _r_label) {
                // error()
                console.log("_b_label:" + _b_label)
                console.log("_r_label:" + _r_label)
                return
            }
            blueNode = blueNode.p
            redNode = redNode.p
        }
        return true
    },
    handle(Blue_ID, Red_ID) {   //change the corresponding color and label
        let blueNode = findNodeTo_ID(tree, Blue_ID)
        let redNode = findNodeTo_ID(tree, Red_ID)
        while (blueNode !== redNode) {
            if (blueNode.label.length == 0) {
                blueNode.label = redNode.label
                tmpLayer++
                blueNode.blue = true
                blueNode.firstStage = false
                blueNode.red_end = false
                blueNode.chosen = false
                blueNode.normal = false
                blueNode.predictcolor = false
                blueNode = blueNode.p
                redNode = redNode.p
            } else {
                break
            }
        }
    }
}


function onlclick(d) {   //left click  for  red player

    var slider = document.getElementById("myRange");
    Max_Choice_Num = Math.floor(Math.pow(2, depth - 1) * slider.value / 100)

    if (cur_red_choice_num >= Max_Choice_Num) {
        return
    }
    gameBegin = 1
    if (FLAGPlayer == 1) { //It means that the red side has exhausted his options
        return
    }
    if (d.data.label == "") return   //红方只可以选择有标签的叶子节点
    if (d.data.firstStage) return   //Let's see if the red side has chosen the previous option
    
    cur_red_choice_num += 1   //Represents the actual number of choices of the Red side

    //这里是红色节点，所用label查找
    findNodeTo_ID(tree, d.data.id, node => {
        node.firstStage = true
        node.red_end = false
        node.chosen = false
        node.blue = false
        node.normal = false
        node.predictcolor = false
        Recording.push("r:" + d.data.id) // recording the process
        console.log(Recording)
    })

    this.run(tree)
    if (cur_red_choice_num >= Max_Choice_Num) {
        FLAGPlayer = 1  //It's Blue's turn
    }
}

function Blue_Step_1(d) {  //This is the first step of the blue side. Click a red node.
    console.log("Blue_Step_1 begins")
    
    if (cc == 1) {
        console.log("degub info :cc in function blue_step_1 should be 0")
        return  //t indicates that there is still an unresolved node. You need to solve it first.
    }

    console.log("FLAGPlayer:"+FLAGPlayer)
    console.log("d.data.firstStage:"+d.data.firstStage)
    if (FLAGPlayer == 1 && d.data.firstStage) {//First of all, this has to be the round of the blue player, and then the round of clicking the red node
        redNowID = d.data.id
        findNodeTo_ID(tree, redNowID, node => {
            node.chosen = true
            node.firstStage = false
            node.red_end = false
            node.blue = false
            node.normal = false
        })
        cc = 1
        //Light up all legitimate nodes
        for (var i = beginLabel; i < endLabel + 1; i++) {
            var ID = "" + i;  //change the i to a string
            findNodeTo_ID(tree, ID, node => {
                if (node.normal && node.label=="") {
                    console.log("checking id:"+node.id)
                    if (single.check(ID, redNowID)) {
                        node.predictcolor = true
                        node.normal = false
                    }
                }
            })
        }

        Recording.push("b:r:" + d.data.id);
        console.log(Recording)
    }

    console.log("Blue_Step_1 ends")
}

function Blue_Step_2(d) {   // this is blue player's turn
    console.log("Blue_Step_2 begins")
    if (cc == 0) {
        console.log("degub info :cc in function blue_step_2 should be 1")
        return   //Indicates that blue player has not selected a valid red node
    }

    if(!d.data.predictcolor) return

    findNodeTo_ID(tree, redNowID, node => {
        node.chosen = false
        node.firstStage = false
        node.red_end = true
        node.blue = false
        node.normal = false
    })

    findNodeTo_ID(tree, d.data.id, node => {
        node.blue = true
        node.chosen = false
        node.firstStage = false
        node.red_end = false
        node.normal = false
    })

    Leaf_go_Back_to_Normal();

    tmpLayer = 0
    single.handle(d.data.id, redNowID)
    var tmp = Recording.pop();
    tmp += ":b:" + d.data.id + ":stop-" + tmpLayer;
    Recording.push(tmp);
    console.log(Recording);
    cc = 0

    console.log("Blue_Step_2 ends")
}

function onrclick(d) {
    if (cc == 0) {
        Blue_Step_1(d)
    }
    if (cc == 1) {
        Blue_Step_2(d)
    }
    this.run(tree)
}

//find the node in the tree according the label
function findNodeTo_label(node, label, handle = () => { }) {  //find the node with the appointed label
    if (node.label == label) {
        handle(node)
        return node
    } else if (node.children.length) {
        return findNodeTo_label(node.children[1], label, handle) || findNodeTo_label(node.children[0], label, handle) ||findNodeTo_label(node.children[2], label, handle) || findNodeTo_label(node.children[3], label, handle)
    } else {
        return    //return undefined
    }
}


function findNodeTo_ID(node, ID, handle = () => { }) {  //find the node with the appointed label
    if (node.id == ID) {
        handle(node)
        return node
    } else if (node.children.length) {
        return findNodeTo_ID(node.children[0], ID, handle) || findNodeTo_ID(node.children[1], ID, handle)||findNodeTo_ID(node.children[2], ID, handle) || findNodeTo_ID(node.children[3], ID, handle)
    } else {
        return    //return undefined
    }
}

// UndoFunction
function UndoFunction(d) {
    if (Recording.length == 0) return
    console.log('click undo button')
    var tmp = Recording.pop()
    console.log(tmp)
    var tmps = tmp.split(":");
    console.log("tmps len:" + tmps.length)

    //example: "r:65"
    if (tmps.length == 2) { //This representation is one step of the Red player. We just need to change its color to normal
        findNodeTo_ID(tree, tmps[1], node => {
            node.firstStage = false
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = true
        })

        FLAGPlayer = 0;
        cc = 0
        cur_red_choice_num -= 1  // As the red side retreats one step, it needs to reduce one
        filTxt()
        console.log("cur_red_choice_num:" + cur_red_choice_num)
        console.log(Recording)
        console.log("undo success:" + tmps)
    } else if (tmps.length == 3) {  //example     b:r:71
        findNodeTo_ID(tree, tmps[2], node => {
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = false
        })
        //Eliminate legitimate nodes's color
        Leaf_go_Back_to_Normal();
        cc = 0
        FLAGPlayer = 1;
        console.log(Recording)
        console.log('undo success :' + tmps)

    } else if (tmps.length == 6) {// example   b:r:71:b:76:stop-3
        //find the red node and turn it to firstStage state
        findNodeTo_ID(tree, tmps[2], node => {
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = false
        })

        //find the blue node and turn it to normal
        findNodeTo_ID(tree, tmps[4], node => {
            node.firstStage = false
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = true
            node.label = node.label.split('/')[0]
            tmpOps = 1
            while (tmpOps < parseInt(tmps[5].split("-")[1])) {
                node = node.p
                node.firstStage = false
                node.red_end = false
                node.chosen = false
                node.blue = false
                node.predictcolor = false
                node.normal = true
                node.label = node.label.split('/')[0]
                tmpOps++
            }
        })

        cc = 0
        FLAGPlayer = 1
        console.log(Recording)
        console.log('undo success :' + tmps)
    } else {
        console.log("what happened?")
    }
    treemap.run(tree);
}


//help the red player to set all his options 
function Repeat() {

    //just copy the red choices for red player has chosen, and redisplay them again
    redList = []
    for (var i = 0; i < Recording.length; i++) {
        tmps = Recording[i].split(":");
        if (tmps.length == 2) {
            redList.push(parseInt(tmps[1]))
        } else {
            break
        }
    }

    Max_Choice_Num = redList.length

    count = 1
    id_count = 1
    construct_luoji(depth)
    // treemap.run(tree)
    FLAGPlayer = 0
    cur_red_choice_num = 0
    Recording = []
    gameBegin = 1
    for (var i = 0; i < redList.length; i++) {
        console.log(redList[i])
        //Find the corresponding red node according to redList[i], 
        //and set its color attribute and phase attribute
        findNodeTo_ID(tree, redList[i] + "", node => {    // the label should be a string, so I make redList[i]+""
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = false
            node.predictcolor = false
        })
        Recording.push("r:" + redList[i]) // recording the process
        cur_red_choice_num += 1   // Represents the actual number of choices in the Red player
    }
    // treemap.run(tree)
    console.log(Recording)
    if (cur_red_choice_num == Max_Choice_Num) {
        FLAGPlayer = 1  // It's Blue's turn
    }
    cc = 0
    treemap.run(tree)
}

//change all the predicting legit to normal
function Leaf_go_Back_to_Normal() {
    //clear all the legit positions' coloring
    for (var i = beginLabel; i < endLabel + 1; i++) {
        var ID = "" + i; //change the i to a string
        findNodeTo_ID(tree, ID, node => {
            if (node.predictcolor) { // && !node.firstStage
                node.blue = false
                node.firstStage = false
                node.chosen = false
                node.red_end = false
                node.normal = true
                node.predictcolor = false
            }
        })
    }
}

//show the notice sentence
function filTxt() {
    var slider = document.getElementById("myRange");
    Max_Choice_Num = Math.floor(Math.pow(2, depth - 1) * slider.value / 100)
    leftNow = Max_Choice_Num - cur_red_choice_num
    if (leftNow > 1) {
        document.getElementById("NUM").innerHTML = leftNow + " picks remaining";
    } else if (leftNow == 1) {
        document.getElementById("NUM").innerHTML = leftNow + " pick remaining";
    } else {
        document.getElementById("NUM").innerHTML = "Move the red to legit positions";
    }
}

function newGame() {
    gameBegin = 0
    FLAGPlayer = 0
    cur_red_choice_num = 0
    Recording = []
    redList = []
    location.reload()
}


function Example() {
    id_count = 1
    count = 1
    construct_luoji(depth)
    treemap.run(tree)

    Max_Choice_Num = red_example.length
    FLAGPlayer = 0
    cur_red_choice_num = 0
    Recording = []
    cc = 0
    // gameBegin = 1
    for (var i = 0; i < red_example.length; i++) {
        console.log(red_example[i])
        //Find the corresponding red node according to redList[i], 
        //and set its color attribute and phase attribute
        findNodeTo_label(tree, red_example[i] + "", node => {    // the label should be a string, so I make redList[i]+""
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = false
            node.predictcolor = false
            Recording.push("r:" + node.id) // recording the process
        })
        
        cur_red_choice_num += 1   // Represents the actual number of choices in the Red player
    }

    console.log(Recording)
    if (cur_red_choice_num == Max_Choice_Num) {
        FLAGPlayer = 1  // It's Blue's turn
    }
    treemap.run(tree)
}

//
function Random() {
    //First, restore the tree to its original state

    count = 1
    id_count = 1

    construct_luoji(depth)
    treemap.run(tree)

    // tmpSet
    tmpSet = new Set()
    //Generate the corresponding number of nodes according to the set proportion
    var slider = document.getElementById("myRange");
    var proporation = slider.value / 100
    diff = (endLabel_rand - beginLabel_rand + 1)
    nums = Math.floor(proporation * diff)

    for (var i = 1; i <= nums; i++) {

        var label = random_P()

        while (tmpSet.has(label) || label > endLabel_rand || label < beginLabel_rand) {
            label = random_P()
        }
        // var label = Math.round(Math.random() * (endLabel - beginLabel)) + beginLabel
        tmpSet.add(label)
    }

    tmpList = []

    tmpSet.forEach(function (element, sameElement, set) {
        tmpList.push(element)
    })

    Max_Choice_Num = tmpList.length
    FLAGPlayer = 0
    cur_red_choice_num = 0
    Recording = []
    cc = 0
    // gameBegin = 1
    for (var i = 0; i < tmpList.length; i++) {
        console.log(tmpList[i])
        findNodeTo_label(tree, tmpList[i] + "", node => {    // the label should be a string, so I make redList[i]+""
            node.firstStage = true
            node.red_end = false
            node.chosen = false
            node.blue = false
            node.normal = false
            node.predictcolor = false
        })
        Recording.push("r:" + tmpList[i]) // recording the process
        cur_red_choice_num += 1   // Represents the actual number of choices in the Red player
    }
    treemap.run(tree)
    console.log(Recording)
    if (cur_red_choice_num == Max_Choice_Num) {
        FLAGPlayer = 1  // It's Blue's turn
    }
}

const treemap = new Tree(onlclick, onrclick)  //,UndoFunction,Repeat
treemap.run(tree)

window.onresize = () => {
    treemap.run(tree)
}




// key word to locate here:'change the distribution'

// if you want to try more distribution, you can just replace the randn_Normal function in random_P function with proper parameters
//   the following fuctions are different functions used for producing the leaf node
//   for more details, you can visit : 
//    https://github.com/d3/d3-random               https://observablehq.com/@d3/d3-random#normal

function random_P(){

    var min = beginLabel_rand
    var max = endLabel_rand

    console.log("beginLabel_rand:"+beginLabel_rand)

    leaf_node_label = ""
    leaf_node = ""
    time = 0 //防止卡死
    while( leaf_node_label=="" || leaf_node_label < beginLabel_rand || leaf_node_label > endLabel_rand || leaf_node==""  || leaf_node.red_end){
        console.log('producing')
        // leaf_node_label = Math.round(randn_Normal(min,max,1))   // method 1
        leaf_node_label = Math.round(random_logNormal(min,max))     // method 2 
        // leaf_node_label = Math.round(random_Exponential(min,max))   //method3
        console.log("leaf_node_label:"+leaf_node_label)
        leaf_node = findNodeTo_label(tree,leaf_node_label+'')
        time = time+1
        if(time>10){
            break;
        } 
    }
    return leaf_node_label+""
}

//normal distribution
function randn_Normal(min, max, skew) {
    /*Note:
    this funtion is like the normal distribution. but in this function, you can speicfy the range,
    and skew is neither mean nor standard  deviation. if skew == 1, the middle of the sampling will be the middle of the range,
    if skew > 1,  the middle of the sampling will be to the left.  otherwise, it will be to the right.
    you can get more information from here:  https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve 
     */
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 5.0 + 0.5;
    // num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_Normal(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

//d3.randomNormal(mu,sigma)()
function random_logNormal(min, max){
    // var num =  d3.randomUniform(min, max)();
    var num = d3.randomLogNormal(-1, 0.3)();
    if (num > 1 || num < 0) num = d3.randomNormal(-1, 0.3)(); 
    console.log("num:"+num)
    num  *= max -min;
    num += min;
    console.log("randomlogNormal:"+num)
    return num
}

//d3.randomExponential(lambda)()
function random_Exponential(min, max){
    var num = d3.randomExponential(5)();
    if (num > 1 || num < 0)  num = d3.randomExponential(5)(); 
    console.log("num:"+num)
    num *= (max - min);
    num += min;
    console.log("random_Exponential:"+num)
    return num
}
