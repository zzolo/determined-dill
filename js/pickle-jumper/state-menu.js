/* global _:false, Phaser:false */

/**
 * Menu state
 */

(function() {
  "use strict";

  // Dependencies
  var prefabs = {
    Botulism: require("./prefab-botulism.js"),
    Hero: require("./prefab-hero.js")
  };

  // Constructor
  var Menu = function() {
    Phaser.State.call(this);
  };

  // Extend from State
  Menu.prototype = Object.create(Phaser.State.prototype);
  Menu.prototype.constructor = Menu;

  // Add methods
  _.extend(Menu.prototype, Phaser.State.prototype, {
    // Preload
    preload: function() {
      // Load up game images
      this.game.load.atlas("title-sprites", "assets/title-sprites.png", "assets/title-sprites.json");
      this.game.load.atlas("pickle-sprites", "assets/pickle-sprites.png", "assets/pickle-sprites.json");
      this.game.load.atlas("game-sprites", "assets/game-sprites.png", "assets/game-sprites.json");
    },

    // Create
    create: function() {
      // Set background
      this.game.stage.backgroundColor = "#b8f4bc";

      // Make padding dependent on width
      this.padding = this.game.width / 50;

      // Place title
      this.titleImage = this.game.add.sprite(0, 0, "title-sprites", "title.png");
      this.titleImage.anchor.setTo(0.5, 0.5);
      this.titleImage.scale.setTo((this.game.width - (this.padding * 6)) / this.titleImage.width);
      this.titleImage.reset(this.centerStageX(this.titleImage),
        this.centerStageY(this.titleImage) - this.padding * 8);
      this.game.add.existing(this.titleImage);

      // Place play
      this.playImage = this.game.add.sprite(0, 0, "title-sprites", "title-play.png");
      this.playImage.anchor.setTo(0.4, 1);
      this.playImage.scale.setTo((this.game.width * 0.5) / this.titleImage.width);
      this.playImage.reset(this.centerStageX(this.playImage), this.game.height - this.padding * 2);
      this.game.add.existing(this.playImage);

      // Add hover for mouse
      this.playImage.inputEnabled = true;
      this.playImage.events.onInputOver.add(function() {
        this.playImage.originalTint = this.playImage.tint;
        this.playImage.tint = 0.5 * 0xFFFFFF;
      }, this);

      this.playImage.events.onInputOut.add(function() {
        this.playImage.tint = this.playImage.originalTint;
      }, this);

      // Add mouse interaction
      this.playImage.events.onInputDown.add(this.go, this);

      // Add keyboard interaction
      this.actionButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.actionButton.onDown.add(function() {
        this.go();
      }, this);

      // Show any overlays
      this.game.pickle.showOverlay(".state-menu");

      // Make chase scene every few seconds
      //this.chase();
      this.chaseTimer = this.game.time.create(false);
      this.chaseTimer.loop(20000, this.chase, this);
      this.chaseTimer.start();
    },

    // Start playing
    go: function() {
      this.game.pickle.hideOverlay(".state-menu");

      // Kill any thing
      if (this.hero) {
        this.hero.kill();
        this.bot.kill();
      }

      this.game.time.events.remove(this.chaseTimer);
      this.game.state.start("play");
    },

    // Update
    update: function() {
    },

    // Center x on stage
    centerStageX: function(obj) {
      return ((this.game.width - obj.width) / 2) + (obj.width / 2);
    },

    // Center x on stage
    centerStageY: function(obj) {
      return ((this.game.height - obj.height) / 2) + (obj.height / 2);
    },

    // Make chase scene
    // Tween to: function (properties, duration, ease, autoStart, delay, repeat, yoyo)
    chase: function() {
      var y = this.titleImage.x + (this.titleImage.height / 2) + this.padding * 4;

      // Add if needed
      if (!this.pickle || !this.pickle.alive) {
        this.hero = new prefabs.Hero(this.game, -1000, -1000);

        // Gravity gets started int he game
        this.hero.body.allowGravity = false;
        this.hero.body.immovable = true;

        this.game.add.existing(this.hero);
      }

      if (!this.bot || !this.bot.alive) {
        this.bot = new prefabs.Botulism(this.game, -1000, -1000);
        this.bot.hover = false;
        this.game.add.existing(this.bot);
      }

      // Reset placement
      this.hero.resetPlacement(-this.hero.width, y - this.padding * 6);
      this.bot.resetPlacement(this.game.width + this.padding * 6, y);

      // Make sure bot is not shaking
      this.bot.shakeOff();

      // Move pickle in
      this.game.add.tween(this.hero).to({ x: this.padding * 6, y: y }, 1000,
        Phaser.Easing.Quadratic.InOut, true, 0);

      this.hero.doJumpUp();
      this.game.time.events.add(400, function() {
        this.hero.doJumpDown();
      }, this);

      // Bring in bot
      this.game.add.tween(this.bot).to({ x: this.game.width - this.padding * 6 }, 1000,
        Phaser.Easing.Quadratic.InOut, true, 1500)
        .onComplete.addOnce(function() {
          // Shake it up
          this.game.time.events.add(300, function() {
            this.bot.shakeOn();
          }, this);

          // Chase pickle
          this.game.add.tween(this.bot).to({ x: this.bot.width * -4 }, 2000,
            Phaser.Easing.Exponential.In, true, 1000);

          // Pickle jump away
          this.game.add.tween(this.hero).to({ x: -this.hero.width, y: y - this.padding * 6 }, 500,
            Phaser.Easing.Quadratic.InOut, true, 2200);

          // Animate pickle
          this.game.time.events.add(2200, function() {
            this.hero.doJumpUp();
          }, this);
        }, this);
    }
  });

  // Export
  module.exports = Menu;
})();
