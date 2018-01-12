function computeDialsWidth(columnCount, dialWidth, betweenDials) {
    return (dialWidth * columnCount) - betweenDials;
}

function computeRows(tileCount, columnCount) {
    return Math.ceil(tileCount / columnCount);
}

function computeDialsHeight(itemCount, columnCount, dialHeight) {
    return dialHeight * computeRows(itemCount, columnCount);
}

function computeColumns(dialWidth, widthToLeave) {
    const effectiveWidth = window.innerWidth - widthToLeave;
    // Minimum one tile
    return Math.max(Math.floor(effectiveWidth / dialWidth), 1);
}

function computeDialIndex(currentPos, columnCount, dialCount, dialWidth, dialHeight) {
    const columnPosition = Math.floor(currentPos.x / dialWidth);
    const rowPosition = Math.floor(currentPos.y / dialHeight);

    return Math.min(Math.max((rowPosition * columnCount) + columnPosition, 0), dialCount - 1);
}

function computeDialXPos(index, columnCount, dialWidth) {
    return dialWidth * (index % columnCount);
}

function computeDialYPos(index, columnCount, dialHeight) {
    return dialHeight * Math.floor(index / columnCount);
}

function nomalizePosX(posX, columnCount, dialWidth, betweenDials) {
    return Math.min(Math.max(posX, 0), computeDialsWidth(columnCount, dialWidth, betweenDials));
}

function nomalizePosY(posY, itemCount, columnCount, dialHeight) {
    return Math.min(Math.max(posY, 0), computeDialsHeight(itemCount, columnCount, dialHeight));
}

export default {
    computeDialsWidth,
    computeDialsHeight,
    computeColumns,
    computeRows,
    computeDialIndex,
    computeDialXPos,
    computeDialYPos,
    nomalizePosX,
    nomalizePosY,
};
