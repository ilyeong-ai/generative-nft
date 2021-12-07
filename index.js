const { createCanvas, loadImage } = require("canvas");
const { Chess } = require("chess.js");
const getBlurredProgression = require("./utils/getBlurredProgression");
const {
	saveImageFromCanvas,
	saveImageFromBuffer,
} = require("./utils/saveImage");
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
		const pgn = `1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.a4 Bb7
9.d3 d6 10.Nc3 Na5 11.Ba2 b4 12.Ne2 Rb8 13.Ng3 c5 14.Nd2 Bc8 15.Nc4 Bg4 16.f3 Be6
17.Nxa5 Qxa5 18.Bc4 Nd7 19.b3 Nb6 20.Rb1 Rbd8 21.Qe2 d5 22.exd5 Nxd5 23.Bd2 f6
24.f4 Bd6 25.f5 Bf7 26.Qg4 Kh8 27.Re4 Qb6 28.Kh1 Qb7 29.Rbe1 Rfe8 30.Qh4 Bf8
31.Nf1 Nb6 32.Bxf7 Qxf7 33.Be3 Nd5 34.Bg1 Nc3 35.Rc4 Rd4 36.Bxd4 exd4 37.Rxc3 bxc3
38.Re4 Bd6 39.h3 Kg8 40.Nh2 Bxh2 41.Kxh2 Qc7+ 42.Kg1 Re5 43.Qf4 Qe7 44.Kf2 Rxe4
45.dxe4 g5 46.fxg6 hxg6 47.Ke2 f5 48.e5 Qb7 49.Qg5 Qe4+ 50.Kd1 Qc6 51.h4 f4
52.Qxf4 a5 53.Qg4 Kf7 54.Ke2 Qa6+ 55.Kf2 Qe6 56.Qe4 Qf5+ 57.Qxf5+ gxf5 58.h5 d3
59.h6 dxc2 60.e6+ Kxe6 61.h7 c1=Q 62.h8=Q Qd2+ 63.Kg3 Qe3+  0-1`;
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
