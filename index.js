const { createCanvas, loadImage } = require("canvas");
const { Chess } = require("chess.js");
const getBlurredProgression = require("./utils/getBlurredProgression");
const {
	saveImageFromCanvas,
	saveImageFromBuffer,
} = require("./utils/saveImage");
const printWordWrap = require("./utils/printWordWrap");
const { convert } = require("convert-svg-to-png");

const drawLayer = async (ctx, image, x, y, w, h) => {
	ctx.drawImage(image, x, y, w, h);
};

function getSVGFromText(
	text,
	{ fontSize, width, height, lineHeight = 19, color, fontFamily }
) {
	return `
		<svg xmlns='http://www.w3.org/2000/svg' width=${width} height=${height}>
			<foreignObject width='100%' height='100%'>
				<div xmlns='http://www.w3.org/1999/xhtml' 
				style='font-size:${fontSize}px; text-align:justify;
				line-height:${lineHeight}px; color:${color};
				font-family:${fontFamily};'>
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

	// frame2Ctx.fillStyle = "#FFFFFF";
	// frame2Ctx.rect(0, 0, 1080, 1080);
	// frame2Ctx.fill();

	loadImage(progressionLayerBuffer)
		.then(async (progressionLayer) => {
			await frameCtx.drawImage(progressionLayer, 28, 28, 224, 224);
			// saveImageFromCanvas(frame, "layout");
		})
		.catch((err) => {
			console.log(err);
		});

	loadImage("./inputs/knight-bg.png")
		.then(async (mask) => {
			await frame2Ctx.drawImage(mask, 0, 0);
			// saveImageFromCanvas(frame2, "mask");
			frame2Ctx.globalCompositeOperation = "source-in";
			loadImage("./output/progressionLayer.png").then(async (pieceMask) => {
				await frame2Ctx.drawImage(pieceMask, 0, 0);
				saveImageFromCanvas(frame2, "pieceMask");
			});
		})
		.catch((err) => {
			console.log(err);
		});

	const smallPgnTextSVG = getSVGFromText(pgn, {
		fontSize: 16,
		width: 224,
		height: 780,
		lineHeight: 19,
		color: "#979393",
		fontFamily: "Roboto, sans-serif",
	});
	const smallPgnTextImageBuffer = await convert(smallPgnTextSVG);

	loadImage(smallPgnTextImageBuffer).then(async (img) => {
		await frameCtx.drawImage(img, 28, 272, 224, 780);
	});

	const bgPgnTextSVG = getSVGFromText(pgn, {
		fontSize: 78,
		width: 760,
		height: 1027,
		lineHeight: 104,
		color: "#e3dddd",
		fontFamily: "Noto Serif, serif",
	});
	const bgPgnTextImageBuffer = await convert(bgPgnTextSVG);

	loadImage(bgPgnTextImageBuffer).then(async (img) => {
		await frameCtx.drawImage(img, 280, 22, 760, 1027);
		// saveImageFromCanvas(frame, "textAdded");
	});

	loadImage("./inputs/knight-bg.png")
		.then(async (knightbg) => {
			await frameCtx.drawImage(knightbg, 263, 263, 780, 780);
			// saveImageFromCanvas(frame, "withk");
		})
		.catch((err) => {
			console.log(err);
		});

	loadImage("./output/pieceMask.png")
		.then(async (knight) => {
			await frameCtx.drawImage(knight, 263, 263, 780, 780);
			// saveImageFromCanvas(frame, "withk");
		})
		.catch((err) => {
			console.log(err);
		});

	loadImage("./inputs/knight-fg.png")
		.then(async (knightfg) => {
			await frameCtx.drawImage(knightfg, 263, 263, 780, 780);
			saveImageFromCanvas(frame, "finalNFT");
		})
		.catch((err) => {
			console.log(err);
		});
};
main();
