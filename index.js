const { createCanvas, loadImage } = require("canvas");
const { Chess } = require("chess.js");
const getBlurredProgression = require("./utils/getBlurredProgression");
const {
	saveImageFromCanvas,
	saveImageFromBuffer,
} = require("./utils/saveImage");
const printWordWrap = require("./utils/printWordWrap");

const { svg2png } = require("svg-png-converter");

const drawLayer = async (ctx, image, x, y, w, h) => {
	ctx.drawImage(image, x, y, w, h);
};

function getSVG(text, fontSize, width, height) {
	return `
	<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns='http://www.w3.org/2000/svg' width=${width} height=${height}>
			<foreignObject width='100%' height='100%'>
				<div xmlns='http://www.w3.org/1999/xhtml' style='font-size:${fontSize}px; text-align:justify'>
				${text}
				</div>
			</foreignObject>
		</svg>`;
}

scheme = {
	w: {
		p: "#89D72C",
		q: "#FB0054",
		k: "#1D3D18",
		n: "#6378EB",
		b: "#B0109C",
		r: "#DA804D",
	},
	b: {
		p: "#B3CC7D",
		q: "#7623A8",
		k: "#6D51EE",
		n: "#F229A8",
		b: "#F0797E",
		r: "#838B2E",
	},
};

const main = async () => {
	const pgn = `1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 g6 5.Bc4 Nb6 6.Bb3 Bg7 7.Qe2 Nc6 8.O-O O-O 9.h3 a5 10.a4 dxe5 11.dxe5 Nd4 12.Nxd4 Qxd4 13.Re1 e6 14.Nd2 Nd5 15.Nf3 Qc5 16.Qe4 Qb4 17.Bc4 Nb6 18.b3 Nxc4 19.bxc4 Re8 20.Rd1 Qc5 21.Qh4 b6 22.Be3 Qc6 23.Bh6 Bh8 24.Rd8 Bb7 25.Rad1 Bg7 26.R8d7 Rf8 27.Bxg7 Kxg7 28.R1d4 Rae8 29.Qf6+ Kg8 30.h4 h5 31.Kh2 Rc8 32.Kg3 Rce8 33.Kf4 Bc8 34.Kg5 1-0`;

	const progressionLayerBuffer = await getBlurredProgression(pgn);
	saveImageFromBuffer(progressionLayerBuffer, "progressionLayer");

	const frame = createCanvas(1080, 1080);
	const frameCtx = frame.getContext("2d");
	const frame2 = createCanvas(1080, 1080);
	const frame2Ctx = frame2.getContext("2d");

	frameCtx.fillStyle = "#FCF5F5";
	frameCtx.rect(0, 0, 1080, 1080);
	frameCtx.fill();

	frame2Ctx.fillStyle = "#FFFFFF";
	frame2Ctx.rect(0, 0, 1080, 1080);
	frame2Ctx.fill();

	loadImage(progressionLayerBuffer)
		.then(async (progressionLayer) => {
			await frameCtx.drawImage(progressionLayer, 28, 28, 224, 224);
			saveImageFromCanvas(frame, "layout");
		})
		.then(async () => {
			await printWordWrap(frameCtx, pgn, 28, 272, 22, 224, 16, "#979393");
			await printWordWrap(frameCtx, pgn, 294, 100, 108, 760, 79, "#E3DDDD");
			saveImageFromCanvas(frame, "layout2");
		})
		.catch((err) => {
			console.log(err);
		});

	const smallPgnTextSVG = getSVG(pgn, 16);
	const pgn_m = svg2png({
		input: smallPgnTextSVG,
		encoding: "buffer",
		format: "png",
	});

	// alt_2var
	// const image = await loadImage(`./inputs/knight-bg.png`);
	// frame2Ctx.drawImage(image, 0, 0);
	// frame2Ctx.globalCompositeOperation = "source-in";
	// const image2 = await loadImage(`./output/progressionLayer.png`);
	// frame2Ctx.drawImage(image2, 0, 0);
	// saveImageFromCanvas(frame2, "piece");
};
main();
