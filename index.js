const htmlCanvas = document.querySelector("#html-input-canvas");
const cssCanvas = document.querySelector("#css-input-canvas");
const jsCanvas = document.querySelector("#js-input-canvas");

let universalValue = 25;

const HC = htmlCanvas.getContext("2d");
const CC = cssCanvas.getContext("2d");
const JC = jsCanvas.getContext("2d");
let htmlCurrentScroll = 0;
let htmlScreeningCords = [[universalValue - 9 - 10, universalValue + 10]];
let htmlStrings = ["Hello, World!"];
let htmlFocus = {
    status: false,
    lineI: 0, //   line index
    charI: null, //   character index
    caret: true,
    interval: false,
    timeout: null,
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
    renderHtmlCanvas,
    htmlScreeningCords[htmlFocus.lineI]
);

function resetHtmlCanvas() {
    let { width, height } = htmlCanvas.getClientRects()[0];
    htmlCanvas.width = width;
    htmlCanvas.height = height;
}
function renderHtmlCanvas() {
    resetHtmlCanvas();
    HC.font = "16px Fira Code, sans-serif";
    let textStart = 55;
    for (let i = 0; i < htmlScreeningCords.length; i++) {
        HC.fillStyle = lineNumberColor;
        //  code line numbers
        HC.fillText(
            i + 1,
            15,
            htmlScreeningCords[i][0] + htmlCurrentScroll + universalValue
        );
        //  renders entered text
        HC.fillStyle = textColor;
        HC.fillText(
            htmlStrings[i],
            textStart,
            htmlScreeningCords[i][0] + htmlCurrentScroll + universalValue
        );
    }
    HC.fillStyle = lineFocusColor;
    //  line number splitter
    HC.fillRect(textStart - 8, 0, 0.5, htmlCanvas.height);
    if (htmlFocus.status) {
        //  the line the caret is on
        HC.fillRect(
            2,
            htmlScreeningCords[htmlFocus.lineI][0] + htmlCurrentScroll + 8,
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
                htmlScreeningCords[htmlFocus.lineI][0] + htmlCurrentScroll + 8,
                0.5,
                universalValue
            );
        }
    }
}

//  canvas scrolling
htmlCanvas.addEventListener("wheel", function (event) {
    // console.log(event)
    htmlCurrentScroll -= event.deltaY * 0.35;
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
            htmlStrings[htmlFocus.lineI] += event.key;
            htmlFocus.charI++;
        } else if (event.key === "Enter") {
            //  create a new line
            if (htmlFocus.lineI === htmlScreeningCords.length - 1) {
                htmlScreeningCords.push([
                    universalValue * (htmlScreeningCords.length + 1) - 9 - 10,
                    universalValue * (htmlScreeningCords.length + 1) + 10,
                ]);
                htmlStrings.push("");
            } else if (htmlFocus.lineI < htmlScreeningCords.length - 1) {
                htmlScreeningCords.splice(htmlFocus.lineI, 0, [
                    universalValue * htmlFocus.lineI - 9 - 10,
                    universalValue * htmlFocus.lineI + 10,
                ]);
                htmlStrings.splice(htmlFocus.lineI + 1, 0, "");
                htmlScreeningCords = [
                    ...htmlScreeningCords.slice(0, htmlFocus.lineI),
                    ...htmlScreeningCords
                        .slice(htmlFocus.lineI)
                        .map((arr) => [
                            arr[0] + universalValue,
                            arr[1] + universalValue,
                        ]),
                ];
            }
            htmlFocus.lineI++;
            htmlFocus.charI = 0;
        } else if (event.key === "Backspace") {
            //      jump one line up
            if (htmlStrings[htmlFocus.lineI].length === 0 && htmlFocus.lineI > 0) {
                htmlScreeningCords.splice(htmlFocus.lineI, 1);
                htmlStrings.splice(htmlFocus.lineI, 1);
                if (htmlFocus.lineI < htmlScreeningCords.length) {
                    htmlScreeningCords = [
                        ...htmlScreeningCords.slice(0, htmlFocus.lineI),
                        ...htmlScreeningCords
                            .slice(htmlFocus.lineI)
                            .map((arr) => [
                                arr[0] - universalValue,
                                arr[1] - universalValue,
                            ]),
                    ];
                }
                htmlFocus.lineI--;
                htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
            } else {
                // delete one character
                htmlStrings[htmlFocus.lineI] = htmlStrings[htmlFocus.lineI].slice(
                    0,
                    -1
                );
                htmlFocus.charI--;
            }
        }
        clearInterval(htmlFocus.interval);
        clearTimeout(htmlFocus.timeout);
        htmlFocus.caret = true;
        htmlFocus.timeout = setTimeout(function () {
            htmlFocus.interval = setInterval(function () {
                htmlFocus.caret = !htmlFocus.caret;
                renderHtmlCanvas();
            }, 500);
        }, 500);
        renderHtmlCanvas();
    }
});

//  focus on a certain line
htmlCanvas.addEventListener("click", function (event) {
    let coords =
        htmlScreeningCords.find(
            (value) =>
                value[0] < event.layerY + Math.abs(htmlCurrentScroll) &&
                value[1] > event.layerY + Math.abs(htmlCurrentScroll)
        ) || 0;
    //if clicked at the empty spot of the canvas, focus on the last line
    if (htmlScreeningCords.indexOf(coords) !== -1) {
        htmlFocus.lineI = htmlScreeningCords.indexOf(coords);
    } else {
        htmlFocus.lineI = htmlScreeningCords.length - 1;
    }
    htmlFocus.charI = htmlStrings[htmlFocus.lineI].length;
    htmlFocus.status = true;
    htmlFocus.caret = true;
    clearInterval(htmlFocus.interval);
    clearTimeout(htmlFocus.timeout);
    htmlFocus.interval = setInterval(function () {
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
