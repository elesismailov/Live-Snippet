const htmlCanvas = document.querySelector("#html-input-canvas");
const cssCanvas = document.querySelector("#css-input-canvas");
const jsCanvas = document.querySelector("#js-input-canvas");
let scale = 1;
let universalValue = 25*scale;

const HC = htmlCanvas.getContext("2d");
const CC = cssCanvas.getContext("2d");
const JC = jsCanvas.getContext("2d");
let htmlCurrentScroll = 0;
let htmlRecordedCords = [[universalValue+ (- 9 - 10)*scale, universalValue+( + 10)*scale]];
let htmlStrings = ["Hello, World!"];
let htmlFocus = {
    status: false,  // is focused
    lineI: 0,           //  line index
    charI: null,        //  character index
    caret: true,        //  that blinking thinggy
    interval: false,    //  for caret blinking
    timeout: null,      //  for caret debouncer
};

const COMPUTED_STYLES = getComputedStyle(document.body);
let lineNumberColor = COMPUTED_STYLES.getPropertyValue(
    "--editor-line-number-color"
);
let lineFocusColor = COMPUTED_STYLES.getPropertyValue(
    "--editor-line-focus-color"
);
let textColor = COMPUTED_STYLES.getPropertyValue("--editor-text-color");
let caretColor = COMPUTED_STYLES.getPropertyValue("--editor-caret-color");

renderHtmlCanvas();
window.addEventListener(
    "resize",
    renderHtmlCanvas
);

function resetHtmlCanvas() {
    let { width, height } = htmlCanvas.getClientRects()[0];
    htmlCanvas.width = width*scale;
    htmlCanvas.height = height*scale;
}
function renderHtmlCanvas() {
    resetHtmlCanvas();
    HC.font = `${16*scale}px Fira Code, sans-serif`;
    let textStart = 55*scale;
    for (let i = 0; i < htmlRecordedCords.length; i++) {
        HC.fillStyle = lineNumberColor;
        //  line numbers
        HC.fillText(
            i + 1, 5,
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
    HC.fillRect(textStart - 8, 0, 0.5, htmlCanvas.height);
    if (htmlFocus.status) {
        //  the focused on line
        HC.fillRect(
            2,
            htmlRecordedCords[htmlFocus.lineI][0] + htmlCurrentScroll + 8,
            textStart - 12,
            universalValue
        );
        //  caret
        if (htmlFocus.caret) {
            HC.fillStyle = caretColor;
            HC.fillRect(
                HC.measureText(
                    htmlStrings[htmlFocus.lineI].slice(
                        0,
                        htmlFocus.charI === null ? undefined : htmlFocus.charI
                    )
                ).width + textStart,
                htmlRecordedCords[htmlFocus.lineI][0] + htmlCurrentScroll + 8,
                0.5,
                universalValue
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
    if (htmlFocus.status) {
        event.preventDefault();
        ///     SHORTCUTS
        // console.log(event)
        if (event.ctrlKey) {
            //      implement select all functionality
            if (event.key === "a") {
                console.log("select all");
            }
            //      implement delete several characters
            else if (event.key === "Backspace") {
                console.log("delete several characters");
            }
        } else if (/^arrow/i.test(event.key)) {
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
                universalValue * htmlFocus.lineI - 9 - 10,
                universalValue * htmlFocus.lineI + 10,
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
    }
});

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
            backspace.moveCoords()
        }
        htmlFocus.lineI--;
        htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
        //  put the charIndex between new and old strings: new_fsdka|old_dljl;ajsf
        if (previousLine.length !== currentLine.length) {
            htmlFocus.charI = previousLine.length
        }
    } else if (htmlFocus.lineI >= 0) {
        // if the index came from a longer line
        if (htmlStrings[htmlFocus.lineI].length < htmlFocus.charI) {
            htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
            //  and if the current line is empty, forget about the index and 
            //  move up the line
            if (htmlStrings[htmlFocus.lineI].length === 0) {
                //  delete coords and string of the line 
                htmlRecordedCords.splice(htmlFocus.lineI, 1);
                htmlStrings.splice(htmlFocus.lineI, 1);
                backspace.moveCoords()
                htmlFocus.lineI--
                htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
                return
            }
        }
        // pop from character index
        htmlStrings[htmlFocus.lineI] = htmlStrings[htmlFocus.lineI].slice(0,htmlFocus.charI-1) +
                                        htmlStrings[htmlFocus.lineI].slice(htmlFocus.charI);
        htmlFocus.charI--;
    }
}
backspace.moveCoords = function moveCoords() {
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
    let coords = htmlRecordedCords.find(
                    (value) =>
                        value[0] < event.layerY + Math.abs(htmlCurrentScroll) &&
                        value[1] > event.layerY + Math.abs(htmlCurrentScroll)
                ) || 0;
    //if clicked at the empty spot of the canvas, focus on the last line
    if (htmlRecordedCords.indexOf(coords) !== -1) {
        htmlFocus.lineI = htmlRecordedCords.indexOf(coords);
    } else {
        htmlFocus.lineI = htmlRecordedCords.length - 1;
    }

    ///  implement click on a particular character

    //  focus on the end of the line
    htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
    htmlFocus.status = true;
    //  first render the caret will be visible
    htmlFocus.caret = true;
    //  next 6 lines is caret blinker
    clearInterval(htmlFocus.interval);
    clearTimeout(htmlFocus.timeout);
    htmlFocus.interval = setInterval(function () {
        //     blink, blink, blink
        htmlFocus.caret = !htmlFocus.caret;
        renderHtmlCanvas();
    }, 500);

    renderHtmlCanvas();
});

// to loose focus from canvases
function lostFocus() {
    htmlFocus.status = false;
    clearInterval(htmlFocus.interval);
    clearInterval(htmlFocus.timeout);
    renderHtmlCanvas();
}
window.addEventListener("click", function (event) {
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
