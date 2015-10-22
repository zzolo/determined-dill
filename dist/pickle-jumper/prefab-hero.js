/**
 * pickle-jumper - Pickle Jumper!
 * @version v0.0.1
 * @link https://github.com/zzolo/pickle-jumper#readme
 * @license MIT
 */
/* global _:false, Phaser:false */

/**
 * Prefab (objects) object for main character
 */

"use strict";

(function () {
  "use strict";
  var pj = window.pickleJumper = window.pickleJumper || {};
  pj.prefabs = pj.prefabs || {};

  // Constructor for main character
  pj.prefabs.Hero = function (game, x, y) {
    // Call default sprite
    Phaser.Sprite.call(this, game, x, y, "play-sprites", "pickle.png");

    // Configure
    this.anchor.setTo(0.5);
    this.scale.setTo(this.game.width / 25 / this.width);
    this.game.physics.arcade.enableBody(this);

    // Track where the hero started and how much the distance
    // has changed from that point
    this.yOrig = this.y;
    this.yChange = 0;
  };

  // Extend from Sprite
  pj.prefabs.Hero.prototype = Object.create(Phaser.Sprite.prototype);
  pj.prefabs.Hero.prototype.constructor = pj.prefabs.Hero;

  // Add methods
  _.extend(pj.prefabs.Hero.prototype, {
    update: function update() {
      // Track the maximum amount that the hero has travelled
      this.yChange = Math.max(this.yChange, Math.abs(this.y - this.yOrig));

      // Wrap around edges left/tight edges
      this.game.world.wrap(this, this.width / 2, false, true, false);
    },

    // Reset placement custom
    resetPlacement: function resetPlacement(x, y) {
      this.reset(x, y);
      this.yOrig = this.y;
      this.yChange = 0;
    }
  });
})();