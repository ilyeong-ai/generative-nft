const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { Chess } = require("chess.js");
const getBlurredProgression = require("./utils/getBlurredProgression");
const {
	saveImageFromCanvas,
	saveImageFromBuffer,
} = require("./utils/saveImage");
const printWordWrap = require("./utils/printWordWrap");
const { convert } = require("convert-svg-to-png");

const { NFTStorage, File } = require("nft.storage");

const apiKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdlOGM0QzAwODBDNDlDQUZiMzBmOWUxYmI4OUQ3NDZiNzk1MDEyNzYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzODg3MjM3OTI3OSwibmFtZSI6IlNoYXRyYW5qIn0.QpjDtGf0B3hEVj-hzEpfBCEO0uHv_zvSgo0WqvaM434";
const client = new NFTStorage({ token: apiKey });

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

const random_hex_color_code = () => {
	let n = (Math.random() * 0xfffff * 1000000).toString(16);
	return "#" + n.slice(0, 6);
};

scheme = {
	w: {
		p: random_hex_color_code(),
		q: random_hex_color_code(),
		k: random_hex_color_code(),
		n: random_hex_color_code(),
		b: random_hex_color_code(),
		r: random_hex_color_code(),
	},
	b: {
		p: random_hex_color_code(),
		q: random_hex_color_code(),
		k: random_hex_color_code(),
		n: random_hex_color_code(),
		b: random_hex_color_code(),
		r: random_hex_color_code(),
	},
};

const main = async () => {
	try {
		const chess = new Chess();
		const pgn = `1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 g6 5.Bc4 Nb6 6.Bb3 Bg7 7.Qe2 Nc6 8.O-O O-O 9.h3 a5 10.a4 dxe5 11.dxe5 Nd4 12.Nxd4 Qxd4 13.Re1 e6 14.Nd2 Nd5 15.Nf3 Qc5 16.Qe4 Qb4 17.Bc4 Nb6 18.b3 Nxc4 19.bxc4 Re8 20.Rd1 Qc5 21.Qh4 b6 22.Be3 Qc6 23.Bh6 Bh8 24.Rd8 Bb7 25.Rad1 Bg7 26.R8d7 Rf8 27.Bxg7 Kxg7 28.R1d4 Rae8 29.Qf6+ Kg8 30.h4 h5 31.Kh2 Rc8 32.Kg3 Rce8 33.Kf4 Bc8 34.Kg5 0-1`;
		chess.load_pgn(pgn);
		let ph = chess.history({ verbose: true });
		const lmPiece = ph[ph.length - 1].piece;
		const whiteORblack = pgn.slice(-1);
		// console.log(whiteORblack);

		const progressionLayerBuffer = await getBlurredProgression(pgn);
		// saveImageFromBuffer(progressionLayerBuffer, "progressionLayer");

		const frame = createCanvas(1080, 1080);
		const frameCtx = frame.getContext("2d");
		const frame2 = createCanvas(1080, 1080);
		const frame2Ctx = frame2.getContext("2d");

		if (whiteORblack == "0") {
			frameCtx.fillStyle = "#FCF5F5";
			frameCtx.rect(0, 0, 1080, 1080);
			frameCtx.fill();
		} else {
			frameCtx.fillStyle = "#353842";
			frameCtx.rect(0, 0, 1080, 1080);
			frameCtx.fill();
		}

		let progressionLayer = await loadImage(progressionLayerBuffer);
		frameCtx.drawImage(await progressionLayer, 28, 28, 224, 224);

		let mask = await loadImage(`./inputs/${lmPiece}_bg_${whiteORblack}.png`);
		frame2Ctx.drawImage(await mask, 0, 0);
		frame2Ctx.globalCompositeOperation = "source-in";
		let pieceMask = progressionLayer;
		frame2Ctx.drawImage(await pieceMask, 0, 0);
		// saveImageFromCanvas(frame2, "pieceMask");

		const smallPgnTextSVG = getSVGFromText(pgn, {
			fontSize: 16,
			width: 224,
			height: 780,
			lineHeight: 19,
			color: whiteORblack === "0" ? "#979393" : "#D0CBCE",
			fontFamily: "Roboto, sans-serif",
		});
		const smallPgnTextImageBuffer = await convert(smallPgnTextSVG);

		let img = loadImage(smallPgnTextImageBuffer);
		frameCtx.drawImage(await img, 28, 272, 224, 780);

		const bgPgnTextSVG = getSVGFromText(pgn, {
			fontSize: 78,
			width: 760,
			height: 1027,
			lineHeight: 104,
			color: whiteORblack === "0" ? "#E3DDDD" : "#505568",
			fontFamily: "Noto Serif, serif",
		});
		const bgPgnTextImageBuffer = await convert(bgPgnTextSVG);

		img = loadImage(bgPgnTextImageBuffer);
		frameCtx.drawImage(await img, 280, 22, 760, 1027);

		let knightbg = loadImage(`./inputs/${lmPiece}_bg_${whiteORblack}.png`);
		frameCtx.drawImage(await knightbg, 263, 263, 780, 780);

		let knight = await loadImage(frame2.toBuffer("image/png"));
		frameCtx.drawImage(await knight, 263, 263, 780, 780);

		let knightfg = loadImage(`./inputs/${lmPiece}_fg_${whiteORblack}.png`);
		frameCtx.drawImage(await knightfg, 263, 263, 780, 780);
		const NFT = frame.toBuffer("image/png");
		// saveImageFromCanvas(frame, "NFT");

		const metadata = await client.store({
			name: "GAME",
			description: pgn,
			image: new File([NFT], "gameid.png", { type: "image/png" }),
		});
		console.log(metadata.url);
	} catch (error) {
		console.log(error);
	}
};
main();
