// takes pgn, x, y, width and puts it on canvas
function printAtWordWrap(
	context,
	text,
	x,
	y,
	lineHeight,
	fitWidth,
	fsize,
	clr
) {
	const memo = context.fillStyle;
	context.fillStyle = clr;
	context.font = `${fsize}px 'Serif'`;
	fitWidth = fitWidth || 0;

	if (fitWidth <= 0) {
		context.fillText(text, x, y);
		return;
	}
	var words = text.split(" ");
	var currentLine = 0;
	var idx = 1;
	while (words.length > 0 && idx <= words.length) {
		var str = words.slice(0, idx).join(" ");
		var w = context.measureText(str).width;
		if (w > fitWidth) {
			if (idx == 1) {
				idx = 2;
			}
			context.fillText(
				words.slice(0, idx - 1).join(" "),
				x,
				y + lineHeight * currentLine
			);
			currentLine++;
			words = words.splice(idx - 1);
			idx = 1;
		} else {
			idx++;
		}
	}
	if (idx > 0)
		context.fillText(words.join(" "), x, y + lineHeight * currentLine);
	context.fillStyle = memo;
}
module.exports = printAtWordWrap;
