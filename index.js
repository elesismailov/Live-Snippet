


let htmlCanvas = document.querySelector("#html-input-canvas")
let cssCanvas = document.querySelector("#css-input-canvas")
let jsCanvas = document.querySelector("#js-input-canvas")


let hC = htmlCanvas.getContext("2d")
let cC = cssCanvas.getContext("2d")
let jC = jsCanvas.getContext("2d")
let htmlCurrentScroll = 0;
let htmlScreeningCords = [[25-9 - 10, 25 + 10]];
let htmlStrings = ["Hello, World!"];
                            //lineIndex, characterIndex
let htmlFocus = {status: false, lI: 0, cI: 0};

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
window.addEventListener("resize", renderHtmlCanvas, htmlScreeningCords[htmlFocus.lI])

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
    if (htmlFocus.status) {
        //  caret
        hC.fillRect(hC.measureText(htmlStrings[htmlFocus.lI]).width + 45, htmlScreeningCords[htmlFocus.lI][0]+htmlCurrentScroll + 8, 2, 25)
        //  the line the caret is on
        hC.fillRect(5, htmlScreeningCords[htmlFocus.lI][0]+htmlCurrentScroll + 8, htmlCanvas.width - 10, 25)
    };
}

//  focus on a certain line
htmlCanvas.addEventListener('click', function(event) {
    let coords = htmlScreeningCords.find(value => 
        value[0] < event.layerY+Math.abs(htmlCurrentScroll) &&
        value[1] > event.layerY+Math.abs(htmlCurrentScroll)) || 0;
    //if clicked at the empty spot of the canvas, focus on the last line
    htmlFocus.lI = htmlScreeningCords.indexOf(coords) ==-1 ?  htmlScreeningCords.length-1 : htmlScreeningCords.indexOf(coords);
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
        console.log(event)
        if (event.ctrlKey && event.key === "a") {
            //      implement select all functionality
            console.log("select all")
        }
        else if (/^[\w\d\[\]\(\)\{\} \\\*\-\+\=  \/\?\.\,\!\|'"\&\^\%\;\:]$/i.test(event.key)){
            htmlStrings[htmlFocus.lI] += event.key
        }
        else if (event.key === "Enter") {
            //  create a new line
            if ( htmlFocus.lI === htmlScreeningCords.length-1) {
                htmlScreeningCords.push([25*(htmlScreeningCords.length+1)-9 - 10, 25*(htmlScreeningCords.length+1) + 10])
                htmlStrings.push("")
            } else if (htmlFocus.lI < htmlScreeningCords.length-1) {
                htmlScreeningCords.splice(htmlFocus.lI, 0, [25*(htmlFocus.lI)-9 - 10, 25*(htmlFocus.lI) + 10])
                htmlStrings.splice(htmlFocus.lI+1, 0, "")
                htmlScreeningCords = [...htmlScreeningCords.slice(0, htmlFocus.lI), ...htmlScreeningCords.slice(htmlFocus.lI).map((arr) => [arr[0] + 25, arr[1] + 25])]
            }   
            htmlFocus.lI ++
        }
        else if ( event.key === "Backspace" ) {
            //      jump one line up
            if ( htmlStrings[htmlFocus.lI].length === 0 && htmlFocus.lI > 0) {
                htmlScreeningCords.splice(htmlFocus.lI,1)
                htmlStrings.splice(htmlFocus.lI, 1)
                if (htmlFocus.lI < htmlScreeningCords.length) {
                    htmlScreeningCords = [...htmlScreeningCords.slice(0, htmlFocus.lI), ...htmlScreeningCords.slice(htmlFocus.lI).map((arr) => [arr[0] - 25, arr[1] - 25])]
                }
                htmlFocus.lI--
            } else {
                // delete one character
                htmlStrings[htmlFocus.lI] = htmlStrings[htmlFocus.lI].slice(0,-1)
            }
        }
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