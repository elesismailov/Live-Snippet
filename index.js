const htmlCanvas = document.querySelector("#html-input-canvas");
const cssCanvas = document.querySelector("#css-input-canvas");
const jsCanvas = document.querySelector("#js-input-canvas");
let scale = 1;
let universalValue = 25*scale;

const HC = htmlCanvas.getContext("2d");
const CC = cssCanvas.getContext("2d");
const JC = jsCanvas.getContext("2d");
let htmlCurrentScrollX = 0;
let htmlCurrentScrollY = 0;
let htmlRecordedCords = [[ 6, 35 ], [ 31, 60 ], [ 56, 85 ], [ 81, 110 ], [ 106, 135 ], [ 131, 160 ], [ 156, 185 ], [ 181, 210 ], [ 206, 235 ]];
// let htmlStrings = [ "Hello, World!", "fgh-hmf", "f", "dgdh,sFgz;dhtxycukv", "fsdfsgrdhfcg", "gsrgfcgh", "gfdzxcbng", "", "" ]
let htmlStrings = [
    `if (charS <= j && j < charE) {`,
    `  HC.fillRect(HC.measureText(`,
    `    htmlStrings[i].slice(0, j)).width + textStart,`,
    `    htmlRecordedCords[i][0] + htmlCurrentScrollX + 8*scale,`,
    `    10, `,
    `    universalValue`,
    `  );`,
    `};`,
    ''
];
htmlRecordedCords =  htmlRecordedCords.map((arr) => [
    arr[0]*scale,
    arr[1]*scale,
])
// let htmlRecordedCords = [[universalValue+ (- 9 - 10)*scale, universalValue+( + 10)*scale]];
// let htmlStrings = ["Hello, World!"];
let htmlFocus = {
    isFocused: false,
    lineI: 0,           //  line index
    charI: 0,        //  character index
    showCaret: true,        //  that blinking thinggy
    interval: 0,    //  for caret blinking
    timeout: 0,      //  for caret debouncer
    isSelected: false,
    selCoords: [[0, 0], [0, 0]], // [lineS, charS], [lineE, charE]
    // selCoords: [[1,3], [4,6]], // [lineS, charS], [lineE, charE]
};

const COMPUTED_STYLES = getComputedStyle(document.body);
let lineNumberColor = COMPUTED_STYLES.getPropertyValue("--editor-line-number-color");
let lineFocusColor = COMPUTED_STYLES.getPropertyValue("--editor-line-focus-color");
let textColor = COMPUTED_STYLES.getPropertyValue("--editor-text-color");
let textSelectionColor = COMPUTED_STYLES.getPropertyValue("--editor-text-selection-color");
let caretColor = COMPUTED_STYLES.getPropertyValue("--editor-caret-color");

let textStart = 45*scale;   // 55 for 1000+ lines, 45 for 100+ lines
let numberStart = 45*scale; // 55 for 1000+ lines, 45 for 100+ lines

renderHtmlCanvas();
window.addEventListener("resize",renderHtmlCanvas);

function resetHtmlCanvas() {
    let { width, height } = htmlCanvas.getClientRects()[0];
    // htmlCanvas.width = width*scale;
    // htmlCanvas.height = height*scale;
    htmlCanvas.width = width;
    htmlCanvas.height = height;
}
function renderHtmlCanvas() {
    resetHtmlCanvas();
    HC.font = `${16*scale}px Fira Code, sans-serif`;
    // HC.fillStyle = "#fff"
    // HC.fillRect(0,0,numberStart - 8*scale,htmlCanvas.height)
    for (let i = 0; i < htmlRecordedCords.length; i++) {
        //  line numbers
        HC.fillStyle = lineNumberColor;
        if (htmlFocus.lineI == i && htmlFocus.isFocused) HC.fillStyle = '#fe0';    // highlight focused line number
        HC.fillText(
            i + 1, 
            numberStart + (- 8 - 13 - (i+1 < 10 ? 0 : 10*((Math.ceil((i + 1)/10)+'').length)))*scale,
            htmlRecordedCords[i][0] + htmlCurrentScrollX + universalValue
        );
        //  contents of strings
        HC.fillStyle = textColor;
        HC.fillText(
            htmlStrings[i],
            textStart,
            htmlRecordedCords[i][0] + htmlCurrentScrollX + universalValue
        );
    }
    HC.fillStyle = lineFocusColor;
    //  line number splitter
    HC.fillRect(numberStart - 8*scale, 0, 1*scale, htmlCanvas.height);
    if (htmlFocus.isFocused) {
        //  the focused on line
        HC.fillRect(0, htmlRecordedCords[htmlFocus.lineI][0] + htmlCurrentScrollX + 8*scale,
            numberStart - 8*scale ,universalValue
        );
        //  caret
        if (htmlFocus.showCaret) {
            HC.fillStyle = caretColor;
            HC.fillRect(HC.measureText(
                htmlStrings[htmlFocus.lineI].slice(0, htmlFocus.charI === null ? undefined : htmlFocus.charI)
                ).width + textStart,
                htmlRecordedCords[htmlFocus.lineI][0] + htmlCurrentScrollX + 8*scale,
                1*scale, 
                universalValue
            );
        }
    }
    if (htmlFocus.isSelected) {
        let lineS = htmlFocus.selCoords[0][0];  // start
        let charS = htmlFocus.selCoords[0][1];
        let lineE = htmlFocus.selCoords[1][0];  // end
        let charE = htmlFocus.selCoords[1][1];
        for(let i = 0; i < htmlStrings.length; i++) {
            for (let j = 0; j < htmlStrings[i].length+1; j++) {
                if (lineS <= i && i <= lineE) {
                    HC.fillStyle = textSelectionColor;
                    if (lineS === lineE) {
                        if (charS <= j && j < charE) {
                            HC.fillRect(HC.measureText(
                                htmlStrings[i].slice(0, j)).width + textStart,
                                htmlRecordedCords[i][0] + htmlCurrentScrollX + 8*scale,
                                10, 
                                universalValue
                            );
                        }
                    } else if (i === lineS) {
                        if (charS <= j) {
                            HC.fillRect(HC.measureText(
                                htmlStrings[i].slice(0, j)).width + textStart,
                                htmlRecordedCords[i][0] + htmlCurrentScrollX + 8*scale,
                                10, 
                                universalValue
                            );
                        }
                    } else if (i === lineE) {
                        if (j < charE) {
                            HC.fillRect(HC.measureText(
                                htmlStrings[i].slice(0, j)).width + textStart,
                                htmlRecordedCords[i][0] + htmlCurrentScrollX + 8*scale,
                                10, 
                                universalValue
                            );
                        }
                    } else {
                        HC.fillRect(HC.measureText(
                            htmlStrings[i].slice(0, j)).width + textStart,
                            htmlRecordedCords[i][0] + htmlCurrentScrollX + 8*scale,
                            10, 
                            universalValue
                        );
                    }
                }
            }
        }
    }
    HC.stroke()
}
htmlCanvas.addEventListener("dblclick", function() {
    htmlFocus.isSelected = true
    htmlFocus.selCoords[0][0] = htmlFocus.lineI
    htmlFocus.selCoords[0][1] = 0
    htmlFocus.selCoords[1][0] = htmlFocus.lineI
    htmlFocus.selCoords[1][1] = htmlStrings[htmlFocus.lineI].length 
    renderHtmlCanvas()
})
htmlCanvas.addEventListener("mousedown", function(event) {
    function onMouseMove(event) {
        htmlFocus.isSelected = true;
        let coordsY = htmlRecordedCords.find(
            (value) =>
                value[0] < event.layerY*scale + Math.abs(htmlCurrentScrollX) &&
                value[1] > event.layerY*scale + Math.abs(htmlCurrentScrollX)
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
        // if (htmlFocus.selCoords[0][0] > htmlFocus.lineI) {
        //     console.log("here")
        //     console.log(htmlFocus.selCoords)
        //     htmlFocus.selCoords[0] = htmlFocus.selCoords[1];
        //     htmlFocus.selCoords[1] = [
        //         htmlFocus.lineI,
        //         htmlFocus.charI
        //     ];
        // } else {}
        // if (htmlFocus.selCoords[0][0] > htmlFocus.selCoords[1][0]) {
        //     htmlFocus.selCoords[0] = [
        //         htmlFocus.lineI,
        //         htmlFocus.charI
        //     ];
        // } else {
        // }
        htmlFocus.selCoords[1] = [
            htmlFocus.lineI,
            htmlFocus.charI
        ];
        // if (htmlFocus.selCoords[0][0] > htmlFocus.selCoords[1][0]) {
        //     htmlFocus.selCoords = [htmlFocus.selCoords[1], htmlFocus.selCoords[0]]
        // }
        renderHtmlCanvas()
    }
    function onMouseUp(event) {
        htmlCanvas.removeEventListener("mousemove", onMouseMove)
        htmlCanvas.removeEventListener("mouseup", onMouseUp)    
    }
    htmlCanvas.addEventListener("mousemove", onMouseMove)
    htmlCanvas.addEventListener("mouseup", onMouseUp)
})

//  canvas scrolling
htmlCanvas.addEventListener("wheel", function (event) {
    // console.log(event)
    htmlCurrentScrollX -= event.deltaY * 0.35*scale;
    if (htmlCurrentScrollX > 0) htmlCurrentScrollX = 0;
    renderHtmlCanvas();
});

//  typing
document.addEventListener("keydown", function (event) {
    ///     SHORTCUTS
    // console.log(event)
    if (event.ctrlKey) {
        shortCuts(event)
    }
    else if (htmlFocus.isFocused) {
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
    htmlFocus.showCaret = true;
    htmlFocus.timeout = setTimeout(function () {
        //  caret blinker
        htmlFocus.interval = setInterval(function () {
            htmlFocus.showCaret = !htmlFocus.showCaret;
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
        if (htmlFocus.charI === 0) {    // when caret is at the very beginning
            let placeholder = htmlStrings[htmlFocus.lineI-1].length;
            backspace(event)
            htmlFocus.charI = placeholder;
        // for deleting the non characters
        } else if (htmlStrings[htmlFocus.lineI].length === 0){    // if the line is emtpy
            backspace()
            htmlFocus.charI = htmlStrings[htmlFocus.lineI].length
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
htmlCanvas.addEventListener("mousedown", function (event) {
    //  find whether clicked place is in recorded cords
    let coordsY = htmlRecordedCords.find(
                    (value) =>
                        value[0] < event.layerY*scale + Math.abs(htmlCurrentScrollX) &&
                        value[1] > event.layerY*scale + Math.abs(htmlCurrentScrollX)
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
    //  set selection starting point
    htmlFocus.selCoords[0] = [
        htmlFocus.lineI,
        htmlFocus.charI
    ];
    htmlFocus.isSelected = false;
    htmlFocus.isFocused = true;
    //  first render the caret will be visible
    htmlFocus.showCaret = true;

    renderHtmlCanvas();
    //  next 6 lines is caret blinker
    clearInterval(htmlFocus.interval);
    clearTimeout(htmlFocus.timeout);
    htmlFocus.interval = setInterval(function () {
        //     blink, blink, blink
        htmlFocus.showCaret = !htmlFocus.showCaret;
        renderHtmlCanvas();
    }, 500);
});

// to loose focus from canvases
function lostFocus() {
    htmlFocus.isFocused = false;
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
