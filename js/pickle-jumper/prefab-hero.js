/* global _:false, Phaser:false */

/**
 * Prefab Hero/character
 */

(function() {
  "use strict";

  // Constructor
  var Hero = function(game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "pickle.png");

    // Configure
    this.anchor.setTo(0.5);
    this.scale.setTo((this.game.width / 25) / this.width);
    this.game.physics.arcade.enableBody(this);

    // Track where the hero started and how much the distance
    // has changed from that point
    this.yOrig = this.y;
    this.yChange = 0;
  };

  // Extend from Sprite
  Hero.prototype = Object.create(Phaser.Sprite.prototype);
  Hero.prototype.constructor = Hero;

  // Add methods
  _.extend(Hero.prototype, {
    update: function() {
      // Track the maximum amount that the hero has travelled
      this.yChange = Math.max(this.yChange, Math.abs(this.y - this.yOrig));

      // Wrap around edges left/tight edges
      this.game.world.wrap(this, this.width / 2, false, true, false);
    },

    // Reset placement custom
    resetPlacement: function(x, y) {
      this.reset(x, y);
      this.yOrig = this.y;
      this.yChange = 0;
    }
  });

  // Export
  module.exports = Hero;
})();
