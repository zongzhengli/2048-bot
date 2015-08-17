(function () {

    // Constants
    var GRID_SIZE = 4;
    var MOVE_UP = {
        drow: -1,
        dcol: 0,
        dir: 0,
        keyCode: 38
    };
    var MOVE_DOWN = {
        drow: 1,
        dcol: 0,
        dir: 1,
        keyCode: 40
    };
    var MOVE_LEFT = {
        drow: 0,
        dcol: -1,
        dir: 0,
        keyCode: 37
    };
    var MOVE_RIGHT = {
        drow: 0,
        dcol: 1,
        dir: 1,
        keyCode: 39
    };

    //*
    setInterval(function () {
        nextMove();
    }, 10);
    /*/
    nextMove();
    //*/

    var bestScore = 0;
    var largestTile = 0;
    setInterval(function () {
        if (isGameOver()) {
            var score = getScore();
            bestScore = Math.max(bestScore, score);

            var tileList = getTileList();
            for (var i = 0 ; i < tileList.length; i++) {
                largestTile = Math.max(largestTile, tileList[i].num);
            }

            console.log('Best score     ' + bestScore + '\n' +
                        'Largest tile   ' + largestTile + '\n' +
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

        var keyCodes = [ 37, 38, 39, 40 ];
        var keyIndex = Math.floor(4 * Math.random());
        var keyCode = keyCodes[keyIndex];

        pressKey(keyCode);
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
                        }
                        else if (target === value) {
                            set(tileGrid, newr, newc, 2 * value);
                            set(tileGrid, oldr, oldc, 0);
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


    }

    function search() {

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

    function pressKey(keyCode) {
        var keyMap = {};
        keyMap[37] = 'Left';
        keyMap[38] = 'Up';
        keyMap[39] = 'Right';
        keyMap[40] = 'Down';
        var key = keyMap[keyCode];

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
        event.key = key;
        event.keyCode = keyCode;
        event.locale = 'en-CA';
        event.location = 0;
        event.metaKey = false;
        event.repeat = false;
        event.shiftKey = false;
        event.which = keyCode;

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
