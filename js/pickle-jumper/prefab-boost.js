/* global _:false, Phaser:false */

/**
 * Prefab (objects) boost for platforms
 */

(function() {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.prefabs = pj.prefabs || {};

  // Constructor for Boost
  pj.prefabs.Boost = function(game, x, y) {
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
  pj.prefabs.Boost.prototype = Object.create(Phaser.Sprite.prototype);
  pj.prefabs.Boost.prototype.constructor = pj.prefabs.Boost;

  // Add methods
  _.extend(pj.prefabs.Coin.prototype, {
    update: function() {

    }
  });
})();
