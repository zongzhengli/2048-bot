2048-Bot
=============

This is a bot for [the game 2048](http://gabrielecirulli.github.io/2048/). It's quite fast and can reach the 4096 tile consistently. [Here is a gameplay video](https://www.youtube.com/watch?v=o6HGKy921YY).

The source code is bot.js and a minified version is mini.js. The bot is deployed by pasting the code in one of the these files into the developer console with the game open.

The bot chooses moves using shallow depth-first search and a simple position evaluator. It speeds up the search using a simple one-sided modification of alpha-beta pruning as well as a transposition table for caching search results. It interfaces with the game by looking at the DOM and dispatching key presses. 
