window.addEventListener('mousemove', getMousePos, false)
const canvas = document.getElementById("game-canvas")

const ctx = canvas.getContext("2d")

let mousePosition = {x:0, y:0}

//===BOX AND CANVAS SIZE VARIABLES===

//this would be square root of the height and width
var box_length = 50;
var box_height = 50;

//please only do square numbers thanks i.e 360, 490
var canvas_height = 360
var canvas_width = 360

//amount of margins = number per row/column + 1
//length/height of canvas - length/height of all boxes / amount of margins
var num_boxes_y = 5
var num_boxes_x = 5

var box_margin_y = (canvas_height - (box_height * (num_boxes_y + 1))) / (num_boxes_y + 1)
console.log(box_margin_y)
var box_margin_x = (canvas_width - (box_length * (num_boxes_x + 1))) / (num_boxes_x + 1)

canvas.height = canvas_height
canvas.width = canvas_width

//=====TIME VARIABLES IN SECONDS====
var memorize_time = 5
var click_time = 5

//time is measured in 1/100 of a second, but increments by 10 
//so conversions from time to seconds is /100
//i.e when time = 300, thats 3 seconds
//when time = 2000, thats 20 seconds

//===TIMER COLORS===
//represents the color of the progress bar from full going down
var memorize_phase_inner = "aqua"
//represents the color of the progress bar's background being revealed
var memorize_phase_outer = "green"

//represents the background color of the progress bar while clicking
var clicking_phase_outer = "red"



//color of the timer (number) while negative (memorizing phase)
var timer_text_memorizing = "red"

//color of the timer (number) while positive (clicking phase)
var timer_text_clicking = "green"

//color of timer (number) when failure
var timer_text_failure = "red"


//==RANDOM BULLSHIT STARTS HERE==

const boxes = []
var started = false;
var stopped = false;
var time = 0
var timerId = 0;

var failure = false;
var box_count = 1
var current_box = 1
var number_array = new Array(num_boxes_x * num_boxes_y)
initialize_numbers()
shuffle_boxes()

console.log(boxes)
game()

async function game(){
    let covered_box = getOverlappedBox(boxes);
    let box_number = covered_box?covered_box.number:0;
    boxes.forEach(box => box.draw(ctx, false, false))

    document.getElementById("inner-bar").style.width = ((current_box - 1) / box_count * 100) + "%"

    if(started){
        if(!failure){
            document.getElementById("start").style.visibility = "hidden"
        } else {
            document.getElementById("start").style.visibility = "visible"
        }

        //====this counts down time to 2 decimal points====
        //time/100 because time is 1/10 of a second, so /100 gives 
        // document.getElementById("timer").innerText = `${(time/100 - memorize_time).toFixed(2)}` 

        if(time / 100 >= memorize_time + click_time || failure){
            canvas.removeEventListener("click", canvasClick, false)
            for(let i = 1; i <= box_count; i++){
                boxes.find(box => box.number == i).draw(ctx, false, true)
            }
            clearInterval(timerId)
            document.getElementById("start").innerText = `Restart`
            // document.getElementById("timer").style.color = timer_text_failure
            document.getElementById("start").style.visibility = "visible"
            failure = true
            console.log("failure")
        } else if(time/100 < memorize_time){

            //changing the TIMER progress bar for memorizing time
            document.getElementById("timer-inner").style.width = 100 - ((time/100)/memorize_time * 100) + "%"

            if(current_box > 1 && box_number == 1){
                time = memorize_time * 100
            }
            canvas.addEventListener("click", canvasClick, false)
            boxes.forEach(box => box.draw(ctx, box.number == box_number, false))

            for(let i = 1; i < box_count + 1; i++){
                let box = boxes.find(b => b.number == i)
                box.draw(ctx, box.number == box_number, true)
            }

            // document.getElementById("timer").style.color = timer_text_memorizing
        } else {
            // document.getElementById("timer").style.color = timer_text_clicking

            document.getElementById("timer-inner").style.backgroundColor = memorize_phase_outer
            document.getElementById("timer-inner").style.width = 100 - (((time/100)-memorize_time)/click_time * 100) + "%"
            document.getElementById("timer-outer").style.backgroundColor = clicking_phase_outer

            boxes.forEach(box => box.draw(ctx, box.number == box_number, false))

            for(let i = 1; i <= current_box - 1; i++){
                boxes.find(box => box.number == i).draw(ctx, i, true)
            }

            if(current_box > box_count){
                canvas.removeEventListener("click", canvasClick, false)
                await sleep(2000) //waits 2 seconds
                console.log("next round")
                box_count++
                current_box = 1
                document.getElementById("score").innerText = `Round: ${box_count}/${num_boxes_x * num_boxes_y}`
                shuffle_numbers()
                shuffle_boxes()
                startTime()
                console.log("Start")
                console.log(number_array)
            }
        }
    } else {
        boxes.forEach(box => box.draw(ctx, box.number == box_number, false))
    }

    requestAnimationFrame(game)
}

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    mousePosition.x = evt.clientX - rect.left;
    mousePosition.y = evt.clientY - rect.top
  }

function canvasClick(){
    const selected_box = getOverlappedBox(boxes)
    if(checkMouseOverlap(selected_box)){
        let num = selected_box.number
        console.log(num)
        if(num == current_box){
            current_box++
        } else if(num > current_box && time / 100 > memorize_time){
            failure = true
        }
    }
    console.log("Click")
}
function initialize_numbers(){
    for(let i = 0; i < number_array.length; i++){
        let rand = Math.floor((Math.random() * number_array.length) + 1)
        while(number_array.find(el => el == rand)){
            rand = Math.floor((Math.random() * number_array.length) + 1)
        }
            
        number_array[i] = rand
    }
}

function shuffle_numbers() {
    for (var i = number_array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = number_array[i];
        number_array[i] = number_array[j];
        number_array[j] = temp;
    }
}

function shuffle_boxes(){
    for(let i = 1; i < num_boxes_x + 1; i++){
        for(let j = 1; j < num_boxes_y + 1; j++){
            boxes[(i-1) * num_boxes_x + (j-1)] = new Box((box_length + box_margin_x) * i, (box_height + box_margin_y) * j, box_length, box_height, number_array[(i-1) * num_boxes_x + (j-1)])
        }
    }
}

function checkMouseOverlap(box){
    if(box){
        if(mousePosition.x > box.points[0].x && mousePosition.x < box.points[2].x &&
            mousePosition.y > box.points[0].y && mousePosition.y < box.points[2].y){
                return true
        }
    }
    return false
}

function getOverlappedBox(boxes){
    let covered_box;
    boxes.forEach(box => checkMouseOverlap(box)?covered_box=box: null)
    return covered_box
}

function getBoxNumber(box){
    return box.number
}

function startTime(){
    endTime()
    console.log('start')
    document.getElementById("timer-outer").style.backgroundColor = memorize_phase_outer
    document.getElementById("timer-inner").style.backgroundColor = memorize_phase_inner
    if(failure){
        box_count = 1;
        current_box = 1;
        document.getElementById("score").innerText = `Round: ${box_count}/25` //add to top
        shuffle_numbers()
        shuffle_boxes()
        failure = !failure
    }
    if(!started){
        timerId = setInterval((function(){
            time++
        }), 10)
    }
    started = true
    stopped = false
}

function endTime(){
    console.log('end')
    clearInterval(timerId)
    stopped = true
    started = false
    time = 0
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }