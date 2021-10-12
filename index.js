


let htmlCanvas = document.querySelector("#html-input-canvas")
let cssCanvas = document.querySelector("#css-input-canvas")
let jsCanvas = document.querySelector("#js-input-canvas")


let hC = htmlCanvas.getContext("2d")
let cC = cssCanvas.getContext("2d")
let jC = jsCanvas.getContext("2d")
let htmlCurrentScroll = 0;
let htmlScreeningCords = [[25-9 - 10, 25 + 10]];
let htmlStrings = ["Hello, World!"];
let htmlFocus = {status: false, lineIndex: 0};

let lineNumberColor = getComputedStyle(document.body).getPropertyValue("--editor-line-number-color")
let lineFocusColor = getComputedStyle(document.body).getPropertyValue("--editor-line-focus-color")
let textColor = getComputedStyle(document.body).getPropertyValue("--editor-text-color")
// function generateCoords() {
//     for (let i = 1; i < 21; i++) {
//         htmlScreeningCords.push([25*i-9 - 10, 25*i + 10])
//         htmlStrings.push("")
//     }
// }
// generateCoords()
renderHtmlCanvas()
window.addEventListener("resize", renderHtmlCanvas, htmlScreeningCords[htmlFocus.lineIndex])

function resetHtmlCanvas() {
    let {width, height} = htmlCanvas.getClientRects()[0]
    htmlCanvas.width = width;
    htmlCanvas.height = height;
}
function renderHtmlCanvas() {
    resetHtmlCanvas()
    hC.font = "16px Fira Code, sans-serif"

    for (let i = 0; i < htmlScreeningCords.length; i++) {
        hC.fillStyle = lineNumberColor
        // if (i < 10) {
        //     //  code line numbers
        //     hC.fillText(i+1, 20, htmlScreeningCords[i][0] + htmlCurrentScroll)
        //     //  renders entered text
        //     hC.fillStyle = textColor
        //     hC.fillText(htmlStrings[i], 40, htmlScreeningCords[i][0] +  htmlCurrentScroll)
        // }else {
        // }
        //  code line numbers
        hC.fillText(i+1, 15, htmlScreeningCords[i][0] + htmlCurrentScroll + 25)
        //  renders entered text
        hC.fillStyle = textColor
        hC.fillText(htmlStrings[i], 45, htmlScreeningCords[i][0] +  htmlCurrentScroll + 25)
    }
    hC.fillStyle = lineFocusColor
    //  line number splitter
    hC.fillRect(37, 0, 1, htmlCanvas.height)
    //  caret
    if (htmlFocus.status) {
        hC.fillRect(hC.measureText(htmlStrings[htmlFocus.lineIndex]).width + 45, htmlScreeningCords[htmlFocus.lineIndex][0]+htmlCurrentScroll + 8, 2, 25)
        hC.fillRect(5, htmlScreeningCords[htmlFocus.lineIndex][0]+htmlCurrentScroll + 8, htmlCanvas.width - 10, 25)
    };
}

//  focus on a certain line
htmlCanvas.addEventListener('click', function(event) {
    let coords = htmlScreeningCords.find(value => 
        value[0] < event.layerY+Math.abs(htmlCurrentScroll) &&
        value[1] > event.layerY+Math.abs(htmlCurrentScroll)) || 0;
    //if clicked at the empty spot of the canvas, focus on the last line
    htmlFocus.lineIndex = htmlScreeningCords.indexOf(coords) ==-1 ?  htmlScreeningCords.length-1 : htmlScreeningCords.indexOf(coords);
    htmlFocus.status = true;
    renderHtmlCanvas()
})

//  canvas scrolling
htmlCanvas.addEventListener('wheel', function (event) {
    // console.log(event)
    htmlCurrentScroll -= event.deltaY*0.35
    // console.log(htmlScreeningCords.slice(-2)[0][0])
    // if (htmlScreeningCords.slice(-2)[0][1] > Math.abs(htmlCurrentScroll)) {};
    if (htmlCurrentScroll > 0) htmlCurrentScroll = 0;
    renderHtmlCanvas()
})

//  typing
document.addEventListener("keydown", function(event) {
    if (htmlFocus.status) {
        event.preventDefault()
        if (/^[\w\d\[\]\(\)\{\} \\\*\-\+\=  \/\?\.\,\!\|'"\&\^\%\;\:]$/i.test(event.key)){
            htmlStrings[htmlFocus.lineIndex] += event.key
        }
        else if (event.key === "Enter") {
            //  create a new line
            if ( htmlFocus.lineIndex === htmlScreeningCords.length-1) {
                htmlScreeningCords.push([25*(htmlScreeningCords.length+1)-9 - 10, 25*(htmlScreeningCords.length+1) + 10])
                htmlStrings.push("")
            }
            htmlFocus.lineIndex ++
        }
        else if ( event.key === "Backspace" ) {
            //      jump one line up
            if ( htmlStrings[htmlFocus.lineIndex].length === 0 && htmlFocus.lineIndex > 0) {
                htmlScreeningCords.pop()
                htmlStrings.pop()
                htmlFocus.lineIndex--
            } else {
                // delete one character
                htmlStrings[htmlFocus.lineIndex] = htmlStrings[htmlFocus.lineIndex].slice(0,-1)
            }
        }
        // htmlStrings[htmlFocus.lineIndex] += event.key
        renderHtmlCanvas()
    }
})

// to loose focus from canvases
document.addEventListener('click', function(event) {
    if (event.target != htmlCanvas) {
        htmlFocus.status = false
        renderHtmlCanvas()
    }
})