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
  };

  // Extend from State
  pj.states.Menu.prototype = Object.create(Phaser.State.prototype);
  pj.states.Menu.prototype.constructor = pj.states.Menu;

  // Add methods
  _.extend(pj.states.Menu.prototype, Phaser.State.prototype, {
    // Preload
    preload: function preload() {},

    // Create
    create: function create() {
      // Set background
      this.game.stage.backgroundColor = "#52a363";

      // Write things
      this.title = this.game.add.text(this.game.world.width * 0.5, this.game.world.height * 0.1, "Pickle Jumper", {
        font: "bold " + this.game.world.height / 10 + "px Arial",
        fill: "#fff",
        align: "center"
      });
      this.title.anchor.set(0.5);

      // Start
      this.start = this.game.add.text(this.game.world.width * 0.5, this.game.world.height * 0.9, "Start", {
        font: "bold " + this.game.height / 20 + "px Arial",
        fill: "#fff",
        align: "center",
        cursor: "pointer"
      });
      this.start.anchor.set(0.5);

      // Add hover for mouse
      this.start.inputEnabled = true;
      this.start.events.onInputOver.add(function () {
        this.start.originalFill = this.start.fill;
        this.start.fill = "green";
      }, this);

      this.start.events.onInputOut.add(function () {
        this.start.fill = this.start.originalFill;
      }, this);

      // Add interactions for starting
      this.start.events.onInputDown.add(this.onStart, this);
    },

    // When starting
    onStart: function onStart() {
      this.game.state.start("game");
    },

    // Update
    update: function update() {}
  });
})();