/* global _:false, Phaser:false */

/**
 * Prefab base platform
 */

(function() {
  "use strict";

  // Constructor
  var Base = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "jar.png");

    // Configure
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo((this.game.width / 2) / this.width);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  Base.prototype = Object.create(Phaser.Sprite.prototype);
  Base.prototype.constructor = Base;

  // Add methods
  _.extend(Base.prototype, {
    update: function() {
    }
  });

  // Export
  module.exports = Base;
})();
