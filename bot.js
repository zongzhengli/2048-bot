(function () {

    // Game constants.
    var GRID_SIZE = 4;
    var PROB_2 = 0.9;

    // Search constants.
    var SEARCH_DEPTH = 3;
    var MOVE_ITERATIONS = 5;

    // Evaluation constants.
    var EDGE_WEIGHT = 1;
    var NUM_EMPTY_WEIGHT = 1;
    var ADJ_WEIGHT = 0.1;
    var ADJ_DIFF_WEIGHT = -0.5;
    var INSULATION_WEIGHT = -10;

    // Shared constants.
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

    // Initialize hash tables.
    var transpositionTable = {};
    var keyTable = {};
    for (var r = 0; r < GRID_SIZE; r++) {
        for (var c = 0; c < GRID_SIZE; c++) {
            for (var t = 2; t <= 8192; t *= 2) {
                keyTable[getTileKey(r, c, t)] = Math.round(0xffffffff * Math.random());
            }
            keyTable[getTileKey(r, c, 0)] = 0;
        }
    }

    //*
    setInterval(function () {
        nextMove();
    }, 50);
    /*/
    var grid = getGrid();
    print(grid);
    evaluate(grid, true);
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

            var grid = getGrid();
            var largestTile = 0;
            for (var i = 0 ; i < grid.length; i++)
                largestTile = Math.max(largestTile, grid[i]);
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

    /**
     * Chooses and the next move and plays it.
     */
    function nextMove() {
        var grid = getGrid();
        var move = search(grid, SEARCH_DEPTH, Number.NEGATIVE_INFINITY, true);
        pressKey(move);
    }

    /**
     * Searches for the best move with depth-first search.
     * @param grid: flat array representation of game grid.
     * @param depth: search tree depth, where leaves are at depth 0.
     * @param root: whether to treat the node as the root node.
     * @return best move at root nodes, value of best move at other nodes.
     */
    function search(grid, depth, alpha, root) {
        if (depth <= 0)
            return evaluate(grid);

        // Hash probe
        var entry = transpositionTable[getGridKey(grid)]
        if (entry && entry.depth >= depth) {
            return root ? entry.move : entry.value;
        }

        var moves = [ MOVE_LEFT, MOVE_UP, MOVE_RIGHT, MOVE_DOWN ];
        var bestMove = MOVE_LEFT;

        for (var i = 0; i < moves.length; i++) {
            var copyGrid = copy(grid);
            var move = moves[i];

            if (make(copyGrid, move)) {
                var value = search(copyGrid, depth - 1, alpha);

                for (var k = 1; value > alpha && k < MOVE_ITERATIONS; k++) {
                    var copyGrid = copy(grid);
                    make(copyGrid, move);
                    //value = (value * k + search(copyGrid, depth - 1)) / (k + 1);
                    value = Math.min(value, search(copyGrid, depth - 1, alpha));
                }

                if (value > alpha) {
                    alpha = value;
                    bestMove = move;
                }
            }
        }

        transpositionTable[getGridKey(grid)] = {
            depth: depth,
            value: alpha,
            move: bestMove
        }

        return root ? bestMove : alpha;
    }

    /**
     * Evaluates the given grid state.
     * @param grid: flat array representation of game grid.
     * @param printComponents: whether to print evaluation component breakdown in console.
     * @return estimated value of grid state.
     */
    function evaluate(grid, printComponents) {
        var value = 0;

        var edgeValue = 0;
        for (var i = 0; i < GRID_SIZE; i++) {
            var tile = get(grid, i, 0);
            if (tile)
                edgeValue += tile;

            tile = get(grid, i, GRID_SIZE - 1);
            if (tile)
                edgeValue += tile;

            tile = get(grid, 0, i);
            if (tile)
                edgeValue += tile;

            tile = get(grid, GRID_SIZE - 1, i);
            if (tile)
                edgeValue += tile;
        }

        var adjValue = 0;
        var adjDiffValue = 0;
        var insulationValue = 0;
        var numEmpty = 0;

        for (var r = 0; r < GRID_SIZE; r++) {
            for (var c = 0; c < GRID_SIZE; c++) {
                var tile = get(grid, r, c);
                if (tile) {
                    if (c < GRID_SIZE - 1) {
                        var adjTile = get(grid, r, c + 1);
                        if (adjTile) {
                            adjValue += tile + adjTile;
                            adjDiffValue += levelDifference(tile, adjTile);

                            if (c < GRID_SIZE - 2) {
                                var thirdTile = get(grid, r, c + 2);
                                if (thirdTile && levelDifference(tile, thirdTile) <= 1) {
                                    var averageTile = (tile + thirdTile) / 2;
                                    insulationValue += levelDifference(averageTile, adjTile) * Math.log(averageTile);
                                }
                            }
                        }
                    }

                    if (r < GRID_SIZE - 1) {
                        adjTile = get(grid, r + 1, c);
                        if (adjTile) {
                            adjValue += tile + adjTile;
                            adjDiffValue += levelDifference(tile, adjTile);

                            if (c < GRID_SIZE - 2) {
                                var thirdTile = get(grid, r + 2, c);
                                if (thirdTile && levelDifference(tile, thirdTile) <= 1) {
                                    var averageTile = (tile + thirdTile) / 2;
                                    insulationValue += levelDifference(averageTile, adjTile) * Math.log(averageTile);
                                }
                            }
                        }
                    }
                }
                else numEmpty++;
            }
        }
        var numEmptyValue = numEmpty;

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

    /**
     * Computes the stack level difference between two tiles.
     * @param tile1: first tile value.
     * @param tile2: second tile value.
     * @return stack level difference between two given tiles.
     */
    function levelDifference(tile1, tile2) {
        var ratio = Math.max(tile1 / tile2, tile2 / tile1);
        return Math.log(ratio) * 1.44269504;
    }

    /**
     * Returns the tile value in the grid for a given position.
     * @param grid: flat array representation of game grid.
     * @param row: position row.
     * @param col: position column.
     * @return tile value in the grid for given position.
     */
    function get(grid, row, col) {
        return grid[row * GRID_SIZE + col];
    }

    /**
     * Sets the tile value in the grid for a given position.
     * @param grid: flat array representation of game grid.
     * @param row: position row.
     * @param col: position column.
     * @param tile: new tile value to assign.
     */
    function set(grid, row, col, tile) {
        grid[row * GRID_SIZE + col] = tile;
    }

    /**
     * Prints the given grid in console.
     * @param grid: flat array representation of game grid.
     * @param row: position row.
     * @param col: position column.
     * @param value: new value to assign.
     */
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
                var tile = get(grid, r, c);
                result += tile ? pad(tile + '', 5) : '    .';
            }
            result += '\n';
        }
        console.log(result);
    }

    /**
     * Copies the given grid.
     * @param grid: flat array representation of game grid.
     * @return copy of given grid.
     */
    function copy(grid) {
        return grid.slice();
    }

    /**
     * Determines whether the given location is within grid bounds.
     * @param row: position row.
     * @param col: position column.
     * @return whether the given location is within grid bounds.
     */
    function inBounds(row, col) {
        return 0 <= row && row < GRID_SIZE && 0 <= col && col < GRID_SIZE;
    }

    /**
     * Makes the given move on the grid, randomly selects new tile insertion location.
     * @param grid: flat array representation of game grid.
     * @param move: object containing move vectors.
     */
    function make(grid, move) {
        var start = move.dir * (GRID_SIZE - 1);
        var end = (1 - move.dir) * (GRID_SIZE + 1) - 1;
        var inc = 1 - 2 * move.dir;

        var anyMoved = false;

        for (var r = start; r != end; r += inc) {
            for (var c = start; c != end; c += inc) {
                if (get(grid, r, c)) {
                    var newr = r + move.drow;
                    var newc = c + move.dcol;
                    var oldr = r;
                    var oldc = c;

                    while (inBounds(newr, newc)) {
                        var target = get(grid, newr, newc);
                        var tile = get(grid, oldr, oldc);
                        if (!target) {
                            set(grid, newr, newc, tile);
                            set(grid, oldr, oldc, 0);
                            anyMoved = true;
                        }
                        else if (target === tile) {
                            set(grid, newr, newc, -2 * tile);
                            set(grid, oldr, oldc, 0);
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
        for (var i = 0; i < grid.length; i++) {
            if (grid[i] < 0)
                grid[i] *= -1;
            else if (!grid[i])
                numEmpty++;
        }

        if (numEmpty === 0)
            return false;

        for (var i = 0; i < grid.length; i++) {
            if (!grid[i]) {
                var p = 1 / numEmpty--;
                if (Math.random() < p) {
                    grid[i] = Math.random() < PROB_2 ? 2 : 4;
                    return true;
                }
            }
        }
    }

    function getTileKey(row, col, tile) {
        return tile * GRID_SIZE * GRID_SIZE + row * GRID_SIZE + col;
    }

    function getGridKey(grid) {
        var value = 0;
        for (var r = 0; r < GRID_SIZE; r++) {
            for (var c = 0; c < GRID_SIZE; c++) {
                value ^= keyTable[getTileKey(r, c, get(grid, r, c))];
            }
        }
        return value;
    }

    /**
     * Constructs current game grid from DOM.
     * @return flat array representation game grid.
     */
    function getGrid() {
        var tileContainer = document.getElementsByClassName('tile-container')[0];
        var tileList = [];

        for (var i = 0 ; i < tileContainer.children.length; i++) {
            var tile = tileContainer.children[i];
            var tileInner = tile.children[0];
            var value = parseInt(tileInner.innerHTML);

            var className = tile.className;
            var positionPrefix = 'tile-position-';
            var positionIndex = className.indexOf(positionPrefix) + positionPrefix.length;
            var positionStr = className.substring(positionIndex, positionIndex + 3);
            var row = parseInt(positionStr[2]) - 1;
            var col = parseInt(positionStr[0]) - 1;

            tileList.push({
                value: value,
                row: row,
                col: col
            });
        }

        var grid = new Array(GRID_SIZE * GRID_SIZE);
        for (var i = 0; i < grid.length; i++) {
            grid[i] = 0;
        }
        for (var i = 0; i < tileList.length; i++) {
            var tile = tileList[i];
            set(grid, tile.row, tile.col, tile.value);
        }

        return grid;
    }

    /**
     * Emulates a keypress for a given move.
     * @param move: object containing key information.
     */
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

    /**
     * Determines whether the current game has concluded from DOM.
     * @return whether current game has concluded.
     */
    function isGameOver() {
        var gameMessage = document.getElementsByClassName('game-message')[0];
        return gameMessage.className.indexOf('game-over') >= 0;
    }

    /**
     * Starts a new game when the current game has concluded.
     */
    function retry() {
        var retryButton = document.getElementsByClassName('retry-button')[0];
        retryButton.click();
    }

    /**
     * Gets the current score from DOM.
     * @return current score of game.
     */
    function getScore() {
        var scoreContainer = document.getElementsByClassName('score-container')[0];
        return parseInt(scoreContainer.innerHTML);
    }

    /**
     * Gets the best score from DOM.
     * @return best score in all games.
     */
    function getBestScore() {
        var bestContainer = document.getElementsByClassName('best-container')[0];
        return parseInt(bestContainer.innerHTML);
    }
})();