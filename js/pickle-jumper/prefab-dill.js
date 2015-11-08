/* global _:false, Phaser:false */

/**
 * Prefab (objects) Dill for boosting
 */

(function() {
  "use strict";

  // Constructor
  var Dill = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "dill.png");

    // Size
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo((this.game.width / 9) / this.width);

    // Physics
    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
    this.body.immovable = true;
  };

  // Extend from Sprite
  Dill.prototype = Object.create(Phaser.Sprite.prototype);
  Dill.prototype.constructor = Dill;

  // Add methods
  _.extend(Dill.prototype, {
    update: function() {

    }
  });

  // Export
  module.exports = Dill;
})();
