/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Menu state for Pickle Jumper
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.states = pj.states || {};

  // Constructor for menu
  pj.states.Menu = function () {
    Phaser.State.call(this);

    // Config
    this.padding = 20;
  };

  // Extend from State
  pj.states.Menu.prototype = Object.create(Phaser.State.prototype);
  pj.states.Menu.prototype.constructor = pj.states.Menu;

  // Add methods
  _.extend(pj.states.Menu.prototype, Phaser.State.prototype, {
    // Preload
    preload: function preload() {
      this.game.load.image("title", "assets/title.png");
      this.game.load.image("play", "assets/title-play.png");
    },

    // Create
    create: function create() {
      // Set background
      this.game.stage.backgroundColor = "#b8f4bc";

      // Place title
      this.titleImage = this.game.add.sprite(this.game.width / 2, this.padding * 3, "title");
      this.titleImage.anchor.setTo(0.5, 0);
      this.titleImage.scale.setTo((this.game.width - this.padding * 2) / this.titleImage.width);
      this.game.add.existing(this.titleImage);

      // Place play
      this.playImage = this.game.add.sprite(this.game.width / 2, this.game.height - this.padding * 3, "play");
      this.playImage.anchor.setTo(0.4, 1);
      this.playImage.scale.setTo(this.game.width * 0.75 / this.titleImage.width);
      this.game.add.existing(this.playImage);

      // Add hover for mouse
      this.playImage.inputEnabled = true;
      this.playImage.events.onInputOver.add(function () {
        this.playImage.originalTint = this.playImage.tint;
        this.playImage.tint = 0.5 * 0xFFFFFF;
      }, this);

      this.playImage.events.onInputOut.add(function () {
        this.playImage.tint = this.playImage.originalTint;
      }, this);

      // Add mouse interaction
      this.playImage.events.onInputDown.add(this.go, this);

      // Add keyboard interaction
      this.actionButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.actionButton.onDown.add(function () {
        this.go();
      }, this);
    },

    // Start playing
    go: function go() {
      this.game.state.start("play");
    },

    // Update
    update: function update() {}
  });
})();