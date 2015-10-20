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
    Phaser.Sprite.call(this, game, x, y, "game-sprites", "main-pickle.gif");

    // Configure
    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo(0.5, 0.5);
    this.game.physics.arcade.enableBody(this);

    // Only allow for collission down
    this.body.checkCollision.up = false;
    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;

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
      // Always jump
      if (this.body.touching.down) {
        this.body.velocity.y = -700;
      }

      // Track the maximum amount that the hero has travelled
      this.yChange = Math.max(this.yChange, Math.abs(this.y - this.yOrig));

      // Wrap around edges left/tight edges
      this.game.world.wrap(this, this.width / 2, false, true, false);
    }
  });
})();