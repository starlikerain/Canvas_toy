let canvas = document.getElementById("drawing-board")
let ctx = canvas.getContext("2d")
let eraser = document.getElementById("eraser")
let brush = document.getElementById("brush")
let reSetCanvas = document.getElementById("clear")
let aColorBtn = document.getElementsByClassName("color-item")
let save = document.getElementById("save")
let undo = document.getElementById("undo")
let range = document.getElementById("range")
let clear = false
let activeColor = "black"
let lWidth = 4
var ran = $("#range");

autoSetSize(canvas)

setCanvasBg("white")

listenToUser(canvas)

// getColor()
/**
 * 
 * @param {canvas} canvas 
 * 页面 resize 的时候调整 canvas 的大小
 */
function autoSetSize(canvas) {
    canvasSetSize()

    function canvasSetSize() {
        let pageWidth = document.documentElement.clientWidth
        let pageHeight = document.documentElement.clientHeight

        canvas.width = pageWidth
        canvas.height = pageHeight
    }

    window.onresize = function () {
        canvasSetSize()
    }
}

/**
 * 
 * @param {string} color 
 * 用户点击 clear 按钮的操作
 */
function setCanvasBg(color) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "black"
}

/**
 * 
 * @param {页面canvas DOM} canvas 
 * 监听用户 绘画的操作
 */
function listenToUser(canvas) {
    let painting = false
    let lastPoint = {
        x: undefined,
        y: undefined
    }

    if (document.body.ontouchstart !== undefined) {
        canvas.ontouchstart = function (e) {
            this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height) //在这里储存绘图表面
            saveData(this.firstDot)
            painting = true
            let x = e.touches[0].clientX
            let y = e.touches[0].clientY
            lastPoint = {
                "x": x,
                "y": y
            }
            ctx.save()
            drawCircle(x, y, 0)
        }
        canvas.ontouchmove = function (e) {
            if (painting) {
                let x = e.touches[0].clientX
                let y = e.touches[0].clientY
                let newPoint = {
                    "x": x,
                    "y": y
                }
                drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
                lastPoint = newPoint
            }
        }

        canvas.ontouchend = function () {
            painting = false
        }
    } else {
        canvas.onmousedown = function (e) {
            this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height) //在这里储存绘图表面
            saveData(this.firstDot)
            painting = true
            let x = e.clientX
            let y = e.clientY
            lastPoint = {
                "x": x,
                "y": y
            }
            ctx.save()
            drawCircle(x, y, 0)
        }
        canvas.onmousemove = function (e) {
            if (painting) {
                let x = e.clientX
                let y = e.clientY
                let newPoint = {
                    "x": x,
                    "y": y
                }
                drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, clear)
                lastPoint = newPoint
            }
        }

        canvas.onmouseup = function () {
            painting = false
        }

        canvas.mouseleave = function () {
            painting = false
        }
    }
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} radius 
 * 系统记录 绘画可能会有断层，用一定的弧度连接上去
 */
function drawCircle(x, y, radius) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    if (clear) {
        ctx.clip()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
    }
}
/**
 * 
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 * 默认 线段末端以『圆形』结束
 * 默认 2个长度不为0的相连部分『圆弧』连接
 */
function drawLine(x1, y1, x2, y2) {
    ctx.lineWidth = lWidth
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    if (clear) {
        ctx.save()
        ctx.globalCompositeOperation = "destination-out"
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.closePath()
        ctx.clip()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
    } else {
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.closePath()
    }
}

let historyData = []

function saveData(data) {
    historyData.push(data)
}

// 颜色选择
// function getColor() {
//     for (let i = 0; i < aColorBtn.length; i++) {
//         aColorBtn[i].onclick = function () {
//             for (let i = 0; i < aColorBtn.length; i++) {
//                 aColorBtn[i].classList.remove("active")
//                 this.classList.add("active")
//                 activeColor = this.style.backgroundColor
//                 ctx.fillStyle = activeColor
//                 ctx.strokeStyle = activeColor
//                 ran.css("box-shadow", `${activeColor} 0px 0px 30px 0px`);
//             }
//         }
//     }
// }

// ctx.fillStyle = "green";
// ctx.strokeStyle = "green";

window.onbeforeunload = function () {
    console.log('Okay~Okay, Just leave, Don\'t come back');
    return "1111?"
}

range.onchange = function () {
    console.log("range change")
    lWidth = this.value
}

eraser.onclick = function () {
    clear = true
    this.classList.add("active")
    brush.classList.remove("active")
}

brush.onclick = function () {
    clear = false
    this.classList.add("active")
    eraser.classList.remove("active")
}

reSetCanvas.onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCanvasBg("white")
}
save.onclick = function () {
    let imgUrl = canvas.toDataURL("image/png")
    let saveA = document.createElement("a")
    document.body.appendChild(saveA)
    saveA.href = imgUrl
    saveA.download = String((new Date).getTime());
    saveA.target = "_blank"
    saveA.click()
}
undo.onclick = function () {
    if (historyData.length < 1) return false
    ctx.putImageData(historyData[historyData.length - 1], 0, 0)
    historyData.pop()
}