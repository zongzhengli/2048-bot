2048-Bot
=============


It's quite fast and can reach the 4096 tile consistently. [Here is a gameplay video](https://www.youtube.com/watch?v=o6HGKy921YY). The bot chooses moves using shallow depth-first search and simple position evaluation. It speeds up the search using a one-sided modification of alpha-beta pruning as well as a transposition table for caching search results. It interfaces with the game by looking at the DOM and dispatching key presses.
