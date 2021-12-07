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
		const pgn = `1. Nf3 Nf6 2. b3 g6 3. Bb2 Bg7 4. g3 d6 5. Bg2 O-O 6. O-O c6 7. d3 e5 8. c4 Ne8 9. Nbd2 f5 10. Qc2 Na6 11. c5 Nxc5 12. Nxe5 Qe7 13. d4 Na6 14. Qc4+ Kh8 15. Nef3 Be6 16. Qc3 f4 17. gxf4 Rxf4 18. Qe3 Rf8 19. Ng5 Nec7 20. Nc4 Rae8 21. Nxe6 Qxe6 22. Qxe6 Rxe6 23. e3 d5 24. Ne5 g5 25. Ba3 Rff6 26. Bh3 Re8 27. Bd7 Rd8 28. Be7 Rxd7 29. Bxf6 1-0`;
		chess.load_pgn(pgn);
		let ph = chess.history({ verbose: true });
		const lmPiece = ph[ph.length - 1].piece;

		const progressionLayerBuffer = await getBlurredProgression(pgn);
		// saveImageFromBuffer(progressionLayerBuffer, "progressionLayer");

		const frame = createCanvas(1080, 1080);
		const frameCtx = frame.getContext("2d");
		const frame2 = createCanvas(1080, 1080);
		const frame2Ctx = frame2.getContext("2d");

		frameCtx.fillStyle = "#FCF5F5";
		frameCtx.rect(0, 0, 1080, 1080);
		frameCtx.fill();

		let progressionLayer = await loadImage(progressionLayerBuffer);
		frameCtx.drawImage(await progressionLayer, 28, 28, 224, 224);

		let mask = await loadImage(`./inputs/${lmPiece}_bg.png`);
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
			color: "#979393",
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
			color: "#e3dddd",
			fontFamily: "Noto Serif, serif",
		});
		const bgPgnTextImageBuffer = await convert(bgPgnTextSVG);

		img = loadImage(bgPgnTextImageBuffer);
		frameCtx.drawImage(await img, 280, 22, 760, 1027);

		let knightbg = loadImage(`./inputs/${lmPiece}_bg.png`);
		frameCtx.drawImage(await knightbg, 263, 263, 780, 780);

		let knight = await loadImage(frame2.toBuffer("image/png"));
		frameCtx.drawImage(await knight, 263, 263, 780, 780);

		let knightfg = loadImage(`./inputs/${lmPiece}_fg.png`);
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
