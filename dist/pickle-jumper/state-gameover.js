/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Gameover state for Pickle Jumper
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.states = pj.states || {};

  // Constructor
  pj.states.Gameover = function () {
    Phaser.State.call(this);

    // Configure
    this.padding = 10;
  };

  // Extend from State
  pj.states.Gameover.prototype = Object.create(Phaser.State.prototype);
  pj.states.Gameover.prototype.constructor = pj.states.Gameover;

  // Add methods
  _.extend(pj.states.Gameover.prototype, Phaser.State.prototype, {
    // Preload
    preload: function preload() {
      this.game.load.image("gameover", "assets/gameover.png");
      this.game.load.image("play", "assets/title-play.png");
    },

    // Create
    create: function create() {
      // Set background
      this.game.stage.backgroundColor = "#8cc63f";

      // Place title
      this.titleImage = this.game.add.sprite(this.game.width / 2, this.padding * 3, "gameover");
      this.titleImage.anchor.setTo(0.5, 0);
      this.titleImage.scale.setTo((this.game.width - this.padding * 8) / this.titleImage.width);
      this.game.add.existing(this.titleImage);

      // Highscore list.  Can't seem to find a way to pass the score
      // via a state change.
      this.score = this.game.pickle.score;
      if (this.game.pickle.isHighscore(this.score)) {
        this.highscoreInput();
      }

      if (this.game.pickle.isHighestScore(this.score)) {
        //this.highestScore();
        console.log("highest");
      }

      this.highscoreList();

      // Place re-play
      this.replayImage = this.game.add.sprite(this.game.width - this.padding * 2, this.game.height - this.padding * 2, "play");
      this.replayImage.anchor.setTo(1, 1);
      this.replayImage.scale.setTo(this.game.width * 0.25 / this.replayImage.width);
      this.game.add.existing(this.replayImage);

      // Add hover for mouse
      this.replayImage.inputEnabled = true;
      this.replayImage.events.onInputOver.add(function () {
        this.replayImage.originalTint = this.replayImage.tint;
        this.replayImage.tint = 0.5 * 0xFFFFFF;
      }, this);

      this.replayImage.events.onInputOut.add(function () {
        this.replayImage.tint = this.replayImage.originalTint;
      }, this);

      // Add interactions for starting
      this.replayImage.events.onInputDown.add(this.replay, this);

      // Input
      this.leftButton = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      this.rightButton = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      this.upButton = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
      this.downButton = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
      this.actionButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      this.leftButton.onDown.add(function () {
        if (this.hInput) {
          this.moveCursor(-1);
        }
      }, this);

      this.rightButton.onDown.add(function () {
        if (this.hInput) {
          this.moveCursor(1);
        }
      }, this);

      this.upButton.onDown.add(function () {
        if (this.hInput) {
          this.moveLetter(1);
        }
      }, this);

      this.downButton.onDown.add(function () {
        if (this.hInput) {
          this.moveLetter(-1);
        }
      }, this);

      this.actionButton.onDown.add(function () {
        if (this.hInput) {
          this.saveHighscore();
        } else {
          this.replay();
        }
      }, this);
    },

    // Update
    update: function update() {},

    // Shutdown, clean up on state change
    shutdown: function shutdown() {
      ["titleText", "replayText"].forEach(_.bind(function (item) {
        if (this[item] && this[item].destroy) {
          this[item].destroy();
          this[item] = null;
        }
      }, this));
    },

    // Handle replay
    replay: function replay() {
      this.game.state.start("play");
    },

    // Highest score
    highestScore: function highestScore() {
      this.highestScoreText = this.game.add.text(this.game.world.width * 0.5, this.game.world.height * 0.25, "You got the\nhighest score!!", {
        font: "bold " + this.game.world.height / 15 + "px Arial",
        fill: "#fff",
        align: "center"
      });
      this.highestScoreText.anchor.set(0.5);
    },

    // Make highest score input
    highscoreInput: function highscoreInput() {
      this.hInput = true;
      this.hInputIndex = 0;
      this.hInputs = this.game.add.group();

      // First input
      var one = new Phaser.Text(this.game, this.game.world.width * 0.33333, this.game.world.height * 0.5, "A", {
        font: "bold " + this.game.world.height / 15 + "px Arial",
        fill: "#FFFFFF",
        align: "center"
      });
      one.anchor.set(0.5);
      this.hInputs.add(one);

      // Second input
      var second = new Phaser.Text(this.game, this.game.world.width * 0.5, this.game.world.height * 0.5, "A", {
        font: "bold " + this.game.world.height / 15 + "px Arial",
        fill: "#FFFFFF",
        align: "center"
      });
      second.anchor.set(0.5);
      this.hInputs.add(second);

      // Second input
      var third = new Phaser.Text(this.game, this.game.world.width * 0.66666, this.game.world.height * 0.5, "A", {
        font: "bold " + this.game.world.height / 15 + "px Arial",
        fill: "#FFFFFF",
        align: "center"
      });
      third.anchor.set(0.5);
      this.hInputs.add(third);

      // Cursor
      this.hCursor = this.game.add.text(one.x, one.y - this.game.world.height / 20, "_", {
        font: "bold " + this.game.world.height / 5 + "px Arial",
        fill: "#FFFFFF",
        align: "center"
      });
      this.hCursor.anchor.set(0.5);

      // Handle inital cursor
      this.moveCursor(0);
    },

    // Move cursor
    moveCursor: function moveCursor(amount) {
      var newIndex = this.hInputIndex + amount;
      this.hInputIndex = newIndex < 0 ? this.hInputs.length - 1 : newIndex >= this.hInputs.length ? 0 : newIndex;
      var i = this.hInputs.getChildAt(this.hInputIndex);

      // Move cursor
      this.hCursor.x = i.x;
      this.hInputs.forEach(function (input) {
        input.fill = "#FFFFFF";
      });

      i.fill = "#FFDDBB";

      // TODO: Highlight input.
    },

    // Move letter
    moveLetter: function moveLetter(amount) {
      var i = this.hInputs.getChildAt(this.hInputIndex);
      var t = i.text;
      var n = t === "A" && amount === -1 ? "Z" : t === "Z" && amount === 1 ? "A" : String.fromCharCode(t.charCodeAt(0) + amount);

      i.text = n;
    },

    // Save highscore
    saveHighscore: function saveHighscore() {
      // Get name
      var name = "";
      this.hInputs.forEach(function (input) {
        name = name + input.text;
      });

      // Don't allow AAA
      if (name === "AAA") {
        return;
      }

      // Save highscore
      this.game.pickle.setHighscore(this.score, name);

      // Remove input
      this.hInput = false;
      this.hInputs.destroy();
      this.hCursor.destroy();
    },

    // Highscore list
    highscoreList: function highscoreList() {
      if (this.game.pickle.highscores.length > 0) {
        console.log(this.game.pickle.highscores);
      }
    }
  });
})();