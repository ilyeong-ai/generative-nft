const fs = require("fs");
const Jimp = require('jimp');
const { Chess } = require('chess.js');
const { createCanvas, loadImage } = require('canvas')

function fromCoordinate(s) {
    let xc = { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8 }
    let yc = { '8': 1, '7': 2, '6': 3, '5': 4, '4': 5, '3': 6, '2': 7, '1': 8 }
    x = 67.5 + (xc[s[0]] - 1) * 135
    y = 67.5 + (yc[s[1]] - 1) * 135
    return { x, y }
}


function drawpath(pa, ctx){
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
}

async function blur(input, output, blurlevel) {
    const image = await Jimp.read(`${input}.png`);
    image.blur(blurlevel)
        .write(`./${output}.png`);
}
async function blurImage(input, blurlevel) {
    const image = await Jimp.read(input);
    return image.blur(blurlevel);
}

const drawLayer = async (ctx,imgname, x, y, w, h ) => {
    const image = await loadImage(`${imgname}.png`);
    ctx.drawImage(image, x, y, w, h);
}

const saveimage = (_canvas, filename) => {
    fs.writeFileSync(`${filename}.png`, _canvas.toBuffer("image/png"));
};

// takes pgn, x, y, width and puts it on canvas
function printAtWordWrap( context , text, x, y, lineHeight, fitWidth)
{
    fitWidth = fitWidth || 0;
    
    if (fitWidth <= 0)
    {
        context.fillText( text, x, y );
        return;
    }
    var words = text.split(' ');
    var currentLine = 0;
    var idx = 1;
    while (words.length > 0 && idx <= words.length)
    {
        var str = words.slice(0,idx).join(' ');
        var w = context.measureText(str).width;
        if ( w > fitWidth )
        {
            if (idx==1)
            {
                idx=2;
            }
            context.fillText( words.slice(0,idx-1).join(' '), x, y + (lineHeight*currentLine) );
            currentLine++;
            words = words.splice(idx-1);
            idx = 1;
        }
        else
        {idx++;}
    }
    if  (idx > 0)
        context.fillText( words.join(' '), x, y + (lineHeight*currentLine) );
}

scheme = {
    "w":
        { 'p': '#89D72C', 'q': '#FB0054', 'k': '#1D3D18', 'n': '#6378EB', 'b': '#B0109C', 'r': '#DA804D' },
    "b":
        { 'p': '#B3CC7D', 'q': '#7623A8', 'k': '#6D51EE', 'n': '#F229A8', 'b': '#F0797E', 'r': '#838B2E' }
}



const main = async () =>{
    const chess = new Chess()

    const canvas = createCanvas(1080, 1080)
    const ctx = canvas.getContext('2d')

    var pgn = `1. e4 e5
    2. Qh5 Nc6
    3. Bc4 Nf6??
    4. Qxf7#`

    chess.load_pgn(pgn)

    let pa = chess.history({ verbose: true })

    await drawpath(pa, ctx);
    saveimage(canvas, "path")
    
    const pathBuffer  = canvas.toBuffer("image/png")

    console.log(pathBuffer)
    Jimp.read(pathBuffer)
        .then(image => {
            const blurredWithVariable = image.blur(40);
            fs.writeFileSync(`./output/blurredWithVariable.png`, blurredWithVariable);
        })
        .catch(err => {
            console.log("ERRORRRR",err);
        });

    // const blurredWithVariable = await blurImage(path,40)
    
    // await blur("path", "blur", 40);

    // ctx.clearRect(0, 0, 1080, 1080);

    // await drawLayer(ctx,"blur", 28,28,224,224);

    // saveimage(canvas, "inter");
}
main();
