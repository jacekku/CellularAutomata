let rule=90
let ruleSet=""
let complimentary=false
let generationNumber=0
let generations
let timing=1
let timer=null
let repeating=false
let cnv
let populateSettings={
  leftCorner:false, 
  rightCorner:false, 
  center:true, 
  randomly:false
  }
let buttons={
  step:
document.querySelector(".step"), 
  repeat:
document.querySelector(".repeat"), 
  reset:
document.querySelector(".reset"), 
  complimentary:
document.querySelector(".complimentaryRule"), 
  populate:
document.querySelector(".populate"), 
  populateSettings:
document.querySelectorAll(".populateSettings"),
  rule:
document.querySelector(".rule")
  }
let texts={
  timing:
document.querySelector(".timing"), 
  generation:
document.querySelector(".generation")
  }
//TODO convert to 8bit characters 
//TODO store state of automata using characters instead of strings of 1 & 0 s 
//				like QANvaSJJe  instead of 1000101010100101010 thtat is tupids
function setup() {
  cnv=createCanvas(512, 1024,P2D)
  cnv.parent("holder")
  pixelDensity(1)
  noStroke()
  generations=fillGenerations(generations)
  bindButtons()
  updateUI()
  changeRule()
  populate(generations)
}
function generateAllGenerations(generations){
	while(fullNextGeneration(generations,generationNumber))generationNumber++
	return true
}
function generationToString(generation){
	let output=""
	for(iterator=0;iterator<512;iterator+=8){
		let miniOutput=""
		for(mI=0;mI<8;mI++){
			miniOutput+=generation[mI+iterator]
		}
		output+=String.fromCharCode(int(miniOutput,2))
	}
	return output
}

function reset() {
  clearInterval(timer)
    generations=fillGenerations(generations)
    timing=texts.timing.value
    rule=buttons.rule.value
    complimentary=buttons.complimentary.checked
    generationNumber=0
	background(255)
    updateUI()
	populate(generations)
	changeRule()
	repeat()
    redraw()
}
function updateUI() {
  texts.timing.value=timing
    buttons.rule.value=rule
    buttons.complimentary.checked=complimentary
    texts.generation.innerHTML="Generation: "+generationNumber
    buttons.populateSettings.forEach(e=>e.checked=populateSettings[e.classList[1]])
	//determineRepeatButtonState(buttons.repeat)
}
function bindButtons() {
  buttons.step.addEventListener("click", step)
  buttons.repeat.addEventListener("click", flipRepeat)
  buttons.reset.addEventListener("click", reset)
  buttons.rule.addEventListener("change", changeRule)
  buttons.populate.addEventListener("click", e=>populate(generations))
  buttons.populateSettings.forEach(element=>element.addEventListener("change",event=>populateSettings[event.target.classList[1]]=event.target.checked))
}
function determineRepeatButtonState(button){
	if(repeating && button.classList.contains("btn-default")){
		button.classList.remove("btn-default")
		button.classList.add("btn-primary")
		}
	else{
		button.classList.remove("btn-primary")
		button.classList.add("btn-default")
	}
	return button
}

function step() {
  if (fullNextGeneration(generations, generationNumber)) {
    generationNumber+=1
  } else {
    clearInterval(timer)
  }
changeRule()
updateUI()
}
function stopRepeat() {
	repeating=false
	clearInterval(timer)
}
function flipRepeat(){
	repeating=!repeating
	determineRepeatButtonState(buttons.repeat)
	repeat()
}
function repeat() {
	if (repeating) {
		timing=texts.timing.value
		timer=setInterval(step, timing)
  } else stopRepeat()
}


function fillGenerations(generations) {
  return Array.from( {length:height}, generation=>Array.from( {length:width},cell=>0))
}

function changeRule() { 
  rule=int(buttons.rule.value)
    ruleSet=changeRuleSet()
    ruleSet=stringToIntArray(ruleSet)
    complimentaryRule()
}
function changeRuleSet() {
  rule=int(rule)
  return rule.toString(2).padStart(8, "0");
}
function complimentaryRule() {
  complimentary=buttons.complimentary.checked
    if (!complimentary)return false
	console.log("",ruleSet.toString(),"\n",ruleSet.map(r=>r?0:1).toString())
    ruleSet=ruleSet.map(r=>r?0:1)
	
    return true
}
function stringToIntArray(string) {
  return string.split("").map(i=>int(i)).reverse()
}


function populate(generations) {
	if(generationNumber!=0)generationNumber=0
	if (populateSettings.leftCorner)populateLeftCorner(generations)
    if (populateSettings.rightCorner)populateRightCorner(generations)
    if (populateSettings.center)populateCenter(generations)
    if (populateSettings.randomly)populateRandomly(generations)
    drawGeneration(generations[generationNumber],generationNumber)
}
function populateLeftCorner(generations) {
  generations[0][0]=1
    return true
}
function populateRightCorner(generations) {
  generations[0][generations[0].length-1]=1
    return true
}
function populateCenter(generations) {
  generations[0][(generations[0].length/2)]=1
    return true
}
function populateRandomly(generations) {
  generations[0]=generations[0].map(i=>random(1)<0.1?1:0)
    return true
}
function fullNextGeneration(generations, generationNumber) {
  if (generationNumber>=generations.length-1)return false
    drawGeneration(generations[generationNumber], generationNumber)
	generationNumber+=1
    generations[generationNumber]=computeNextGeneration(generations[generationNumber-1])
    return true
}




function computeNextGeneration(currentGeneration) {
	nextGenerationArray=[0]
    for (i=1; i<width-1; i+=1) {
		nextGenerationArray.push(computeCell(currentGeneration[i-1], currentGeneration[i], currentGeneration[i+1]))
	}
	nextGenerationArray.push(0)
	return nextGenerationArray
}
function computeCell(left, center, right) {
  value=left*(Math.pow(2, 2)) + center*(Math.pow(2, 1)) + right*(Math.pow(2, 0))
  
// if(value>0) console.log(left,center,right,value,ruleSet.toString(),"->",ruleSet[value])
  return ruleSet[value]
}

function drawGeneration(generation, generationIndex) {
  if (generationIndex>=generations.length-1)return false
    loadPixels()
    for (i=0; i<width; i++) {
    pixelIndex=width * generationIndex + i
      colorPixel(pixelIndex, color(!(generation[i])*255))
  }
  updatePixels()
    redraw()
    return true
}
function colorPixel(index, clr) {
  index=index*4
    pixels[index]=red(clr)
    pixels[index+1]=green(clr)
    pixels[index+2]=blue(clr)
    pixels[index+3]=alpha(clr)
}
function colorPixelLoad(index, clr) {
  loadPixels()
    index=index*4
    pixels[index]=red(clr)
    pixels[index+1]=green(clr)
    pixels[index+2]=blue(clr)
    pixels[index+3]=alpha(clr)
    updatePixels()
}
