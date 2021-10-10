


let htmlCanvas = document.querySelector("#html-input-canvas")
let cssCanvas = document.querySelector("#css-input-canvas")
let jsCanvas = document.querySelector("#js-input-canvas")


let hC = htmlCanvas.getContext("2d")
let cC = cssCanvas.getContext("2d")
let jC = jsCanvas.getContext("2d")
let htmlCurrentScroll = 0;
let htmlScreeningCords = [];
let htmlStrings = [];
let htmlFocus = {status: false, index: 0};

function generateCoords() {
    for (let i = 1; i < 21; i++) {
        htmlScreeningCords.push([25*i-9 - 10, 25*i + 10])
        htmlStrings.push("")
    }
}
generateCoords()
renderHtmlCanvas(htmlScreeningCords[0])
window.addEventListener("resize", renderHtmlCanvas, htmlScreeningCords[htmlFocus.index])

function resetHtmlCanvas() {
    let {width, height} = htmlCanvas.getClientRects()[0]
    htmlCanvas.width = width;
    htmlCanvas.height = height;
}
function renderHtmlCanvas(focusCords) {
    resetHtmlCanvas()
    hC.font = "16px Monospace, sans-serif"

    for (let i = 1; i < 20; i++) {
        hC.fillStyle = "#fff"
        if (i < 10) {
            //  code line numbers
            hC.fillText(i, 20, htmlScreeningCords[i][0] + htmlCurrentScroll)
            //  renders entered text
            hC.fillText(htmlStrings[i-1], 40, htmlScreeningCords[i][0] +  htmlCurrentScroll)
        }else {
            //  code line numbers
            hC.fillText(i, 10, htmlScreeningCords[i][0] + htmlCurrentScroll)
            //  renders entered text
            hC.fillText(htmlStrings[i-1], 40, htmlScreeningCords[i][0] +  htmlCurrentScroll)
        }
    }
    if (htmlFocus.status) {
        hC.fillStyle = "#ffffff15"
        hC.fillRect(5, focusCords[0]+htmlCurrentScroll + 8, htmlCanvas.width - 10, 25)
    };
}

//  focus on a certain line
htmlCanvas.addEventListener('click', function(event) {
    let coords = htmlScreeningCords.find(value => 
        value[0] < event.layerY+Math.abs(htmlCurrentScroll) &&
        value[1] > event.layerY+Math.abs(htmlCurrentScroll)) || 0;
    htmlFocus.index = htmlScreeningCords.indexOf(coords)
    htmlFocus.status = true;
    renderHtmlCanvas(coords)
})

//  canvas scrolling
htmlCanvas.addEventListener('wheel', function (event) {
    // console.log(event)
    htmlCurrentScroll -= event.deltaY*0.35
    // console.log(htmlScreeningCords.slice(-2)[0][0])
    // if (htmlScreeningCords.slice(-2)[0][1] > Math.abs(htmlCurrentScroll)) {};
    if (htmlCurrentScroll > 0) htmlCurrentScroll = 0;
    renderHtmlCanvas(htmlScreeningCords[htmlFocus.index])
})

//  typing
document.addEventListener("keydown", function(event) {
    if (htmlFocus.status) {
        event.preventDefault()
        if (/^[\w\d\[\]\(\)\{\} \\\*\-\+\=  \/\?\.\,\!\|'"\&\^\%\;\:]$/i.test(event.key)){
            htmlStrings[htmlFocus.index] += event.key
        }
        // htmlStrings[htmlFocus.index] += event.key
        renderHtmlCanvas(htmlScreeningCords[htmlFocus.index])
    }
})

// to loose focus from canvases
document.addEventListener('click', function(event) {
    if (event.target != htmlCanvas) {
        htmlFocus.status = false
        renderHtmlCanvas()
    }
})