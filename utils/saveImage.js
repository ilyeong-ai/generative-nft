const fs = require("fs");

const saveImageFromCanvas = (_canvas, filename) => {
	fs.writeFileSync(`./output/${filename}.png`, _canvas.toBuffer("image/png"));
};
const saveImageFromBuffer = (img, filename) => {
	fs.writeFileSync(`./output/${filename}.png`, img);
};

module.exports = { saveImageFromCanvas, saveImageFromBuffer };
