


const htmlCanvas = document.querySelector("#html-input-canvas");
const cssCanvas = document.querySelector("#css-input-canvas");
const jsCanvas = document.querySelector("#js-input-canvas");


const HC = htmlCanvas.getContext("2d");
const CC = cssCanvas.getContext("2d");
const JC = jsCanvas.getContext("2d");
let htmlCurrentScroll = 0;
let htmlScreeningCords = [[25-9 - 10, 25 + 10]];
let htmlStrings = ["Hello, World!"];
let htmlFocus = {
    status: false, 
    lI: 0, //   line index
    cI: 0, //   character index
    caret: true,
    interval: false,
    timeout: null,
};

const COMPUTED_STYLES = getComputedStyle(document.body);
let lineNumberColor = COMPUTED_STYLES.getPropertyValue("--editor-line-number-color");
let lineFocusColor = COMPUTED_STYLES.getPropertyValue("--editor-line-focus-color");
let textColor = COMPUTED_STYLES.getPropertyValue("--editor-text-color");
let caretColor = COMPUTED_STYLES.getPropertyValue("--editor-caret-color");

renderHtmlCanvas()
window.addEventListener("resize", renderHtmlCanvas, htmlScreeningCords[htmlFocus.lI])

function resetHtmlCanvas() {
    let {width, height} = htmlCanvas.getClientRects()[0];
    htmlCanvas.width = width;
    htmlCanvas.height = height;
}
function renderHtmlCanvas() {
    resetHtmlCanvas()
    HC.font = "16px Fira Code, sans-serif";
    let textStart = 55
    for (let i = 0; i < htmlScreeningCords.length; i++) {
        HC.fillStyle = lineNumberColor
        //  code line numbers
        HC.fillText(i+1, 15, htmlScreeningCords[i][0] + htmlCurrentScroll + 25)
        //  renders entered text
        HC.fillStyle = textColor;
        HC.fillText(htmlStrings[i], textStart, htmlScreeningCords[i][0] +  htmlCurrentScroll + 25)
    }
    HC.fillStyle = lineFocusColor;
    //  line number splitter
    HC.fillRect(textStart-8, 0, 0.5, htmlCanvas.height)
    if (htmlFocus.status) {
        //  the line the caret is on
        HC.fillRect(2, htmlScreeningCords[htmlFocus.lI][0]+htmlCurrentScroll + 8, textStart-12, 25)
        //  caret
        if (htmlFocus.caret) {
            HC.fillStyle = caretColor;
            HC.fillRect(HC.measureText(htmlStrings[htmlFocus.lI]).width + textStart, htmlScreeningCords[htmlFocus.lI][0]+htmlCurrentScroll + 8, 2, 25)
        }
    };
}

//  canvas scrolling
htmlCanvas.addEventListener('wheel', function (event) {
    // console.log(event)
    htmlCurrentScroll -= event.deltaY*0.35;
    if (htmlCurrentScroll > 0) htmlCurrentScroll = 0;
    renderHtmlCanvas()
})

//  typing
document.addEventListener("keydown", function(event) {
    if (htmlFocus.status) {
        event.preventDefault()
                                     ///     SHORTCUTS
        // console.log(event)
        if (event.ctrlKey) {
            //      implement select all functionality
            if (event.key === "a") {
                console.log("select all")
            }
            //      implement delete several characters
            else if (event.key === "Backspace") {
                console.log("delete several characters")
            }
        }
        else if (/^arrow/i.test(event.key)) {
            if (event.key === "ArrowUp" && htmlFocus.lI > 0) {
                htmlFocus.lI--;
            } else if ( event.key === "ArrowDown" && htmlFocus.lI !== htmlStrings.length-1) {
                htmlFocus.lI++;
            }
            //      implement character indexes
        }
        else if (/^[\w\d\[\]\(\)\{\} \\\*\-\+\=  \/\?\.\,\!\|'"\&\^\%\;\: \<\>]$/i.test(event.key)){
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
                htmlScreeningCords = [...htmlScreeningCords.slice(0, htmlFocus.lI), ...htmlScreeningCords.slice(htmlFocus.lI).map((arr) => [arr[0] + 25, arr[1] + 25])];
            }   
            htmlFocus.lI ++
        }
        else if ( event.key === "Backspace" ) {
            //      jump one line up
            if ( htmlStrings[htmlFocus.lI].length === 0 && htmlFocus.lI > 0) {
                htmlScreeningCords.splice(htmlFocus.lI,1)
                htmlStrings.splice(htmlFocus.lI, 1)
                if (htmlFocus.lI < htmlScreeningCords.length) {
                    htmlScreeningCords = [...htmlScreeningCords.slice(0, htmlFocus.lI), ...htmlScreeningCords.slice(htmlFocus.lI).map((arr) => [arr[0] - 25, arr[1] - 25])];
                }
                htmlFocus.lI--
            } else {
                // delete one character
                htmlStrings[htmlFocus.lI] = htmlStrings[htmlFocus.lI].slice(0,-1)
            }
        }
        clearInterval(htmlFocus.interval)
        clearInterval(htmlFocus.timeout)
        htmlFocus.caret = true
        htmlFocus.timeout = setTimeout(function() {
            htmlFocus.interval = setInterval(function() {
                htmlFocus.caret = !htmlFocus.caret
                renderHtmlCanvas()
            }, 500)
        }, 500)
        renderHtmlCanvas()
    }
})

//  focus on a certain line
htmlCanvas.addEventListener('click', function(event) {
    let coords = htmlScreeningCords.find(value => 
        value[0] < event.layerY+Math.abs(htmlCurrentScroll) &&
        value[1] > event.layerY+Math.abs(htmlCurrentScroll)) || 0;
    //if clicked at the empty spot of the canvas, focus on the last line
    htmlFocus.lI = htmlScreeningCords.indexOf(coords) ==-1 ?  htmlScreeningCords.length-1 : htmlScreeningCords.indexOf(coords);
    htmlFocus.status = true;

    clearInterval(htmlFocus.interval)
    htmlFocus.caret = true;
    htmlFocus.interval = setInterval(function() {
        htmlFocus.caret = !htmlFocus.caret;
        renderHtmlCanvas()
    }, 500)

    renderHtmlCanvas()
})

// to loose focus from canvases
function lostFocus() {
        htmlFocus.status = false
        clearInterval(htmlFocus.interval)
        clearInterval(htmlFocus.timeout)
        renderHtmlCanvas()
}
document.addEventListener('click', function(event) {
    if (event.target != htmlCanvas) {
        lostFocus()
    }
})
document.addEventListener('blur', lostFocus)
