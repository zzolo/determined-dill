/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Play state for Pickle Jumper
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.states = pj.states || {};

  // Constructor for menu
  pj.states.Play = function () {
    Phaser.State.call(this);
  };

  // Extend from State
  pj.states.Play.prototype = Object.create(Phaser.State.prototype);
  pj.states.Play.prototype.constructor = pj.states.Game;

  // Add methods
  _.extend(pj.states.Play.prototype, Phaser.State.prototype, {
    // Preload
    preload: function preload() {
      // Load up game images
      this.game.load.atlas("game-sprites", "/assets/pickle-jumper-sprites.png", "/assets/pickle-jumper-sprites.json");
    },

    // Create
    create: function create() {
      // Set background
      this.game.stage.backgroundColor = "#A0CFAA";

      // Score text
      this.score = this.game.add.text(this.game.world.width * 0.5, 20, "Score:", {
        font: "bold " + this.game.world.height / 25 + "px Arial",
        fill: "#fff",
        align: "center"
      });
      this.score.anchor.set(0.5);

      // Physics
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.game.physics.arcade.gravity.y = 500;

      // Add main pickle
      this.hero = new pj.prefabs.Hero(this.game, this.game.width * 0.5, this.game.height * 0.5);
      this.game.add.existing(this.hero);

      // Cursors, input
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.actionButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    // Update
    update: function update() {
      // Move hero
      //this.hero.body.velocity.x = (this.cursors.left.isDown) ? -100 : this.hero.body.velocity.x;
    }
  });
})();