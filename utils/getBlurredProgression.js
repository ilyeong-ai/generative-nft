const { createCanvas } = require("canvas");
const { Chess } = require("chess.js");
const Jimp = require("jimp");

const getBlurredProgression = async (pgn) => {
	const chess = new Chess();

	const canvas = createCanvas(1080, 1080);
	const ctx = canvas.getContext("2d");

	chess.load_pgn(pgn);
	let winColor = pgn.slice(pgn.length - 3, pgn.length);
	let pa = chess.history({ verbose: true });
	// console.log(winColor);
	await drawPath(pa, ctx);
	const pathBuffer = canvas.toBuffer("image/png");
	const pathImage = await Jimp.read(pathBuffer);

	const blurredPath = pathImage.blur(40);

	const blurredPathBuffer = await blurredPath.getBufferAsync(Jimp.MIME_PNG);
	return blurredPathBuffer;
};

const drawPath = async (pa, ctx) => {
	for (let i = 0; i < pa.length; i++) {
		let { from, to, color, piece } = pa[i];
		from = fromCoordinate(from);
		to = fromCoordinate(to);
		color = scheme[color][piece];

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.strokeStyle = color;
		ctx.lineWidth = 50;
		ctx.stroke();
	}
};

const fromCoordinate = (s) => {
	let xc = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 };
	let yc = { 8: 1, 7: 2, 6: 3, 5: 4, 4: 5, 3: 6, 2: 7, 1: 8 };
	// let xc = { h: 1, g: 2, f: 3, e: 4, d: 5, c: 6, b: 7, a: 8 };
	// let yc = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 };
	x = 67.5 + (xc[s[0]] - 1) * 135;
	y = 67.5 + (yc[s[1]] - 1) * 135;
	return { x, y };
};
module.exports = getBlurredProgression;
