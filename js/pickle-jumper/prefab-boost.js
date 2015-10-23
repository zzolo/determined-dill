/* global _:false, Phaser:false */

/**
 * Prefab (objects) boost for platforms
 */

(function() {
  "use strict";

  // Constructor for Boost
  var Boost = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "dill.png");

    // Size
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo((this.game.width / 9) / this.width);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  Boost.prototype = Object.create(Phaser.Sprite.prototype);
  Boost.prototype.constructor = Boost;

  // Add methods
  _.extend(Boost.prototype, {
    update: function() {

    }
  });

  // Export
  module.exports = Boost;
})();
