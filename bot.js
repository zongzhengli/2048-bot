(function () {

    // Search constants.
    var SEARCH_DEPTH = 4;
    var SEARCH_TIME = 350;
    var RETRY_TIME = 1000;
    var ACCEPT_DEFEAT_VALUE = -999999;

    // Evaluation constants.
    var EVALUATE_ONLY = false;
    var NUM_EMPTY_WEIGHT = 5;
    var ADJ_DIFF_WEIGHT = -0.5;
    var INSULATION_WEIGHT = -2;
    var POSITION_WEIGHT = 0.04;
    var POSITION_VALUE = [
         0,  0,  0, 10,
         0,  0,  0, 15,
         0,  0, -5, 20,
        10, 15, 20, 50
    ];

    // Game constants.
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

    if (EVALUATE_ONLY) {
        var grid = getGrid();
        print(grid);
        evaluate(grid, true);
    }
    else {
        setInterval(nextMove, SEARCH_TIME);
    }

    var games = 0;
    var bestScore = 0;
    var averageScore = 0;
    var bestLargestTile = 0;
    var averageLargestTile = 0;

    setInterval(function () {
        if (gameWon()) {
            keepPlaying();
        }

        if (gameLost()) {
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

            search.table = {};
            tryAgain();
        }
    }, RETRY_TIME);

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
     * @param alpha: lower bound on search value.
     * @param root: whether to treat the node as the root node.
     * @return best move at root nodes, value of best move at other nodes.
     */
    function search(grid, depth, alpha, root) {
        if (depth <= 0)
            return evaluate(grid);

        if (!search.table)
            search.table = {};

        var key = getGridKey(grid);
        var entry = search.table[key];
        if (entry && entry.depth >= depth && (!entry.isBound || entry.value <= alpha))
            return root ? entry.move : entry.value;

        var moves = [ MOVE_RIGHT, MOVE_DOWN, MOVE_LEFT, MOVE_UP ];
        if (entry) {
            var index = moves.indexOf(entry.move);
            var temp = moves[index];
            moves[index] = moves[0];
            moves[0] = temp;
        }

        var bestMove = undefined;
        var alphaImproved = false;

        for (var i = 0; i < moves.length; i++) {
            var copyGrid = copy(grid);
            var move = moves[i];

            if (make(copyGrid, move)) {
                bestMove = bestMove || move;
                var value = Number.POSITIVE_INFINITY;

                for (var j = copyGrid.length - 1; j >= 0 && value > alpha; j--) {
                    if (!copyGrid[j]) {
                        copyGrid[j] = 2;
                        value = Math.min(value, search(copyGrid, depth - 1, alpha));
                        copyGrid[j] = 0;
                    }
                }

                if (value > alpha) {
                    alpha = value;
                    bestMove = move;
                    alphaImproved = true;
                }
            }
        }

        if (!bestMove)
            return root ? MOVE_LEFT : ACCEPT_DEFEAT_VALUE + evaluate(grid);

        search.table[key] = {
            depth: depth,
            value: alpha,
            move: bestMove,
            isBound: !alphaImproved
        };

        return root ? bestMove : alpha;
    }

    /**
     * Evaluates the given grid state.
     * @param grid: flat array representation of game grid.
     * @param logging: whether to log evaluation computation.
     * @return estimated value of grid state.
     */
    function evaluate(grid, logging) {
        var value = 0;

        var positionValue = 0;
        var adjDiffValue = 0;
        var insulationValue = 0;
        var numEmpty = 0;

        for (var r = 0; r < GRID_SIZE; r++) {
            for (var c = 0; c < GRID_SIZE; c++) {
                var tile = get(grid, r, c);
                if (!tile) {
                    numEmpty++;
                }
                else {
                    positionValue += tile * POSITION_VALUE[r * GRID_SIZE + c];

                    if (c < GRID_SIZE - 1) {
                        var adjTile = get(grid, r, c + 1);
                        if (adjTile) {
                            adjDiffValue += levelDifference(tile, adjTile) * Math.log(tile + adjTile);

                            if (c < GRID_SIZE - 2) {
                                var thirdTile = get(grid, r, c + 2);
                                if (thirdTile && levelDifference(tile, thirdTile) <= 1.1) {
                                    var averageTile = (tile + thirdTile) / 2;
                                    insulationValue += levelDifference(averageTile, adjTile) * Math.log(averageTile);
                                }
                            }
                        }
                    }

                    if (r < GRID_SIZE - 1) {
                        adjTile = get(grid, r + 1, c);
                        if (adjTile) {
                            adjDiffValue += levelDifference(tile, adjTile) * Math.log(tile + adjTile);

                            if (c < GRID_SIZE - 2) {
                                var thirdTile = get(grid, r + 2, c);
                                if (thirdTile && levelDifference(tile, thirdTile) <= 1.1) {
                                    var averageTile = (tile + thirdTile) / 2;
                                    insulationValue += levelDifference(averageTile, adjTile) * Math.log(averageTile);
                                }
                            }
                        }
                    }
                }
            }
        }

        var numEmptyValue = 11.12249 + (0.05735587 - 11.12249) / (1 + Math.pow((numEmpty / 2.480941), 2.717769));

        value += POSITION_WEIGHT * positionValue;
        value += NUM_EMPTY_WEIGHT * numEmptyValue;
        value += ADJ_DIFF_WEIGHT * adjDiffValue;
        value += INSULATION_WEIGHT * insulationValue;

        if (logging) {
            console.log('EVALUATION     ' + value + '\n' +
                        '  position     ' + (POSITION_WEIGHT * positionValue) + '\n' +
                        '  numEmpty     ' + (NUM_EMPTY_WEIGHT * numEmptyValue) + '\n' +
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
        var ratio = tile1 > tile2 ? tile1 / tile2 : tile2 / tile1;
        return Math.log(ratio) * 1.44269504089;
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
     * Prints the given grid to the console.
     * @param grid: flat array representation of game grid.
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
     * @return whether the move was made successfully.
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
            throw 'No empty squares after making move.';

        return true;
    }

    /**
     * Computes hash key for the given game grid.
     * @param grid: flat array representation of game grid.
     * @return hash key for the given game grid.
     */
    function getGridKey(grid) {
        if (!getGridKey.table1) {
            getGridKey.table1 = {};
            getGridKey.table2 = {};

            for (var i = 0; i < grid.length; i++) {
                for (var t = 2; t <= 8192; t *= 2) {
                    var key = t * grid.length + i;
                    getGridKey.table1[key] = Math.round(0xffffffff * Math.random());
                    getGridKey.table2[key] = Math.round(0xffffffff * Math.random());
                }
            }
        }

        var value1 = 0;
        var value2 = 0;
        for (var i = 0; i < grid.length; i++) {
            var tile = grid[i];
            if (tile) {
                var key = tile * grid.length + i;
                value1 ^= getGridKey.table1[key];
                value2 ^= getGridKey.table2[key];
            }
        }

        return value1 + '' + value2;
    }

    /**
     * Constructs current game grid from DOM.
     * @return flat array representation of game grid.
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
        var event = new Event('keydown', {
            bubbles: true,
            cancelable: true
        });
        event.altKey = false;
        event.char = '';
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
     * Determines whether the current game has been lost from the DOM.
     * @return whether current game has concluded.
     */
    function gameLost() {
        var gameMessage = document.getElementsByClassName('game-message')[0];
        return gameMessage.className.indexOf('game-over') >= 0;
    }

    /**
     * Determines whether the current game has been won from the DOM.
     * @return whether current game has concluded.
     */
    function gameWon() {
        var gameMessage = document.getElementsByClassName('game-message')[0];
        return gameMessage.className.indexOf('game-won') >= 0;
    }

    /**
     * Starts a new game when the current game has concluded.
     */
    function tryAgain() {
        var retryButton = document.getElementsByClassName('retry-button')[0];
        retryButton.click();
    }

    /**
     * Continues the game when the current game has been won.
     */
    function keepPlaying() {
        var keepPlayingButton = document.getElementsByClassName('keep-playing-button')[0];
        keepPlayingButton.click();
    }

    /**
     * Gets the current score from the DOM.
     * @return current score of game.
     */
    function getScore() {
        var scoreContainer = document.getElementsByClassName('score-container')[0];
        return parseInt(scoreContainer.innerHTML);
    }

    /**
     * Gets the best score from the DOM.
     * @return best score in all games.
     */
    function getBestScore() {
        var bestContainer = document.getElementsByClassName('best-container')[0];
        return parseInt(bestContainer.innerHTML);
    }
})();
