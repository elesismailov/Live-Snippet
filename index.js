const htmlCanvas = document.querySelector("#html-input-canvas");
const cssCanvas = document.querySelector("#css-input-canvas");
const jsCanvas = document.querySelector("#js-input-canvas");
let scale = 1;
let universalValue = 25*scale;

const HC = htmlCanvas.getContext("2d");
const CC = cssCanvas.getContext("2d");
const JC = jsCanvas.getContext("2d");
let htmlCurrentScroll = 0;
let htmlRecordedCords = [[ 6, 35 ], [ 31, 60 ], [ 56, 85 ], [ 81, 110 ], [ 106, 135 ], [ 131, 160 ], [ 156, 185 ], [ 181, 210 ], [ 206, 235 ]];
let htmlStrings = [ "Hello, World!", "fgh-hmf", "f", "dgdh,sFgz;dhtxycukv", "fsdfsgrdhfcg", "gsrgfcgh", "gfdzxcbng", "", "" ]
htmlRecordedCords =  htmlRecordedCords.map((arr) => [
    arr[0]*scale,
    arr[1]*scale,
])
// let htmlRecordedCords = [[universalValue+ (- 9 - 10)*scale, universalValue+( + 10)*scale]];
// let htmlStrings = ["Hello, World!"];
let htmlFocus = {
    status: false,  // is focused
    lineI: 0,           //  line index
    charI: null,        //  character index
    caret: true,        //  that blinking thinggy
    interval: false,    //  for caret blinking
    timeout: null,      //  for caret debouncer
};

const COMPUTED_STYLES = getComputedStyle(document.body);
let lineNumberColor = COMPUTED_STYLES.getPropertyValue("--editor-line-number-color");
let lineFocusColor = COMPUTED_STYLES.getPropertyValue("--editor-line-focus-color");
let textColor = COMPUTED_STYLES.getPropertyValue("--editor-text-color");
let caretColor = COMPUTED_STYLES.getPropertyValue("--editor-caret-color");

let textStart = 45*scale;   // 55 for 1000+ lines, 45 for 100+ lines
let numberStart = 45*scale; // 55 for 1000+ lines, 45 for 100+ lines

renderHtmlCanvas();
window.addEventListener("resize",renderHtmlCanvas);

function resetHtmlCanvas() {
    let { width, height } = htmlCanvas.getClientRects()[0];
    htmlCanvas.width = width*scale;
    htmlCanvas.height = height*scale;
}
function renderHtmlCanvas() {
    resetHtmlCanvas();
    HC.font = `${16*scale}px Fira Code, sans-serif`;
    // HC.fillStyle = "#fff"
    // HC.fillRect(0,0,numberStart - 8*scale,htmlCanvas.height)
    for (let i = 0; i < htmlRecordedCords.length; i++) {
        //  line numbers
        HC.fillStyle = lineNumberColor;
        if (htmlFocus.lineI == i && htmlFocus.status) HC.fillStyle = '#fe0';    // highlight focused line number
        HC.fillText(
            i + 1, 
            numberStart + (- 8 - 13 - (i+1 < 10 ? 0 : 10*((Math.ceil((i + 1)/10)+'').length)))*scale,
            htmlRecordedCords[i][0] + htmlCurrentScroll + universalValue
        );
        //  contents of strings
        HC.fillStyle = textColor;
        HC.fillText(
            htmlStrings[i],
            textStart,
            htmlRecordedCords[i][0] + htmlCurrentScroll + universalValue
        );
    }
    HC.fillStyle = lineFocusColor;
    //  line number splitter
    HC.fillRect(numberStart - 8*scale, 0, 1*scale, htmlCanvas.height);
    if (htmlFocus.status) {
        //  the focused on line
        HC.fillRect(0, htmlRecordedCords[htmlFocus.lineI][0] + htmlCurrentScroll + 8*scale,
            numberStart - 8*scale ,universalValue
        );
        //  caret
        if (htmlFocus.caret) {
            HC.fillStyle = caretColor;
            HC.fillRect(HC.measureText(
                    htmlStrings[htmlFocus.lineI].slice(0, htmlFocus.charI === null ? undefined : htmlFocus.charI)
                ).width + textStart,
                htmlRecordedCords[htmlFocus.lineI][0] + htmlCurrentScroll + 8*scale,
                1*scale, universalValue
            );
        }
    }
}

//  canvas scrolling
htmlCanvas.addEventListener("wheel", function (event) {
    // console.log(event)
    htmlCurrentScroll -= event.deltaY * 0.35*scale;
    if (htmlCurrentScroll > 0) htmlCurrentScroll = 0;
    renderHtmlCanvas();
});

//  typing
document.addEventListener("keydown", function (event) {
    ///     SHORTCUTS
    // console.log(event)
    if (event.ctrlKey) {
        shortCuts(event)
    }
    else if (htmlFocus.status) {
        event.preventDefault();
        if (/^arrow/i.test(event.key)) {
            if (event.key === "ArrowUp" && htmlFocus.lineI >= 0) {
                if (htmlFocus.lineI > 0) {
                    htmlFocus.lineI--;
                } else htmlFocus.charI = 0;
            } else if (event.key === "ArrowDown") {
                if(htmlFocus.lineI !== htmlStrings.length - 1) {
                    htmlFocus.lineI++;
                } else htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
            } else if (event.key === "ArrowLeft") {
                if (htmlFocus.charI > 0) {
                    htmlFocus.charI--
                    if (htmlStrings[htmlFocus.lineI].length < htmlFocus.charI) {
                        if (htmlStrings[htmlFocus.lineI].length == 0) {
                            htmlFocus.lineI--
                        }
                        htmlFocus.charI = htmlStrings[htmlFocus.lineI].length-1;
                    }
                } else if (htmlFocus.lineI > 0) {
                    htmlFocus.lineI--
                    htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
                }
            } else if (event.key === "ArrowRight") {
                if (htmlStrings[htmlFocus.lineI].length > htmlFocus.charI){
                    htmlFocus.charI++
                
                } else if (htmlFocus.lineI !== htmlStrings.length - 1) {
                    htmlFocus.lineI++
                    htmlFocus.charI = 0
                }
            }
        } else if (/^.$/i.test(event.key)) {
            //  insert at character index
            htmlStrings[htmlFocus.lineI] = htmlStrings[htmlFocus.lineI].slice(0,htmlFocus.charI) +
                                           event.key + 
                                           htmlStrings[htmlFocus.lineI].slice(htmlFocus.charI)
            //  if the caret is NOT at the end of the line
            //  and you're typing, the caret will move along
            if (htmlStrings[htmlFocus.lineI].length > htmlFocus.charI) {
                htmlFocus.charI++;
            } else {
            //  if the caret is at the end, it will just reset position to the end
                htmlFocus.charI = htmlStrings[htmlFocus.lineI].length
            }
        } else if (event.key === "Enter") {
            //  create coordinates
            htmlRecordedCords.splice(htmlFocus.lineI, 0, [
                universalValue * htmlFocus.lineI + (- 9 - 10)*scale,
                universalValue * htmlFocus.lineI + (10)*scale,
            ]);
            //               add a new string
            //  if the caret is at the begining, move the line down
            if (htmlFocus.charI == 0)   htmlStrings.splice(htmlFocus.lineI, 0, "");
            //  if the caret is somewhere else,
            //  slice the string and put it at the new line
            else {
                htmlStrings.splice(
                    htmlFocus.lineI + 1, 0,
                    htmlStrings[htmlFocus.lineI].slice(htmlFocus.charI)
                );
                htmlStrings[htmlFocus.lineI] = htmlStrings[htmlFocus.lineI].slice(0, htmlFocus.charI)
            }
            //  this function moves strings', that are before the current line,
            //  coordinates DOWN
            htmlRecordedCords = [
                ...htmlRecordedCords.slice(0, htmlFocus.lineI),
                ...htmlRecordedCords
                    .slice(htmlFocus.lineI)
                    .map((arr) => [
                        arr[0] + universalValue,
                        arr[1] + universalValue,
                    ]),
            ];
            //  focus on that new line(move focus down)
            htmlFocus.lineI++;
            //  the focused line will always have the caret at the begining,
            //  doesn't matter whether split-down line or new line
            htmlFocus.charI = 0;
        } 
        else if (event.key === "Backspace") backspace(event)

    }
    //   ||   next lines are blinker debouncer
    //   \/
    clearInterval(htmlFocus.interval);
    clearTimeout(htmlFocus.timeout);
    //  will make caret visible when any key's pressed
    htmlFocus.caret = true;
    htmlFocus.timeout = setTimeout(function () {
        //  caret blinker
        htmlFocus.interval = setInterval(function () {
            htmlFocus.caret = !htmlFocus.caret;
            renderHtmlCanvas();
        }, 500);
    }, 500);

    renderHtmlCanvas();
});
function shortCuts(event) {
    //      implement select all functionality
    if (event.key === "a") {
        console.log("select all");
    }
    else if (event.key === "Backspace") {
        // get every character before the caret
        let charsBeforeCaret = htmlStrings[htmlFocus.lineI].slice(0, htmlFocus.charI);
        // get every character before the first NON character
        let deleteString = charsBeforeCaret.match(/(\W*)\w*?$/)[0];
        // for jumping line up
        if (htmlStrings[htmlFocus.lineI].length === 0) {    // if the line is empty
            backspace(event)
            htmlFocus.charI = htmlStrings[htmlFocus.lineI].length
        // for deleting the non characters
        } else if (deleteString.length == 1) {  // if the character is not a \w
            // console.log("First")
            htmlStrings[htmlFocus.lineI] = charsBeforeCaret.slice(0, -1) +
                htmlStrings[htmlFocus.lineI].slice(htmlFocus.charI);
            htmlFocus.charI = htmlFocus.charI - deleteString.length;
        // when line doesn't have non characters
        } else if (htmlStrings[htmlFocus.lineI].length === deleteString.length) {
            // console.log("Second")
            htmlStrings[htmlFocus.lineI] = charsBeforeCaret.slice(0, -deleteString.length) +
                htmlStrings[htmlFocus.lineI].slice(htmlFocus.charI);
            htmlFocus.charI = htmlFocus.charI - deleteString.length+1;
        } else {
            // console.log("third")
            if (/\w/g.test(deleteString[0])) {  // first character is a \w
                htmlStrings[htmlFocus.lineI] = charsBeforeCaret.slice(0, -deleteString.length) +
                    htmlStrings[htmlFocus.lineI].slice(htmlFocus.charI)
                htmlFocus.charI = htmlFocus.charI - deleteString.length;
            } else {
                htmlStrings[htmlFocus.lineI] = charsBeforeCaret.slice(0, -deleteString.length+1) +
                    htmlStrings[htmlFocus.lineI].slice(htmlFocus.charI);
                htmlFocus.charI = htmlFocus.charI - deleteString.length +1;
            }
        }
    }
    // .match(/.*?\W+?/)        // match from the beginning
} 
function backspace(event) {
    let currentLine = htmlStrings[htmlFocus.lineI];
    let previousLine = htmlStrings[htmlFocus.lineI-1]
    //      jump one line up
    if (htmlFocus.charI === 0 && htmlFocus.lineI > 0) {
        //  moving up line and concatenating it with the previous one
        if (htmlStrings[htmlFocus.lineI].length) {
            htmlStrings[htmlFocus.lineI-1] += htmlStrings[htmlFocus.lineI]
        }
        //  delete coords and string of the line 
        htmlRecordedCords.splice(htmlFocus.lineI, 1);
        htmlStrings.splice(htmlFocus.lineI, 1);
        //  move coordinates of all lines after lineIndex 
        if (htmlFocus.lineI < htmlRecordedCords.length) {  //      not the last line
            backspace.moveCoordsUp()
        }
        htmlFocus.lineI--;
        htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
        //  put the charIndex between new and old strings: new_fsdka|old_dljl;ajsf
        if (previousLine.length !== currentLine.length) {
            htmlFocus.charI = previousLine.length
        }
    } else if (htmlFocus.lineI > 0) {
        // if the index came from a longer line
        if (htmlStrings[htmlFocus.lineI].length < htmlFocus.charI) {
            htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
            //  and if the current line is empty, forget about the index and 
            //  move up the line
            if (htmlStrings[htmlFocus.lineI].length === 0) {
                //  delete coords and string of the line 
                htmlRecordedCords.splice(htmlFocus.lineI, 1);
                htmlStrings.splice(htmlFocus.lineI, 1);
                backspace.moveCoordsUp()
                htmlFocus.lineI--
                htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
                return
            }
        }
        // pop a character at characterIndex
        htmlStrings[htmlFocus.lineI] = htmlStrings[htmlFocus.lineI].slice(0,htmlFocus.charI-1) +
                                        htmlStrings[htmlFocus.lineI].slice(htmlFocus.charI);
        htmlFocus.charI--;
    //  if it is the first line
    } else if (htmlFocus.lineI == 0 && htmlFocus.charI != 0) {
        // if the index came from a longer line
        if (htmlStrings[htmlFocus.lineI].length < htmlFocus.charI) {
            htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
        }
        htmlStrings[htmlFocus.lineI] = htmlStrings[htmlFocus.lineI].slice(0,htmlFocus.charI-1) +
                        htmlStrings[htmlFocus.lineI].slice(htmlFocus.charI);
        htmlFocus.charI--;
    }
}
backspace.moveCoordsUp = function moveCoords() {
    //  this function moves strings', that are after the current line,
    //  coordinates UP
    htmlRecordedCords = [
        ...htmlRecordedCords.slice(0, htmlFocus.lineI),
        ...htmlRecordedCords
            .slice(htmlFocus.lineI)
            .map((arr) => [
                arr[0] - universalValue,
                arr[1] - universalValue,
            ]),
    ];
}

//  focus on a certain line
htmlCanvas.addEventListener("click", function (event) {
    //  find whether clicked place is in recorded cords
    let coordsY = htmlRecordedCords.find(
                    (value) =>
                        value[0] < event.layerY*scale + Math.abs(htmlCurrentScroll) &&
                        value[1] > event.layerY*scale + Math.abs(htmlCurrentScroll)
                ) || 0;
    //if clicked at the empty spot of the canvas, focus on the last line
    if (coordsY) {
        htmlFocus.lineI = htmlRecordedCords.indexOf(coordsY);
        let currentLine = htmlStrings[htmlFocus.lineI]
        let currentLineLength = HC.measureText(currentLine).width + textStart;
        let clickPoint = event.layerX*scale
        if (clickPoint <= currentLineLength) {
            for (let i = 0; i < currentLineLength; i++) {
                if (HC.measureText(currentLine.slice(0, i)).width + textStart - 5*scale < clickPoint &&
                    HC.measureText(currentLine.slice(0, i)).width + textStart + 5*scale > clickPoint){
                    htmlFocus.charI = i;
                    break
                }
            }
        } else {
            htmlFocus.charI = currentLine.length;
        }
    } else {
        //  focus on the end of the line
        htmlFocus.lineI = htmlRecordedCords.length - 1;
        htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
    }

    // let count = 0;
    // !function binaryCoordsSearch(string, startIndex) {
    //     count ++
    //     let firstHalf = string.slice(0, Math.floor(string.length/2))
    //     let secondHalf = string.slice(Math.floor(string.length/2))
    //     // console.log(HC.measureText(firstHalf).width)
    //     // console.log(HC.measureText(firstHalf).width + HC.measureText(secondHalf).width)
    //     console.log("clicked", clickPoint)
    //     let stIndex = 0;
    //     let firstHalfLength = HC.measureText(firstHalf).width + textStart
    //     let chosenHalf;
    //     // if (firstHalfLength > clickPoint){
    //     //     chosenHalf = firstHalf

    //     // } else if (firstHalfLength + 10 > clickPoint && firstHalfLength - 10 < clickPoint){
    //     //     console.log("G O T   I T !")
    //     //     console.log(firstHalfLength)
    //     //     return
    //     // }
    //     console.log()
    // }(currentLine, 0)
            

    htmlFocus.status = true;
    //  first render the caret will be visible
    htmlFocus.caret = true;

    renderHtmlCanvas();
    //  next 6 lines is caret blinker
    clearInterval(htmlFocus.interval);
    clearTimeout(htmlFocus.timeout);
    htmlFocus.interval = setInterval(function () {
        //     blink, blink, blink
        htmlFocus.caret = !htmlFocus.caret;
        renderHtmlCanvas();
    }, 500);
});

// to loose focus from canvases
function lostFocus() {
    htmlFocus.status = false;
    clearInterval(htmlFocus.interval);
    clearInterval(htmlFocus.timeout);
    renderHtmlCanvas();
}
addEventListener("click", function (event) {
    if (event.target != htmlCanvas) {
        // lostFocus();
    }
});
// document.addEventListener("blur", lostFocus);

// htmlFocus = new Proxy(htmlFocus, {
//     get: (target, key) => {
//         console.log(key)
//         return target[key]
//     },
//     set: (target, key, value) => {
//         console.log(key, ":", value)
//         target[key] = value
//     }
// })
