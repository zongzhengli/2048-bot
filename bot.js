(function () {

    // Constants
    var GRID_SIZE = 4;
    var PROB_2 = 0.9;
    var MOVE_UP = {
        drow: -1,
        dcol: 0,
        dir: 0,
        keyCode: 38,
        key: 'Up'
    };
    var MOVE_DOWN = {
        drow: 1,
        dcol: 0,
        dir: 1,
        keyCode: 40,
        key: 'Down'
    };
    var MOVE_LEFT = {
        drow: 0,
        dcol: -1,
        dir: 0,
        keyCode: 37,
        key: 'Left'
    };
    var MOVE_RIGHT = {
        drow: 0,
        dcol: 1,
        dir: 1,
        keyCode: 39,
        key: 'Right'
    };

    //*
    setInterval(function () {
        nextMove();
    }, 50);
    /*/
    nextMove();
    //*/

    var games = 0;
    var bestScore = 0;
    var averageScore = 0;
    var bestLargestTile = 0;
    var averageLargestTile = 0;

    setInterval(function () {
        if (isGameOver()) {
            var score = getScore();
            bestScore = Math.max(bestScore, score);

            var tileList = getTileList();
            var largestTile = 0;
            for (var i = 0 ; i < tileList.length; i++)
                largestTile = Math.max(largestTile, tileList[i].num);
            bestLargestTile = Math.max(bestLargestTile, largestTile);

            averageScore = (averageScore * games + score) / (games + 1);
            averageLargestTile = (averageLargestTile * games + largestTile) / (games + 1);
            games++;

            console.log('Game                   ' + games + '\n' +
                        'Score                  ' + score + '\n' +
                        'Largest tile           ' + largestTile + '\n' +
                        'Average score          ' + Math.round(averageScore) + '\n' +
                        'Average largest tile   ' + Math.round(averageLargestTile) + '\n' +
                        'Best score             ' + bestScore + '\n' +
                        'Best largest tile      ' + bestLargestTile + '\n' +
                        '\n');
            retry();
        }
    }, 1000);

    // Chooses the next move.
    function nextMove() {
        var tileList = getTileList();
        var tileGrid = new Array(GRID_SIZE * GRID_SIZE);
        for (var i = 0; i < tileGrid.length; i++) {
            tileGrid[i] = 0;
        }
        for (var i = 0; i < tileList.length; i++) {
            var tile = tileList[i];
            set(tileGrid, tile.row, tile.col, tile.num);
        }

        var move = search(tileGrid, 2, true);

        //*
        pressKey(move);
        /*/
        print(tileGrid);
        evaluate(tileGrid, true);
        //*/
    }

    function search(tileGrid, depth, root) {
        if (depth <= 0)
            return evaluate(tileGrid);

        var MOVE_ITERATIONS = 10;
        var moves = [ MOVE_LEFT, MOVE_UP, MOVE_RIGHT, MOVE_DOWN ];
        var beta = Number.NEGATIVE_INFINITY;
        var betaMove = MOVE_LEFT;

        for (var i = 0; i < moves.length; i++) {
            var copyGrid = copy(tileGrid);
            var move = moves[i];

            if (make(copyGrid, move)) {
                var value = search(copyGrid, depth - 1);

                for (var k = 1; k < MOVE_ITERATIONS; k++) {
                    var copyGrid = copy(tileGrid);
                    make(copyGrid, move);
                    //value = (value * k + search(copyGrid, depth - 1)) / (k + 1);
                    value = Math.min(value, search(copyGrid, depth - 1));
                }

                if (value > beta) {
                    beta = value;
                    betaMove = move;
                }
            }

        }

        return root ? betaMove : beta;
    }

    function evaluate(tileGrid, printComponents) {
        var EDGE_WEIGHT = 1;
        var NUM_EMPTY_WEIGHT = 1;
        var ADJ_WEIGHT = 0.1;
        var ADJ_DIFF_WEIGHT = -0.5;
        var INSULATION_WEIGHT = -10;

        var value = 0;

        var numEmpty = 0;
        /*
        for (var r = 0; r < GRID_SIZE; r++) {
            for (var c = 0; c < GRID_SIZE; c++) {
                var tileNum = get(tileGrid, r, c);
                if (tileNum) {
                    var dist = Math.pow(r - center, 2) + Math.pow(c - center, 2);
                    distValue += dist * tileNum;

                    if (tileNum > largest.num) {
                        second = largest;
                        largest = {
                            num: tileNum,
                            row: r,
                            col: c
                        }
                    }
                    else if (tileNum > second.num) {
                        second = {
                            num: tileNum,
                            row: r,
                            col: c
                        }
                    }
                }
                else numEmpty++;
            }
        }
        //*/

        var edgeValue = 0;
        for (var i = 0; i < GRID_SIZE; i++) {
            var tileNum = get(tileGrid, i, 0);
            if (tileNum)
                edgeValue += tileNum;

            tileNum = get(tileGrid, i, GRID_SIZE - 1);
            if (tileNum)
                edgeValue += tileNum;

            tileNum = get(tileGrid, 0, i);
            if (tileNum)
                edgeValue += tileNum;

            tileNum = get(tileGrid, GRID_SIZE - 1, i);
            if (tileNum)
                edgeValue += tileNum;
        }

        var numEmptyValue = numEmpty;

        var adjValue = 0;
        var adjDiffValue = 0;
        var insulationValue = 0;

        for (var r = 0; r < GRID_SIZE; r++) {
            for (var c = 0; c < GRID_SIZE; c++) {
                var tileNum = get(tileGrid, r, c);
                if (tileNum) {
                    if (inBounds(r, c + 1)) {
                        var adjNum = get(tileGrid, r, c + 1);
                        if (adjNum) {
                            adjValue += tileNum + adjNum;
                            adjDiffValue += levelDifference(tileNum, adjNum);

                            if (inBounds(r, c + 2)) {
                                var thirdNum = get(tileGrid, r, c + 2);
                                if (thirdNum && levelDifference(tileNum, thirdNum) <= 1) {
                                    var averageNum = (tileNum + thirdNum) / 2;
                                    insulationValue += levelDifference(averageNum, adjNum) * Math.log(averageNum);
                                }
                            }
                        }
                    }

                    if (inBounds(r + 1, c)) {
                        adjNum = get(tileGrid, r + 1, c);
                        if (adjNum) {
                            adjValue += tileNum + adjNum;
                            adjDiffValue += levelDifference(tileNum, adjNum);

                            if (inBounds(r + 2, c)) {
                                var thirdNum = get(tileGrid, r + 2, c);
                                if (thirdNum && levelDifference(tileNum, thirdNum) <= 1) {
                                    var averageNum = (tileNum + thirdNum) / 2;
                                    insulationValue += levelDifference(averageNum, adjNum) * Math.log(averageNum);
                                }
                            }
                        }
                    }
                }
            }
        }

        value += EDGE_WEIGHT * edgeValue;
        value += NUM_EMPTY_WEIGHT * numEmptyValue;
        value += ADJ_WEIGHT * adjValue;
        value += ADJ_DIFF_WEIGHT * adjDiffValue;
        value += INSULATION_WEIGHT * insulationValue;

        if (printComponents) {
            console.log('EVALUATION     ' + value + '\n' +
                        '  edge         ' + (EDGE_WEIGHT * edgeValue) + '\n' +
                        '  numEmpty     ' + (NUM_EMPTY_WEIGHT * numEmptyValue) + '\n' +
                        '  adj          ' + (ADJ_WEIGHT * adjValue) + '\n' +
                        '  adjDiff      ' + (ADJ_DIFF_WEIGHT * adjDiffValue) + '\n' +
                        '  insulation   ' + (INSULATION_WEIGHT * insulationValue) + '\n'
            );
        }

        return value;
    }

    function levelDifference(num1, num2) {
        var ratio = Math.max(num1 / num2, num2 / num1);
        return Math.log(ratio) * 1.44269504;
    }

    function get(grid, row, col) {
        return grid[row * GRID_SIZE + col];
    }

    function set(grid, row, col, value) {
        grid[row * GRID_SIZE + col] = value;
    }

    function print(grid) {
        function pad(str, len) {
            len -= str.length;
            while (len-- > 0)
                str = ' ' + str;
            return str;
        }

        var result = '';
        for (var r = 0; r < GRID_SIZE; r++) {
            for (var c = 0; c < GRID_SIZE; c++) {
                var tileNum = get(grid, r, c);
                result += tileNum ? pad(tileNum + '', 5) : '    .';
            }
            result += '\n';
        }
        console.log(result);
    }

    function copy(grid) {
        return grid.slice();
    }

    function inBounds(row, col) {
        return 0 <= row && row < GRID_SIZE && 0 <= col && col < GRID_SIZE;
    }

    function make(tileGrid, move) {
        var start = move.dir * (GRID_SIZE - 1);
        var end = (1 - move.dir) * (GRID_SIZE + 1) - 1;
        var inc = 1 - 2 * move.dir;

        var anyMoved = false;

        for (var r = start; r != end; r += inc) {
            for (var c = start; c != end; c += inc) {
                if (get(tileGrid, r, c)) {
                    var newr = r + move.drow;
                    var newc = c + move.dcol;
                    var oldr = r;
                    var oldc = c;

                    while (inBounds(newr, newc)) {
                        var target = get(tileGrid, newr, newc);
                        var value = get(tileGrid, oldr, oldc);
                        if (!target) {
                            set(tileGrid, newr, newc, value);
                            set(tileGrid, oldr, oldc, 0);
                            anyMoved = true;
                        }
                        else if (target === value) {
                            set(tileGrid, newr, newc, -2 * value);
                            set(tileGrid, oldr, oldc, 0);
                            anyMoved = true;
                            break;
                        }
                        oldr = newr;
                        oldc = newc;
                        newr += move.drow;
                        newc += move.dcol;
                    }
                }
            }
        }

        if (!anyMoved)
            return false;

        var numEmpty = 0;
        for (var i = 0; i < tileGrid.length; i++) {
            if (tileGrid[i] < 0)
                tileGrid[i] *= -1;
            else if (!tileGrid[i])
                numEmpty++;
        }
        if (numEmpty === 0)
            return false;

        for (var i = 0; i < tileGrid.length; i++) {
            if (!tileGrid[i]) {
                var p = 1 / numEmpty;
                if (Math.random() < p) {
                    tileGrid[i] = Math.random() < PROB_2 ? 2 : 4;
                    return true;
                }
                else numEmpty--;
            }
        }
    }

    function getTileList() {
        var tileContainer = document.getElementsByClassName('tile-container')[0];
        var list = [];

        for (var i = 0 ; i < tileContainer.children.length; i++) {
            var tile = tileContainer.children[i];
            var tileInner = tile.children[0];
            var num = parseInt(tileInner.innerHTML);

            var className = tile.className;
            var positionPrefix = 'tile-position-';
            var positionIndex = className.indexOf(positionPrefix) + positionPrefix.length;
            var positionStr = className.substring(positionIndex, positionIndex + 3);
            var row = parseInt(positionStr[2]) - 1;
            var col = parseInt(positionStr[0]) - 1;

            list.push({
                num: num,
                row: row,
                col: col
            });
        }

        return list;
    }

    function pressKey(move) {
        var event = new Event("keydown", {
            bubbles: true,
            cancelable: true
        });
        event.altKey = false;
        event.char = "";
        event.charCode = 0;
        event.ctrlKey = false;
        event.defaultPrevented = false;
        event.eventPhase = 3;
        event.isTrusted = true;
        event.key = move.key;
        event.keyCode = move.keyCode;
        event.locale = 'en-CA';
        event.location = 0;
        event.metaKey = false;
        event.repeat = false;
        event.shiftKey = false;
        event.which = move.keyCode;

        document.body.dispatchEvent(event);
    }

    function isGameOver() {
        var gameMessage = document.getElementsByClassName('game-message')[0];
        return gameMessage.className.indexOf('game-over') >= 0;
    }

    function retry() {
        var retryButton = document.getElementsByClassName('retry-button')[0];
        retryButton.click();
    }

    function getScore() {
        var scoreContainer = document.getElementsByClassName('score-container')[0];
        return parseInt(scoreContainer.innerHTML);
    }

    function getBestScore() {
        var bestContainer = document.getElementsByClassName('best-container')[0];
        return parseInt(bestContainer.innerHTML);
    }
})();
