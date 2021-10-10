


let htmlCanvas = document.querySelector("#html-input-canvas")
let cssCanvas = document.querySelector("#css-input-canvas")
let jsCanvas = document.querySelector("#js-input-canvas")


let hC = htmlCanvas.getContext("2d")
let cC = cssCanvas.getContext("2d")
let jC = jsCanvas.getContext("2d")
let htmlScreeningCords = []

reset()

function reset() {
    let {width, height} = htmlCanvas.getClientRects()[0]
    htmlCanvas.width = width;
    htmlCanvas.height = height;
    renderCanvases()
}
window.addEventListener("resize", reset)
function renderCanvases(mousecords) {
    htmlScreeningCords.length = 0;
    hC.font = "18px Verdana"

    for (let i = 1; i < 20; i++) {
        hC.fillStyle = "#fff"
        if (i < 10) {
            hC.fillText(i, 20, 25*i)
        }else {
            hC.fillText(i, 10, 25*i)
        }
        htmlScreeningCords.push([25*i-9 - 10, 25*i + 10])
    }
}

htmlCanvas.addEventListener('click', function(event) {
    reset()
    hC.fillStyle = "#ffffff50"
    // hC.fillRect(5, event.layerY, htmlCanvas.width,25)
    let coords = htmlScreeningCords.find(value => value[0] < event.layerY && value[1] > event.layerY) || 0;
    hC.fillRect(5, coords[0], htmlCanvas.width - 10, 25)
})