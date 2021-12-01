const fs = require("fs");
const Jimp = require('jimp');
const { Chess } = require('chess.js')
const chess = new Chess()

chess.load_pgn(`1. e4 e5
2. Qh5 Nc6
3. Bc4 Nf6??
4. Qxf7#`)

let pa = chess.history({ verbose: true })
scheme = {
    "w":
        { 'p': '#89D72C', 'q': '#FB0054', 'k': '#1D3D18', 'n': '#6378EB', 'b': '#B0109C', 'r': '#DA804D' },
    "b":
        { 'p': '#B3CC7D', 'q': '#7623A8', 'k': '#6D51EE', 'n': '#F229A8', 'b': '#F0797E', 'r': '#838B2E' }
}
const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(1080, 1080)
const ctx = canvas.getContext('2d')
const ctxf = canvas.getContext('2d')

const saveLayer = (_canvas) => {
    fs.writeFileSync(`edited.png`, _canvas.toBuffer("image/png"));
};
function fromCoordinate(s) {
    let xc = { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8 }
    let yc = { '8': 1, '7': 2, '6': 3, '5': 4, '4': 5, '3': 6, '2': 7, '1': 8 }
    x = 67.5 + (xc[s[0]] - 1) * 135
    y = 67.5 + (yc[s[1]] - 1) * 135
    return { x, y }
}
loadImage('chess1.png').then((image) => {
//    ctx.drawImage(image, 0, 0, 1080, 1080);

    for (let i = 0; i < pa.length; i++) {
        let { from, to, color, piece } = pa[i];
        from = fromCoordinate(from)
        to = fromCoordinate(to)
        color = scheme[color][piece]

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 50;
        ctx.stroke();
    }
    saveLayer(canvas);

    async function main() {
        const image = await Jimp.read('./edited.png');
        image.blur(40)
            .write('blur.png');
    }
    main();
    console.log('Image Processing Completed');

    
})


loadImage('chess1.png').then((image) => {
    ctxf.drawImage(image, 0, 0, 1080, 1080);       
})

loadImage('blur.png').then((image) => {
    ctxf.drawImage(image, 0, 0, 1080, 1080); 
    saveLayer(canvas);      
})






