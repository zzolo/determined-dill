/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, $:false, Phaser:false */

/**
 * Main JS for Pickle Jumper
 */

"use strict";

(function () {
  "use strict";

  // Ensure we have the pickle jumper parts
  var pickleJumper = window.pickleJumper || {};

  // Constructore for Pickle
  var Pickle = window.Pickle = function (options) {
    this.options = options;
    this.el = this.options.el;
    this.$el = $(this.options.el);
    this.$ = function () {
      return $(options.el).find;
    };

    this.width = this.$el.width();
    this.height = $(window).height();
  };

  // Add properties
  _.extend(Pickle.prototype, {
    // Start everything
    start: function start() {
      // Create Phaser game
      this.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, this.el.replace("#", ""));

      // Add reference to game, since most parts have this reference
      // already
      this.game.pickle = this;

      // Register states
      this.game.state.add("menu", pickleJumper.states.Menu);
      this.game.state.add("play", pickleJumper.states.Play);

      // Highscore
      this.highscoreLimit = 10;
      this.getHighscores();

      // Start with menu
      this.game.state.start("play");

      // Debug
      if (this.options.debug && this.game.camera) {
        this.game.debug.cameraInfo(this.game.camera, 10, 10);
      }
    },

    // Get high scores
    getHighscores: function getHighscores() {
      var s = localStorage.getItem("highscores");
      s = s ? JSON.parse(s) : [];
      this.highscores = s;
      this.sortHighScores();
      return this.highscores;
    },

    // Get highest score
    getHighscore: function getHighscore() {
      return _.max(this.highscores, "score");
    },

    // Set single highscore
    setHighscore: function setHighscore(score, name) {
      if (this.isHighscore(score)) {
        this.sortHighScores();
        this.highscores.shift();
        this.highscores.push({
          name: name,
          score: score
        });
        this.sortHighScores();
        this.setHighScores();
      }
    },

    // Sort highscores
    sortHighScores: function sortHighScores() {
      this.highscores = _.sortBy(this.highscores, "score");
    },

    // Is highscore.  Is the score higher than the lowest
    // recorded score
    isHighscore: function isHighscore(score) {
      var min = _.min(this.highscores, "score").score;
      return score > min || this.highscores.length < this.highscoreLimit;
    },

    // Check if score is highest score
    isHighestScore: function isHighestScore(score) {
      var max = _.max(this.highscores, "score").score;
      return score > max;
    },

    // Set highscores
    setHighScores: function setHighScores() {
      localStorage.setItem("highscore", JSON.stringify(this.highscores));
    }
  });

  // Create app
  var p = new Pickle({
    el: "#pickle-jumper",
    debug: true
  });
  p.start();
})();