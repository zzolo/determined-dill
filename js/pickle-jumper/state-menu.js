/* global _:false, Phaser:false */

/**
 * Menu state for Pickle Jumper
 */

(function() {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.states = pj.states || {};

  // Constructor for menu
  pj.states.menu = function() {
    Phaser.State.call(this);
  };

  // Extend from state prototype
  _.extend(pj.states.menu.prototype, Phaser.State.prototype, {
    // Preload
    preload: function() {
    },

    // Create
    create: function() {
      // Set background
      this.game.stage.backgroundColor = "#52a363";

      // Write things
      this.title = this.game.add.text(0, 0, "Pickle Jumper", {
        font: "bold 32px Arial",
        fill: "#fff",
        boundsAlignH: "center",
        boundsAlignV: "middle"
      });
      this.title.setTextBounds(0, this.game.height / 10,
        this.game.width, this.game.height / 10);
    },

    // Update
    update: function() {
    }
  });
})();
