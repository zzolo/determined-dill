/* global _:false, Phaser:false */

/**
 * Prefab (objects) object for platforms
 */

(function() {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.prefabs = pj.prefabs || {};

  // Constructor for main character
  pj.prefabs.Platform = function(game, x, y, width) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "pixel_purple_10.png");

    // Configure
    this.anchor.setTo(0.5, 0.5);
    this.scale.x = (width) ? width / 10 : 10;
    this.scale.y = 2;

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  pj.prefabs.Platform.prototype = Object.create(Phaser.Sprite.prototype);
  pj.prefabs.Platform.prototype.constructor = pj.prefabs.Platform;

  // Add methods
  _.extend(pj.prefabs.Platform.prototype, {
    update: function() {

    },

    // Reset width
    resetWidth: function(width) {
      this.scale.x = (width) ? width / 10 : 10;
    }
  });
})();
